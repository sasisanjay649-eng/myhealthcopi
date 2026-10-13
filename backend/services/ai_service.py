import os
import re
import json
import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple, AsyncGenerator
import httpx
from dotenv import load_dotenv

from services.safety_service import audit_and_sanitize_response, check_for_emergency, MANDATORY_DISCLAIMER
from services.medical_search import search_trusted_medical_sources

load_dotenv()
logger = logging.getLogger("vitamind.ai")

class AIConfigurationError(Exception):
    """Raised when an AI provider key is missing, invalid, or misconfigured."""
    def __init__(self, message: str, error_code: str = "AI_API_KEY_REQUIRED", instructions: Optional[List[str]] = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.instructions = instructions or [
            "Configure an API key for OpenAI, Google Gemini, or Groq to enable live LLM intelligence.",
            "Add OPENAI_API_KEY=your_key or GEMINI_API_KEY=your_key to backend/.env",
            "Or click 'AI Settings' in the Copilot toolbar to enter your key directly."
        ]

AVAILABLE_PROVIDERS = [
    {
        "id": "openai",
        "name": "OpenAI",
        "default_model": "gpt-4o-mini",
        "models": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
        "key_hint": "Starts with sk-...",
        "env_var": "OPENAI_API_KEY",
        "doc_url": "https://platform.openai.com/api-keys"
    },
    {
        "id": "gemini",
        "name": "Google Gemini",
        "default_model": "gemini-flash-lite-latest",
        "models": ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3.8-flash"],
        "key_hint": "Starts with AIza... or AQ...",
        "env_var": "GEMINI_API_KEY",
        "doc_url": "https://aistudio.google.com/app/apikey"
    },
    {
        "id": "groq",
        "name": "Groq (Ultra-Fast LLaMA)",
        "default_model": "llama-3.3-70b-versatile",
        "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        "key_hint": "Starts with gsk_...",
        "env_var": "GROQ_API_KEY",
        "doc_url": "https://console.groq.com/keys"
    },
    {
        "id": "ollama",
        "name": "Local Ollama / OpenAI-Compatible",
        "default_model": "llama3",
        "models": ["llama3", "mistral", "phi3", "custom"],
        "key_hint": "Default endpoint: http://localhost:11434/v1",
        "env_var": "AI_ENDPOINT_URL",
        "doc_url": "https://ollama.ai"
    }
]

def get_default_model(provider: str) -> str:
    p = (provider or "").lower()
    if p in ["gemini", "free"]:
        return "gemini-flash-lite-latest"

    elif p in ["openai", "external"]:
        return "gpt-4o-mini"
    elif p == "groq":
        return "llama-3.3-70b-versatile"
    elif p == "ollama":
        return "llama3"
    return "gpt-4o-mini"

def _resolve_initial_provider_and_key() -> Tuple[str, str, str, float, str]:
    """Inspects environment variables to choose the best available provider."""
    env_provider = os.getenv("AI_PROVIDER", "").strip().lower()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip() or os.getenv("AI_API_KEY", "").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    endpoint = os.getenv("AI_ENDPOINT_URL", "").strip()
    try:
        temp = float(os.getenv("AI_TEMPERATURE", "0.7"))
    except Exception:
        temp = 0.7

    if env_provider == "gemini" and gemini_key:
        return "gemini", gemini_key, model or "gemini-2.0-flash", temp, endpoint
    elif env_provider == "groq" and groq_key:
        return "groq", groq_key, model or "llama-3.3-70b-versatile", temp, endpoint
    elif env_provider == "ollama":
        return "ollama", "ollama", model or "llama3", temp, endpoint or "http://127.0.0.1:11434/v1/chat/completions"
    elif env_provider in ["openai", "external"] and openai_key:
        return "openai", openai_key, model or "gpt-4o-mini", temp, endpoint
    
    # Auto-detect by existing keys
    if openai_key:
        return "openai", openai_key, model or "gpt-4o-mini", temp, endpoint
    elif gemini_key:
        return "gemini", gemini_key, model or "gemini-2.0-flash", temp, endpoint
    elif groq_key:
        return "groq", groq_key, model or "llama-3.3-70b-versatile", temp, endpoint

    # Fallback to configured or default provider with empty key
    chosen_provider = env_provider if env_provider in ["openai", "gemini", "groq", "ollama"] else "openai"
    return chosen_provider, "", model or get_default_model(chosen_provider), temp, endpoint

init_provider, init_key, init_model, init_temp, init_endpoint = _resolve_initial_provider_and_key()

_CONFIG_CACHE = {
    "provider": init_provider,
    "api_key": init_key,
    "model": init_model,
    "temperature": init_temp,
    "endpoint_url": init_endpoint
}


def mask_api_key(key: str) -> Optional[str]:
    if not key:
        return None
    k = key.strip()
    if len(k) <= 8:
        return "***"
    return f"{k[:4]}...{k[-4:]}"

def get_current_ai_config() -> Dict[str, Any]:
    global _CONFIG_CACHE
    provider = _CONFIG_CACHE["provider"]
    api_key = _CONFIG_CACHE["api_key"]
    is_configured = bool(api_key) or provider == "ollama"
    return {
        "provider": provider,
        "model": _CONFIG_CACHE["model"] or get_default_model(provider),
        "temperature": _CONFIG_CACHE.get("temperature", 0.7),
        "is_configured": is_configured,
        "masked_api_key": mask_api_key(api_key),
        "endpoint_url": _CONFIG_CACHE.get("endpoint_url", ""),
        "available_providers": AVAILABLE_PROVIDERS
    }

def update_ai_config(
    provider: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    endpoint_url: Optional[str] = None
) -> Dict[str, Any]:
    global _CONFIG_CACHE
    provider_clean = (provider or "openai").lower()
    _CONFIG_CACHE["provider"] = provider_clean
    if api_key is not None:
        _CONFIG_CACHE["api_key"] = api_key.strip()
    if model is not None and model.strip():
        _CONFIG_CACHE["model"] = model.strip()
    else:
        _CONFIG_CACHE["model"] = get_default_model(provider_clean)
    if temperature is not None:
        _CONFIG_CACHE["temperature"] = max(0.0, min(1.0, float(temperature)))
    if endpoint_url is not None:
        _CONFIG_CACHE["endpoint_url"] = endpoint_url.strip()

    # Persist to .env file safely
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        updates = {
            "AI_PROVIDER": _CONFIG_CACHE["provider"],
            "AI_MODEL": _CONFIG_CACHE["model"],
            "AI_TEMPERATURE": str(_CONFIG_CACHE["temperature"]),
            "AI_ENDPOINT_URL": _CONFIG_CACHE["endpoint_url"]
        }
        if api_key is not None:
            updates["AI_API_KEY"] = _CONFIG_CACHE["api_key"]
            if provider_clean == "openai":
                updates["OPENAI_API_KEY"] = _CONFIG_CACHE["api_key"]
            elif provider_clean == "gemini":
                updates["GEMINI_API_KEY"] = _CONFIG_CACHE["api_key"]
            elif provider_clean == "groq":
                updates["GROQ_API_KEY"] = _CONFIG_CACHE["api_key"]

        new_lines = []
        keys_set = set()
        for line in lines:
            line_strip = line.strip()
            matched = False
            for k, v in updates.items():
                if line_strip.startswith(f"{k}="):
                    new_lines.append(f"{k}={v}\n")
                    keys_set.add(k)
                    matched = True
                    break
            if not matched:
                new_lines.append(line)

        for k, v in updates.items():
            if k not in keys_set:
                new_lines.append(f"{k}={v}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        logger.warning(f"Could not persist AI config to .env: {e}")

    return get_current_ai_config()

def parse_structured_sections(raw_text: str, default_summary: str = "VitaMind AI Health Synthesis") -> Dict[str, Any]:
    """
    Extracts structured healthcare sections from model output:
    - SUMMARY
    - WHAT YOUR DATA SHOWS
    - GENERAL INFORMATION
    - POSSIBLE NEXT STEPS
    - WHEN TO SEEK PROFESSIONAL HELP
    """
    sections = {
        "summary": "",
        "what_your_data_shows": "",
        "general_information": "",
        "possible_next_steps": [],
        "when_to_seek_professional_help": ""
    }

    if not raw_text or not raw_text.strip():
        sections["summary"] = default_summary
        return sections

    parts = re.split(r'###\s+', raw_text)
    if len(parts) > 1:
        for p in parts:
            if not p.strip():
                continue
            lines = p.strip().split('\n', 1)
            header = lines[0].strip().upper()
            content = lines[1].strip() if len(lines) > 1 else ""

            if "SUMMARY" in header:
                sections["summary"] = content
            elif "DATA" in header or "YOUR DATA" in header:
                sections["what_your_data_shows"] = content
            elif "GENERAL" in header or "INFORMATION" in header or "CONTEXT" in header:
                sections["general_information"] = content
            elif "STEP" in header or "NEXT" in header or "RECOMMENDATION" in header:
                steps = [re.sub(r'^[-\*•\d\.\s]+', '', s).strip() for s in content.split('\n') if s.strip()]
                sections["possible_next_steps"] = [s for s in steps if s]
            elif "HELP" in header or "SEEK" in header or "DOCTOR" in header or "PROFESSIONAL" in header:
                sections["when_to_seek_professional_help"] = content

    if not sections["summary"]:
        paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
        if paragraphs:
            sections["summary"] = paragraphs[0][:280]
            if len(paragraphs) > 1:
                sections["general_information"] = "\n\n".join(paragraphs[1:3])
        else:
            sections["summary"] = raw_text[:200]

    if not sections["possible_next_steps"]:
        bullet_lines = [
            re.sub(r'^[-\*•\d\.\s]+', '', line).strip()
            for line in raw_text.split("\n")
            if line.strip().startswith(('-', '*', '•', '1.', '2.', '3.'))
        ]
        if bullet_lines:
            sections["possible_next_steps"] = bullet_lines[:5]

    return sections

def build_health_system_prompt(
    user_profile: Dict[str, Any],
    health_context: Dict[str, Any],
    sources: List[Dict[str, Any]]
) -> str:
    """
    Constructs a comprehensive clinical health-coaching system instruction
    anchored firmly in the authenticated user's profile and tracked health metrics.
    """
    name = user_profile.get("name") or "User"
    age = user_profile.get("age") or "Not specified"
    gender = user_profile.get("gender") or "Not specified"
    height = user_profile.get("height")
    height_unit = user_profile.get("height_unit", "cm")
    weight = user_profile.get("weight")
    weight_unit = user_profile.get("weight_unit", "kg")
    goal = user_profile.get("health_goal") or "General vitality and wellness"
    activity = user_profile.get("activity_level") or "Not specified"
    allergies = user_profile.get("allergies") or "None reported"
    medications = user_profile.get("current_medications") or "None reported"
    health_issue = user_profile.get("health_issue") or "None reported"

    bmi_str = "Not calculated"
    if height and weight:
        try:
            h_meters = float(height) / 100.0 if height_unit == "cm" else float(height) * 0.0254
            w_kg = float(weight) if weight_unit == "kg" else float(weight) * 0.453592
            if h_meters > 0:
                bmi_val = round(w_kg / (h_meters ** 2), 1)
                bmi_str = f"{bmi_val} kg/m²"
        except Exception:
            pass

    sleep_avg = health_context.get("sleep_avg", "N/A")
    steps_avg = health_context.get("steps_avg", "N/A")
    bpm_avg = health_context.get("heart_rate_avg", "N/A")
    water_avg = health_context.get("water_avg", "N/A")
    exercise_avg = health_context.get("exercise_avg", "N/A")
    stress_avg = health_context.get("stress_avg", "N/A")
    wellness_score = health_context.get("wellness_score", "N/A")
    active_meds = health_context.get("current_active_medications", [])
    if active_meds:
        medications = ", ".join(active_meds)

    sources_text = ""
    if sources:
        sources_text = "\nVerified Medical Evidence Sources:\n" + "\n".join(
            [f"- {s.get('source_name', 'Medical Guideline')}: {s.get('title', '')} ({s.get('url', '')})" for s in sources]
        )

    system_instruction = f"""You are VitaMind AI, an intelligent, compassionate, and evidence-grounded Personal Health & Wellness Copilot.

AUTHENTICATED USER HEALTH PROFILE:
- Name: {name}
- Age: {age} | Gender: {gender}
- Height: {height or 'N/A'} {height_unit} | Weight: {weight or 'N/A'} {weight_unit} | Calculated BMI: {bmi_str}
- Primary Health Goal: {goal}
- Activity Level: {activity}
- Dietary Preferences / Medical Conditions: {health_issue}
- Known Allergies: {allergies}
- Current Active Medications: {medications}

RECENT HEALTH TRACKING LOGS (7–14 Day Averages):
- Nightly Sleep: {sleep_avg} hours
- Daily Steps: {steps_avg} steps
- Resting Heart Rate: {bpm_avg} bpm
- Daily Hydration: {water_avg} L
- Active Daily Exercise: {exercise_avg} mins
- Average Stress Level: {stress_avg} / 10
- Overall Wellness Score: {wellness_score} / 100
{sources_text}

COACHING CAPABILITIES & INSTRUCTIONS:
1. Provide thoughtful, personalized health coaching covering:
   - General wellness education & healthy habit formation.
   - Sleep optimization & circadian rhythm guidance.
   - Stress resilience, breathing, and active recovery techniques.
   - Practical nutrition guidance, meal-planning ideas, and hydration tips.
   - Beginner to intermediate fitness & activity planning tailored to their activity level and goals.
   - Goal setting, progress reviews, and explaining health concepts in plain language.
2. Directly reference and correlate the user's specific health profile (age, goal, sleep, activity, hydration) when relevant. Do NOT invent missing health information.
3. If important information is missing (such as dietary restrictions, schedule constraints, or specific injuries), ask friendly follow-up questions to tailor future recommendations.
4. Provide structured, actionable answers with clear next steps.
5. Format your response cleanly using Markdown headers:
   ### SUMMARY
   [Concise core synthesis tailored to {name}]

   ### WHAT YOUR DATA SHOWS
   [Specific contextual analysis referencing their metrics, goals, or schedule]

   ### GENERAL INFORMATION
   [Evidence-based wellness context and principles]

   ### POSSIBLE NEXT STEPS
   - [Clear, actionable habit or milestone 1]
   - [Actionable milestone 2]
   - [Actionable milestone 3]

   ### WHEN TO SEEK PROFESSIONAL HELP
   [Guidance on when to consult a qualified doctor or healthcare specialist]

SAFETY & EMERGENCY DIRECTIVES:
- VitaMind AI provides educational wellness guidance and does NOT diagnose diseases, prescribe medications, or alter medical dosages.
- If the user describes acute emergency symptoms (severe chest pain or pressure, acute shortness of breath, sudden numbness or slurred speech, uncontrollable bleeding), urge them to immediately call regional emergency medical services (911 / 112 / 999) and seek immediate in-person emergency care.
"""
    return system_instruction

# -------------------------------------------------------------
# Streaming & Non-Streaming Generation Core
# -------------------------------------------------------------

async def stream_copilot_turn(
    user_query: str,
    health_context: Dict[str, Any],
    user_profile: Dict[str, Any],
    history: List[Dict[str, str]],
    model_override: Optional[str] = None,
    temperature_override: Optional[float] = None
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Asynchronous SSE stream generator for live AI responses.
    Yields event dictionaries with keys:
    - {'type': 'status', 'data': {'status': '...', 'message': '...'}}
    - {'type': 'token', 'data': {'delta': '...'}}
    - {'type': 'done', 'data': {...}}
    - {'type': 'error', 'data': {...}}
    """
    config = get_current_ai_config()
    provider = config["provider"]
    api_key = _CONFIG_CACHE.get("api_key", "").strip()
    model = model_override or config["model"] or get_default_model(provider)
    temperature = temperature_override if temperature_override is not None else config.get("temperature", 0.7)
    endpoint = _CONFIG_CACHE.get("endpoint_url", "").strip()

    # Medical emergency pre-check
    is_emergency_pre, emergency_msg = check_for_emergency(user_query)
    if is_emergency_pre:
        yield {
            "type": "status",
            "data": {"status": "emergency_detected", "message": "Emergency alert protocol activated"}
        }
        emergency_content = (
            f"### URGENT MEDICAL NOTICE\n\n{emergency_msg}\n\n"
            "### IMMEDIATE ACTION RECOMMENDED\n"
            "- Call your regional emergency services immediately (911 / 112 / 999).\n"
            "- Do not drive yourself if experiencing chest tightness, sudden numbness, or shortness of breath.\n"
            "- Alert someone nearby who can provide immediate assistance while emergency teams arrive."
        )
        for token in emergency_content.split(" "):
            yield {"type": "token", "data": {"delta": token + " "}}
        yield {
            "type": "done",
            "data": {
                "content": emergency_content,
                "summary": "Urgent Medical Alert: Immediate healthcare evaluation recommended.",
                "structured_data": {
                    "summary": "Urgent Medical Alert: Immediate healthcare evaluation recommended.",
                    "what_your_data_shows": "Symptoms require immediate medical evaluation.",
                    "general_information": emergency_msg,
                    "possible_next_steps": ["Contact emergency medical services immediately"],
                    "when_to_seek_professional_help": "Seek emergency medical care immediately without delay."
                },
                "sources": [],
                "is_emergency": True,
                "model_name": "VitaMind Safety Protocol"
            }
        }
        return

    # Check credentials
    if not api_key and provider != "ollama":
        error_msg = f"No API key configured for {provider.title()}. Please set your API key in AI Settings or backend/.env."
        yield {
            "type": "error",
            "data": {
                "error_code": "AI_API_KEY_REQUIRED",
                "message": "AI API Key Required",
                "detail": error_msg,
                "provider": provider,
                "instructions": [
                    f"Get an API key from {AVAILABLE_PROVIDERS[0]['name'] if provider=='openai' else provider.title()}",
                    "Add OPENAI_API_KEY=your_key or GEMINI_API_KEY=your_key to backend/.env",
                    "Or open the AI Settings modal in the Copilot top bar to configure it directly."
                ]
            }
        }
        return

    yield {
        "type": "status",
        "data": {"status": "searching_medical_sources", "message": "Searching trusted medical literature..."}
    }

    sources = search_trusted_medical_sources(user_query, limit=3)

    yield {
        "type": "status",
        "data": {"status": "connecting_llm", "message": f"Connecting to live AI model ({model})..."}
    }

    system_prompt = build_health_system_prompt(user_profile, health_context, sources)
    accumulated_chunks = []

    try:
        if provider in ["gemini", "free"]:
            # Google Gemini Streaming via SSE
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={api_key}"
            
            contents = []
            for h in history[-6:]:
                role = "user" if h.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
            contents.append({"role": "user", "parts": [{"text": f"{system_prompt}\n\nUser Question / Request: {user_query}"}]})

            gemini_payload = {
                "contents": contents,
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": 2048
                }
            }

            async with httpx.AsyncClient(timeout=45.0) as client:
                async with client.stream("POST", gemini_url, json=gemini_payload) as response:
                    if response.status_code != 200:
                        err_text = await response.aread()
                        logger.error(f"Gemini Streaming Error ({response.status_code}): {err_text.decode('utf-8', errors='ignore')}")
                        raise RuntimeError(f"Gemini API returned HTTP {response.status_code}. Please verify your GEMINI_API_KEY.")

                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if not data_str:
                            continue
                        try:
                            parsed = json.loads(data_str)
                            candidates = parsed.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                for pt in parts:
                                    delta = pt.get("text", "")
                                    if delta:
                                        accumulated_chunks.append(delta)
                                        yield {"type": "token", "data": {"delta": delta}}
                        except json.JSONDecodeError:
                            continue

        else:
            # OpenAI / Groq / Ollama / OpenAI-Compatible Streaming
            if provider == "groq":
                endpoint_url = endpoint or "https://api.groq.com/openai/v1/chat/completions"
            elif provider == "ollama":
                endpoint_url = endpoint or "http://127.0.0.1:11434/v1/chat/completions"
            else:
                endpoint_url = endpoint or "https://api.openai.com/v1/chat/completions"

            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-6:]:
                messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": user_query})

            headers = {"Content-Type": "application/json"}
            if api_key and provider != "ollama":
                headers["Authorization"] = f"Bearer {api_key}"

            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "stream": True,
                "max_tokens": 2048
            }

            async with httpx.AsyncClient(timeout=45.0) as client:
                async with client.stream("POST", endpoint_url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        err_text = await response.aread()
                        err_msg = err_text.decode("utf-8", errors="ignore")
                        logger.error(f"{provider.title()} API Error ({response.status_code}): {err_msg}")
                        try:
                            parsed_err = json.loads(err_msg)
                            msg = parsed_err.get("error", {}).get("message", err_msg)
                        except Exception:
                            msg = err_msg
                        raise RuntimeError(f"{provider.title()} API returned HTTP {response.status_code}: {msg}")

                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            parsed = json.loads(data_str)
                            choices = parsed.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {}).get("content", "")
                                if delta:
                                    accumulated_chunks.append(delta)
                                    yield {"type": "token", "data": {"delta": delta}}
                        except json.JSONDecodeError:
                            continue

    except Exception as e:
        logger.error(f"Live streaming error ({provider}): {e}", exc_info=True)
        yield {
            "type": "error",
            "data": {
                "error_code": "LIVE_AI_STREAM_ERROR",
                "message": f"Connection to {provider.title()} failed",
                "detail": str(e),
                "instructions": [
                    "Verify your API key in AI Settings.",
                    "Check network connectivity or rate limits.",
                    "Ensure your provider account has active credits."
                ]
            }
        }
        return

    full_text = "".join(accumulated_chunks)
    audit_res = audit_and_sanitize_response(full_text, user_query)
    sanitized_text = audit_res["sanitized_content"]
    is_emergency = audit_res["is_emergency"]
    structured = parse_structured_sections(sanitized_text)

    yield {
        "type": "done",
        "data": {
            "content": sanitized_text,
            "summary": structured.get("summary", ""),
            "structured_data": structured,
            "sources": sources,
            "is_emergency": is_emergency,
            "model_name": f"{provider.title()} ({model})"
        }
    }

async def generate_copilot_turn(
    user_query: str,
    health_context: Dict[str, Any],
    user_profile: Dict[str, Any],
    history: List[Dict[str, str]],
    model_override: Optional[str] = None,
    temperature_override: Optional[float] = None
) -> Dict[str, Any]:
    """
    Non-streaming synchronous AI generation for fallback and standard API calls.
    Directly queries the configured live LLM model.
    """
    config = get_current_ai_config()
    provider = config["provider"]
    api_key = _CONFIG_CACHE.get("api_key", "").strip()
    model = model_override or config["model"] or get_default_model(provider)
    temperature = temperature_override if temperature_override is not None else config.get("temperature", 0.7)
    endpoint = _CONFIG_CACHE.get("endpoint_url", "").strip()

    # Emergency pre-check
    is_emergency_pre, emergency_msg = check_for_emergency(user_query)
    if is_emergency_pre:
        return {
            "content": f"### URGENT MEDICAL NOTICE\n\n{emergency_msg}",
            "summary": "Urgent Medical Alert: Immediate healthcare evaluation recommended.",
            "what_your_data_shows": "Your inquiry contains symptoms frequently associated with acute emergencies.",
            "general_information": emergency_msg,
            "possible_next_steps": ["Call emergency medical services immediately (911 / 112 / 999)"],
            "when_to_seek_professional_help": "Seek emergency medical care immediately without delay.",
            "sources": [],
            "is_emergency": True,
            "is_demo_ai": False,
            "model_name": "VitaMind Safety Protocol"
        }

    if not api_key and provider != "ollama":
        raise AIConfigurationError(
            f"No API key configured for {provider.title()}. Please set your API key in AI Settings or backend/.env."
        )

    sources = search_trusted_medical_sources(user_query, limit=3)
    system_prompt = build_health_system_prompt(user_profile, health_context, sources)

    if provider in ["gemini", "free"]:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        contents = []
        for h in history[-6:]:
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": f"{system_prompt}\n\nUser Question: {user_query}"}]})

        gemini_payload = {
            "contents": contents,
            "generationConfig": {"temperature": temperature, "maxOutputTokens": 2048}
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(gemini_url, json=gemini_payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    else:
        if provider == "groq":
            endpoint_url = endpoint or "https://api.groq.com/openai/v1/chat/completions"
        elif provider == "ollama":
            endpoint_url = endpoint or "http://127.0.0.1:11434/v1/chat/completions"
        else:
            endpoint_url = endpoint or "https://api.openai.com/v1/chat/completions"

        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": user_query})

        headers = {"Content-Type": "application/json"}
        if api_key and provider != "ollama":
            headers["Authorization"] = f"Bearer {api_key}"

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 2048
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(endpoint_url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"{provider.title()} API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

    audit_res = audit_and_sanitize_response(raw_text, user_query)
    sanitized_text = audit_res["sanitized_content"]
    is_emergency = audit_res["is_emergency"]
    structured = parse_structured_sections(sanitized_text)

    return {
        "content": sanitized_text,
        "summary": structured.get("summary", ""),
        "what_your_data_shows": structured.get("what_your_data_shows", ""),
        "general_information": structured.get("general_information", ""),
        "possible_next_steps": structured.get("possible_next_steps", []),
        "when_to_seek_professional_help": structured.get("when_to_seek_professional_help", ""),
        "sources": sources,
        "is_emergency": is_emergency,
        "is_demo_ai": False,
        "model_name": f"{provider.title()} ({model})"
    }

async def test_live_ai_connection(
    provider: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    endpoint_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Directly pings the target live AI model to verify API key and network connectivity.
    """
    config = get_current_ai_config()
    p = (provider or config["provider"]).lower()
    key = api_key if api_key is not None else _CONFIG_CACHE.get("api_key", "").strip()
    m = model or config["model"] or get_default_model(p)
    endpoint = endpoint_url if endpoint_url is not None else _CONFIG_CACHE.get("endpoint_url", "").strip()

    if not key and p != "ollama":
        return {
            "success": False,
            "message": f"API key is required to connect to {p.title()}."
        }

    start_time = time.time()
    try:
        if p in ["gemini", "free"]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}"
            payload = {
                "contents": [{"role": "user", "parts": [{"text": "Reply only with: VitaMind Live Connection Verified."}]}],
                "generationConfig": {"maxOutputTokens": 30}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code != 200:
                    err_msg = resp.json().get("error", {}).get("message", resp.text)
                    return {"success": False, "message": f"Google Gemini Error ({resp.status_code}): {err_msg}"}
                data = resp.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                latency = int((time.time() - start_time) * 1000)
                return {
                    "success": True,
                    "message": f"Successfully connected to Google Gemini ({m})!",
                    "latency_ms": latency,
                    "model_name": m,
                    "sample_reply": reply
                }

        elif p in ["openai", "external"]:
            ep = endpoint or "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": m,
                "messages": [{"role": "user", "content": "Reply only with: VitaMind Live Connection Verified."}],
                "max_tokens": 25
            }
            headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(ep, headers=headers, json=payload)
                if resp.status_code != 200:
                    err_msg = resp.json().get("error", {}).get("message", resp.text)
                    return {"success": False, "message": f"OpenAI Error ({resp.status_code}): {err_msg}"}
                data = resp.json()
                reply = data["choices"][0]["message"]["content"].strip()
                latency = int((time.time() - start_time) * 1000)
                return {
                    "success": True,
                    "message": f"Successfully connected to OpenAI ({m})!",
                    "latency_ms": latency,
                    "model_name": m,
                    "sample_reply": reply
                }

        elif p == "groq":
            ep = endpoint or "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": m,
                "messages": [{"role": "user", "content": "Reply only with: VitaMind Live Connection Verified."}],
                "max_tokens": 25
            }
            headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(ep, headers=headers, json=payload)
                if resp.status_code != 200:
                    err_msg = resp.json().get("error", {}).get("message", resp.text)
                    return {"success": False, "message": f"Groq Error ({resp.status_code}): {err_msg}"}
                data = resp.json()
                reply = data["choices"][0]["message"]["content"].strip()
                latency = int((time.time() - start_time) * 1000)
                return {
                    "success": True,
                    "message": f"Successfully connected to Groq ({m})!",
                    "latency_ms": latency,
                    "model_name": m,
                    "sample_reply": reply
                }

        elif p == "ollama":
            ep = endpoint or "http://127.0.0.1:11434/v1/chat/completions"
            payload = {
                "model": m,
                "messages": [{"role": "user", "content": "Ping"}],
                "max_tokens": 20
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(ep, json=payload)
                if resp.status_code != 200:
                    return {"success": False, "message": f"Ollama HTTP {resp.status_code}. Is your local Ollama server running?"}
                latency = int((time.time() - start_time) * 1000)
                return {
                    "success": True,
                    "message": f"Successfully connected to local Ollama ({m})!",
                    "latency_ms": latency,
                    "model_name": m,
                    "sample_reply": "Ollama Live Connection Verified."
                }

        return {"success": False, "message": f"Unsupported provider: {provider}"}
    except Exception as e:
        return {"success": False, "message": f"Connection failed: {str(e)}"}
