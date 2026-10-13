import re
from typing import Dict, Any, Tuple, List

MANDATORY_DISCLAIMER = (
    "VitaMind AI provides general health and wellness information for educational purposes. "
    "It does not diagnose conditions, prescribe medicines, or replace professional medical advice, "
    "diagnosis, or treatment. Consult a qualified healthcare professional before starting, "
    "stopping, or changing any medication."
)

EMERGENCY_WARNING = (
    "CRITICAL NOTICE: This information cannot replace urgent medical evaluation. "
    "If you or someone with you is experiencing severe symptoms such as intense chest pressure, "
    "shortness of breath, sudden numbness, or loss of consciousness, please seek immediate "
    "professional medical assistance or contact your local emergency service (911 / 112 / 999) without delay."
)

EMERGENCY_PATTERNS = [
    r"\bchest\s+(?:pain|pressure|tightness|crushing)\b",
    r"\bshortness\s+of\s+breath\b",
    r"\bdifficulty\s+breathing\b",
    r"\bcannot\s+breathe\b",
    r"\bheart\s+attack\b",
    r"\bstroke\b",
    r"\bface\s+drooping\b",
    r"\bspeech\s+slurred\b",
    r"\bloss\s+of\s+consciousness\b",
    r"\bpassed\s+out\b",
    r"\bunresponsive\b",
    r"\bsevere\s+bleeding\b",
    r"\bthrowing\s+up\s+blood\b",
    r"\bcoughing\s+up\s+blood\b",
    r"\bsuicid(?:e|al)\b",
    r"\boverdose\b",
    r"\banaphylaxis\b",
    r"\bthroat\s+closing\b",
    r"\bsevere\s+head\s+injury\b",
]

DIAGNOSTIC_ASSERTION_PATTERNS = [
    r"\byou\s+(?:definitely\s+)?have\s+(?:a\s+)?(?:heart attack|diabetes|cancer|stroke|pneumonia|infection|appendicitis|covid|ulcer)\b",
    r"\bmy\s+diagnosis\s+is\b",
    r"\bi\s+diagnose\s+you\s+with\b",
    r"\bthis\s+is\s+a\s+confirmed\s+case\s+of\b",
]

PRESCRIPTION_DOSAGE_PATTERNS = [
    r"\btake\s+\d+\s*(?:mg|ml|tablets|pills|capsules)\b",
    r"\byou\s+must\s+take\s+\b",
    r"\bi\s+prescribe\b",
    r"\bdosage:\s*\d+\s*(?:mg|g|ml)\b",
    r"\btake\s+this\s+tablet\b",
    r"\bstart\s+taking\s+[A-Za-z]+\s+\d+\s*times\b",
    r"\bstop\s+taking\s+your\s+prescribed\b",
]

def check_for_emergency(text: str) -> Tuple[bool, str]:
    """
    Checks user queries or AI responses for signs of a medical emergency.
    Returns (is_emergency, warning_message).
    """
    if not text:
        return False, ""
    
    text_lower = text.lower()
    for pattern in EMERGENCY_PATTERNS:
        if re.search(pattern, text_lower):
            return True, EMERGENCY_WARNING
    return False, ""

def audit_and_sanitize_response(ai_text: str, user_query: str = "") -> Dict[str, Any]:
    """
    Audits the generated response for safety violations (diagnosis, prescription, dosage),
    rewrites unsafe statements, and appends appropriate disclaimers and emergency flags.
    """
    is_emergency, emergency_msg = check_for_emergency(user_query + " " + ai_text)
    
    violations = []
    sanitized_text = ai_text

    # Check for definitive diagnosis claims
    for pattern in DIAGNOSTIC_ASSERTION_PATTERNS:
        if re.search(pattern, sanitized_text, re.IGNORECASE):
            violations.append("unauthorized_diagnosis")
            sanitized_text = re.sub(
                pattern,
                "these symptoms can be associated with several potential health conditions",
                sanitized_text,
                flags=re.IGNORECASE
            )

    # Check for direct prescriptions or specific dosages
    for pattern in PRESCRIPTION_DOSAGE_PATTERNS:
        if re.search(pattern, sanitized_text, re.IGNORECASE):
            violations.append("unauthorized_prescription_or_dosage")
            sanitized_text = re.sub(
                pattern,
                "dosage and treatment must only be evaluated and prescribed by a licensed physician or pharmacist",
                sanitized_text,
                flags=re.IGNORECASE
            )

    # Enforce educational reframing if violations found
    if "unauthorized_diagnosis" in violations:
        sanitized_text += (
            "\n\n*Note: VitaMind AI cannot diagnose illnesses. The possibilities described above are purely educational. "
            "Please speak with a healthcare professional for clinical testing and diagnosis.*"
        )
        
    if "unauthorized_prescription_or_dosage" in violations:
        sanitized_text += (
            "\n\n*Safety Advisory: VitaMind AI does not prescribe medicines or determine dosages. "
            "Any therapeutic choices must be discussed with your physician or pharmacist.*"
        )

    # Ensure disclaimer is present
    if MANDATORY_DISCLAIMER not in sanitized_text:
        sanitized_text = f"{sanitized_text.strip()}\n\n---\n**Medical Disclaimer:** {MANDATORY_DISCLAIMER}"

    return {
        "sanitized_content": sanitized_text,
        "is_emergency": is_emergency,
        "emergency_warning": emergency_msg if is_emergency else None,
        "violations_intercepted": violations,
        "disclaimer": MANDATORY_DISCLAIMER
    }
