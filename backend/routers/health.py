from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user
from services.health_analysis import analyze_records, SAMPLE_DEMO_RECORDS

router = APIRouter(prefix="/api/health", tags=["Health Tracking"])

@router.post("", response_model=schemas.HealthRecordResponse, status_code=status.HTTP_201_CREATED)
def create_health_record(
    payload: schemas.HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if record for this date already exists for this user, if so update it or create new
    existing = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id,
        models.HealthRecord.date == payload.date
    ).first()

    if existing:
        for k, v in payload.dict().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return schemas.HealthRecordResponse.from_orm(existing)

    record = models.HealthRecord(
        user_id=current_user.id,
        **payload.dict()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return schemas.HealthRecordResponse.from_orm(record)

@router.get("", response_model=List[schemas.HealthRecordResponse])
def get_health_records(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    records = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id
    ).order_by(models.HealthRecord.date.desc()).all()
    return [schemas.HealthRecordResponse.from_orm(r) for r in records]

@router.put("/{record_id}", response_model=schemas.HealthRecordResponse)
def update_health_record(
    record_id: int,
    payload: schemas.HealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    record = db.query(models.HealthRecord).filter(
        models.HealthRecord.id == record_id,
        models.HealthRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Health record not found.")

    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            setattr(record, k, v)

    db.commit()
    db.refresh(record)
    return schemas.HealthRecordResponse.from_orm(record)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    record = db.query(models.HealthRecord).filter(
        models.HealthRecord.id == record_id,
        models.HealthRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Health record not found.")

    db.delete(record)
    db.commit()
    return None

@router.get("/summary", response_model=schemas.HealthSummaryResponse)
def get_health_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    records = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id
    ).order_by(models.HealthRecord.date.asc()).all()

    analysis = analyze_records(records)
    return schemas.HealthSummaryResponse(
        wellness_score=analysis["wellness_score"],
        sleep_avg=analysis["sleep_avg"],
        steps_avg=analysis["steps_avg"],
        heart_rate_avg=analysis["heart_rate_avg"],
        water_avg=analysis["water_avg"],
        exercise_avg=analysis["exercise_avg"],
        stress_avg=analysis["stress_avg"],
        weight_latest=analysis["weight_latest"],
        trend_status=analysis["trend_status"],
        sleep_status=analysis["sleep_status"],
        activity_status=analysis["activity_status"],
        is_demo_data=analysis["is_demo_data"],
        recent_records_count=analysis["records_count"]
    )

@router.get("/trends")
def get_health_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    records = db.query(models.HealthRecord).filter(
        models.HealthRecord.user_id == current_user.id
    ).order_by(models.HealthRecord.date.asc()).all()

    analysis = analyze_records(records)
    return {
        "trends": analysis["trends"],
        "patterns": analysis["patterns"],
        "insights": analysis["insights"],
        "is_demo_data": analysis["is_demo_data"],
        "wellness_score": analysis["wellness_score"],
        "summary": {
            "sleep_avg": analysis["sleep_avg"],
            "steps_avg": analysis["steps_avg"],
            "heart_rate_avg": analysis["heart_rate_avg"],
            "water_avg": analysis["water_avg"],
            "exercise_avg": analysis["exercise_avg"],
            "stress_avg": analysis["stress_avg"],
            "weight_latest": analysis["weight_latest"]
        }
    }

@router.post("/seed-demo")
def seed_demo_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Populates 14 realistic sample records into the user's account for testing.
    """
    created_records = []
    for item in SAMPLE_DEMO_RECORDS:
        existing = db.query(models.HealthRecord).filter(
            models.HealthRecord.user_id == current_user.id,
            models.HealthRecord.date == item["date"]
        ).first()

        if existing:
            for k, v in item.items():
                setattr(existing, k, v)
            created_records.append(existing)
        else:
            rec = models.HealthRecord(
                user_id=current_user.id,
                **item
            )
            db.add(rec)
            created_records.append(rec)

    db.commit()
    return {"message": "Successfully seeded demo health records.", "count": len(created_records)}

# Sleep endpoints
@router.post("/sleep", response_model=schemas.SleepRecordResponse)
def add_sleep_record(
    payload: schemas.SleepRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rec = models.SleepRecord(user_id=current_user.id, **payload.dict())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return schemas.SleepRecordResponse.from_orm(rec)

@router.get("/sleep", response_model=List[schemas.SleepRecordResponse])
def get_sleep_records(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.SleepRecord).filter(
        models.SleepRecord.user_id == current_user.id
    ).order_by(models.SleepRecord.date.desc()).all()

# Activity endpoints
@router.post("/activity", response_model=schemas.ActivityRecordResponse)
def add_activity_record(
    payload: schemas.ActivityRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rec = models.ActivityRecord(user_id=current_user.id, **payload.dict())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return schemas.ActivityRecordResponse.from_orm(rec)

@router.get("/activity", response_model=List[schemas.ActivityRecordResponse])
def get_activity_records(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.ActivityRecord).filter(
        models.ActivityRecord.user_id == current_user.id
    ).order_by(models.ActivityRecord.date.desc()).all()
