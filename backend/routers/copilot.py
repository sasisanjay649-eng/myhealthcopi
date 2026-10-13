import json
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
import models
import schemas
from auth import get_current_user
from services.health_analysis import analyze_records
from services.ai_service import (
    generate_copilot_turn,
    stream_copilot_turn,
    get_current_ai_config,
    update_ai_config,
    test_live_ai_connection,
    AIConfigurationError
)

logger = logging.getLogger("vitamind.copilot")
router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])


@router.get("/config", response_model=schemas.AIConfigResponse)
def get_ai_configuration(current_user: models.User = Depends(get_current_user)):
    """Returns current active AI model configuration and status."""
    return schemas.AIConfigResponse(**get_current_ai_config())

@router.post("/config", response_model=schemas.AIConfigResponse)
def set_ai_configuration(
    payload: schemas.AIConfigUpdateRequest,
    current_user: models.User = Depends(get_current_user)
):
    """Updates AI model configuration and persists to environment."""
    updated = update_ai_config(
        provider=payload.provider,
        api_key=payload.api_key,
        model=payload.model,
        temperature=payload.temperature,
        endpoint_url=payload.endpoint_url
    )
    return schemas.AIConfigResponse(**updated)

@router.post("/test-connection", response_model=schemas.AITestConnectionResponse)
async def test_ai_connection(
    payload: schemas.AITestConnectionRequest,
    current_user: models.User = Depends(get_current_user)
):
    """Tests live AI model connection with provided or saved settings."""
    result = await test_live_ai_connection(
        provider=payload.provider,
        api_key=payload.api_key,
        model=payload.model,
        endpoint_url=payload.endpoint_url
    )
    return schemas.AITestConnectionResponse(**result)

@router.post("/chat/stream")
async def chat_with_copilot_stream(
    payload: schemas.CopilotChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Real-time streaming endpoint for Copilot chat.
    Emits Server-Sent Events (SSE): status, token, done, error.
    """
    message_text = payload.message.strip()
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Retrieve user health data
    health_records = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id
    ).order_by(models.HealthRecord.date.asc()).all()

    analysis = analyze_records(health_records)

    # 2. Retrieve user active medications
    user_meds = db.query(models.UserMedication).filter(
        models.UserMedication.user_id == current_user.id,
        models.UserMedication.status == "active"
    ).all()
    med_names = [m.medication_name for m in user_meds]
    if med_names:
        analysis["current_active_medications"] = med_names

    # 3. Retrieve recent conversation history
    past_messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).order_by(models.ChatMessage.created_at.desc()).limit(8).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(past_messages)]

    user_profile = {
        "name": current_user.name,
        "age": current_user.age,
        "gender": current_user.gender,
        "height": current_user.height,
        "height_unit": current_user.height_unit or "cm",
        "weight": current_user.weight,
        "weight_unit": current_user.weight_unit or "kg",
        "health_goal": current_user.health_goal,
        "activity_level": current_user.activity_level,
        "allergies": current_user.allergies,
        "current_medications": ", ".join(med_names) if med_names else current_user.current_medications,
        "health_issue": current_user.health_issue
    }

    # 4. Save User Message immediately
    user_msg_record = models.ChatMessage(
        user_id=current_user.id,
        role="user",
        content=message_text
    )
    db.add(user_msg_record)
    db.commit()
    user_msg_id = user_msg_record.id

    user_id = current_user.id

    async def sse_event_generator():
        try:
            full_content = ""
            structured_data = None
            sources = []
            is_emergency = False
            model_name = ""

            async for event in stream_copilot_turn(
                user_query=message_text,
                health_context=analysis,
                user_profile=user_profile,
                history=history,
                model_override=payload.model,
                temperature_override=payload.temperature
            ):
                event_type = event.get("type")
                event_data = event.get("data", {})

                if event_type == "status":
                    yield f"event: status\ndata: {json.dumps(event_data)}\n\n"
                elif event_type == "token":
                    delta = event_data.get("delta", "")
                    full_content += delta
                    yield f"event: token\ndata: {json.dumps({'delta': delta})}\n\n"
                elif event_type == "done":
                    full_content = event_data.get("content", full_content)
                    structured_data = event_data.get("structured_data")
                    sources = event_data.get("sources", [])
                    is_emergency = event_data.get("is_emergency", False)
                    model_name = event_data.get("model_name", "")

                    # Persist assistant reply to DB
                    assistant_id = None
                    try:
                        with SessionLocal() as async_db:
                            assistant_msg = models.ChatMessage(
                                user_id=user_id,
                                role="assistant",
                                content=full_content,
                                structured_data=json.dumps(structured_data) if structured_data else None,
                                safety_flags=json.dumps({"is_emergency": is_emergency}),
                                sources=json.dumps(sources) if sources else None
                            )
                            async_db.add(assistant_msg)
                            async_db.commit()
                            async_db.refresh(assistant_msg)
                            assistant_id = assistant_msg.id
                    except Exception as db_err:
                        logger.error(f"Error persisting assistant message to DB: {db_err}")

                    done_payload = {
                        "id": assistant_id,
                        "role": "assistant",
                        "content": full_content,
                        "structured_data": structured_data,
                        "sources": sources,
                        "is_emergency": is_emergency,
                        "model_name": model_name
                    }
                    yield f"event: done\ndata: {json.dumps(done_payload)}\n\n"
                    break
                elif event_type == "error":
                    yield f"event: error\ndata: {json.dumps(event_data)}\n\n"
                    break

        except Exception as exc:
            logger.error(f"Error in SSE stream generator: {exc}", exc_info=True)
            err_payload = {
                "error_code": getattr(exc, "error_code", "UNEXPECTED_STREAM_ERROR"),
                "message": "Stream interrupted",
                "detail": str(exc),
                "instructions": getattr(exc, "instructions", ["Please retry your message."])
            }
            yield f"event: error\ndata: {json.dumps(err_payload)}\n\n"

    return StreamingResponse(
        sse_event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/chat", response_model=schemas.CopilotChatResponse)
async def chat_with_copilot(
    payload: schemas.CopilotChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Non-streaming standard endpoint for Copilot chat.
    Returns complete Copilot response.
    """
    message_text = payload.message.strip()
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Retrieve user health data
    health_records = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id
    ).order_by(models.HealthRecord.date.asc()).all()

    analysis = analyze_records(health_records)

    # 2. Retrieve user active medications
    user_meds = db.query(models.UserMedication).filter(
        models.UserMedication.user_id == current_user.id,
        models.UserMedication.status == "active"
    ).all()
    med_names = [m.medication_name for m in user_meds]
    if med_names:
        analysis["current_active_medications"] = med_names

    # 3. Retrieve recent conversation history
    past_messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).order_by(models.ChatMessage.created_at.desc()).limit(8).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(past_messages)]

    user_profile = {
        "name": current_user.name,
        "age": current_user.age,
        "gender": current_user.gender,
        "height": current_user.height,
        "height_unit": current_user.height_unit or "cm",
        "weight": current_user.weight,
        "weight_unit": current_user.weight_unit or "kg",
        "health_goal": current_user.health_goal,
        "activity_level": current_user.activity_level,
        "allergies": current_user.allergies,
        "current_medications": ", ".join(med_names) if med_names else current_user.current_medications,
        "health_issue": current_user.health_issue
    }

    try:
        result = await generate_copilot_turn(
            user_query=message_text,
            health_context=analysis,
            user_profile=user_profile,
            history=history,
            model_override=payload.model,
            temperature_override=payload.temperature
        )
    except AIConfigurationError as ai_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error_code": ai_err.error_code,
                "message": ai_err.message,
                "instructions": ai_err.instructions
            }
        )
    except Exception as e:
        logger.error(f"Error during copilot generation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )

    # Persist user message and assistant reply
    user_msg_record = models.ChatMessage(
        user_id=current_user.id,
        role="user",
        content=message_text
    )
    db.add(user_msg_record)

    structured_data = {
        "summary": result.get("summary", ""),
        "what_your_data_shows": result.get("what_your_data_shows", ""),
        "general_information": result.get("general_information", ""),
        "possible_next_steps": result.get("possible_next_steps", []),
        "when_to_seek_professional_help": result.get("when_to_seek_professional_help", "")
    }

    assistant_msg_record = models.ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=result["content"],
        structured_data=json.dumps(structured_data),
        safety_flags=json.dumps({"is_emergency": result.get("is_emergency", False)}),
        sources=json.dumps(result.get("sources", []))
    )
    db.add(assistant_msg_record)
    db.commit()
    db.refresh(assistant_msg_record)

    return schemas.CopilotChatResponse(
        id=assistant_msg_record.id,
        role="assistant",
        content=result["content"],
        reply=result["content"],
        structured_data=structured_data,
        safety_flags={"is_emergency": result.get("is_emergency", False)},
        sources=result.get("sources", []),
        created_at=assistant_msg_record.created_at,
        is_demo_ai=False,
        is_emergency=result.get("is_emergency", False),
        model_name=result.get("model_name")
    )

@router.get("/chat/history")
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).order_by(models.ChatMessage.created_at.asc()).all()

    formatted = []
    for m in messages:
        structured = json.loads(m.structured_data) if m.structured_data else None
        safety = json.loads(m.safety_flags) if m.safety_flags else None
        sources = json.loads(m.sources) if m.sources else None
        formatted.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "reply": m.content,
            "structured_data": structured,
            "safety_flags": safety,
            "sources": sources,
            "created_at": m.created_at
        })
    return formatted

@router.delete("/chat/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}

@router.get("/insights", response_model=List[schemas.AIInsightResponse])
def get_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    health_records = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id
    ).order_by(models.HealthRecord.date.asc()).all()

    analysis = analyze_records(health_records)
    
    existing = db.query(models.AIInsight).filter(
        models.AIInsight.user_id == current_user.id
    ).all()

    if not existing:
        for ins in analysis.get("insights", []):
            db_ins = models.AIInsight(
                user_id=current_user.id,
                category=ins["category"],
                title=ins["title"],
                content=ins["content"],
                score_impact=ins["score_impact"]
            )
            db.add(db_ins)
        db.commit()
        existing = db.query(models.AIInsight).filter(
            models.AIInsight.user_id == current_user.id
        ).all()

    return [schemas.AIInsightResponse.from_orm(item) for item in existing]
