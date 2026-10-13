import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user
from services.safety_service import check_for_emergency, MANDATORY_DISCLAIMER
from services.medical_search import search_trusted_medical_sources

router = APIRouter(prefix="/api/symptoms", tags=["Symptom Analysis"])

# Educational symptom possibilities mapping
SYMPTOM_POSSIBILITIES: Dict[str, Dict[str, Any]] = {
    "headache": {
        "possibilities": [
            "Tension headache due to physical stress, posture, or screen fatigue",
            "Mild dehydration or electrolyte imbalance",
            "Caffeine withdrawal or disrupted sleep schedule",
            "Sinus pressure related to environmental seasonal allergies"
        ],
        "self_care": [
            "Hydrate with 500ml of room temperature water",
            "Rest in a quiet, dimly lit room for 20–30 minutes",
            "Gently massage neck and shoulder muscles to ease tension",
            "Take regular 20-second breaks from computer monitors (20-20-20 rule)"
        ],
        "red_flags": [
            "Sudden, excruciating 'thunderclap' onset (worst headache of life)",
            "Accompanied by stiff neck, high fever, or confusion",
            "Headache accompanied by slurred speech or numbness on one side"
        ]
    },
    "fever": {
        "possibilities": [
            "Immune response to common viral respiratory infections (rhinovirus, flu)",
            "Bacterial infection requiring clinical diagnostic swabs",
            "Mild heat exhaustion or post-immunization inflammatory response"
        ],
        "self_care": [
            "Prioritize strict bed rest and replenish fluids with broths or water",
            "Dress in lightweight, breathable clothing to assist heat dissipation",
            "Monitor body temperature periodically with a clean digital thermometer"
        ],
        "red_flags": [
            "Temperature exceeding 39.4°C (103°F) or persistent for more than 72 hours",
            "Fever paired with stiff neck, light sensitivity, or skin petechial rash",
            "Extreme lethargy or difficulty waking up"
        ]
    },
    "fatigue": {
        "possibilities": [
            "Sub-optimal sleep duration or fragmented sleep architecture (poor deep sleep)",
            "Nutritional deficiencies (e.g. low serum ferritin/iron or vitamin D)",
            "Dehydration or sustained high psychological stress/burnout",
            "Post-viral recovery phase"
        ],
        "self_care": [
            "Maintain consistent bed and wake times every day",
            "Expose eyes to natural sunlight within 30 minutes of waking",
            "Incorporate light 15-minute afternoon walking to boost circulation",
            "Review daily fluid and balanced protein intake"
        ],
        "red_flags": [
            "Profound unremitting exhaustion preventing basic daily activities",
            "Fatigue coupled with shortness of breath or swollen lymph nodes",
            "Unexplained rapid weight loss alongside exhaustion"
        ]
    },
    "cough": {
        "possibilities": [
            "Viral upper airway irritation or post-nasal drip",
            "Seasonal allergic rhinitis or airborne pollutant exposure",
            "Mild gastroesophageal acid reflux (GERD) causing throat clearing"
        ],
        "self_care": [
            "Sip warm herbal teas with honey (for adults) to soothe mucous membranes",
            "Use a cool mist room humidifier during sleep",
            "Avoid exposure to secondhand smoke and strong chemical aerosols"
        ],
        "red_flags": [
            "Coughing up blood or rust-colored phlegm",
            "Stridor, wheezing, or audible whistling when drawing breath",
            "Cough persisting longer than 3–4 weeks without improvement"
        ]
    },
    "dizziness": {
        "possibilities": [
            "Orthostatic hypotension (standing up too quickly from rest)",
            "Insufficient fluid intake or skipping meals (mild hypoglycemia)",
            "Inner ear or vestibular irritation (benign paroxysmal positional vertigo)",
            "Hyperventilation or anxiety-induced tension"
        ],
        "self_care": [
            "Sit or lie down immediately upon feeling lightheaded until stability returns",
            "Drink cool water and consume a light complex carbohydrate snack",
            "Transition slowly from lying to standing positions"
        ],
        "red_flags": [
            "Dizziness accompanied by chest tightness, palpitations, or fainting",
            "Sudden loss of balance with double vision, facial weakness, or speech impairment",
            "Violent spinning sensation that triggers persistent vomiting"
        ]
    },
    "nausea": {
        "possibilities": [
            "Mild gastrointestinal irritation or dietary food sensitivity",
            "Motion sickness or inner ear equilibrium changes",
            "Stress-induced vagal nerve response",
            "Side effect of medications taken on an empty stomach"
        ],
        "self_care": [
            "Sip ginger or peppermint tea slowly",
            "Stick to bland, easily digestible foods (crackers, bananas, rice)",
            "Avoid lying completely flat immediately following fluid or food intake"
        ],
        "red_flags": [
            "Inability to keep any liquids down for more than 24 hours",
            "Vomit containing blood or dark coffee-ground material",
            "Severe localized sharp abdominal pain"
        ]
    },
    "stomach discomfort": {
        "possibilities": [
            "Functional dyspepsia or indigestion from eating rich/spicy meals quickly",
            "Mild intestinal gas or transient constipation",
            "Acid reflux or food intolerance (lactose, gluten sensitivity)"
        ],
        "self_care": [
            "Eat smaller, more frequent meals rather than large heavy dinners",
            "Go for an easy 10-minute post-meal walk",
            "Apply a warm heating pad to the abdomen to relax abdominal muscles"
        ],
        "red_flags": [
            "Sudden severe pain localized in the lower right abdomen (possible appendicitis)",
            "Rigid, board-like abdomen or high fever",
            "Black tarry stools"
        ]
    },
    "sleep problems": {
        "possibilities": [
            "Circadian rhythm phase disruption from screen exposure or irregular hours",
            "High evening caffeine or alcohol consumption",
            "Stress-induced sympathetic nervous system hyperarousal",
            "Suboptimal sleep environment (excess heat, noise, or light)"
        ],
        "self_care": [
            "Stop caffeine consumption after 2:00 PM",
            "Dim room lighting 60 minutes before bed and put away backlit mobile devices",
            "Keep the bedroom cool (ideal ambient temperature is around 18–20°C / 65–68°F)"
        ],
        "red_flags": [
            "Chronic loud snoring punctuated by pauses in breathing or gasping (suspected sleep apnea)",
            "Falling asleep uncontrollably during daytime activities (e.g. driving)",
            "Severe chronic insomnia persisting for months causing marked daytime cognitive impairment"
        ]
    }
}

@router.post("/analyze", response_model=schemas.SymptomAnalyzeResponse)
def analyze_symptoms(
    payload: schemas.SymptomAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    all_text = " ".join(payload.symptoms) + " " + (payload.additional_context or "")
    is_emergency, emergency_msg = check_for_emergency(all_text)

    # Collect matched possibilities
    matched_possibilities = []
    matched_self_care = []
    matched_red_flags = []

    for sym in payload.symptoms:
        sym_key = sym.lower().strip()
        matched = False
        for key, info in SYMPTOM_POSSIBILITIES.items():
            if key in sym_key or sym_key in key:
                matched_possibilities.extend(info["possibilities"])
                matched_self_care.extend(info["self_care"])
                matched_red_flags.extend(info["red_flags"])
                matched = True
                break
        if not matched:
            matched_possibilities.append(f"General physiological reactions associated with {sym}")
            matched_self_care.append(f"Monitor the progression of {sym} and stay well hydrated")
            matched_red_flags.append(f"Sudden worsening or severe persistence of {sym}")

    # Remove duplicates
    matched_possibilities = list(dict.fromkeys(matched_possibilities))[:6]
    matched_self_care = list(dict.fromkeys(matched_self_care))[:5]
    matched_red_flags = list(dict.fromkeys(matched_red_flags))[:5]

    symptoms_joined = ", ".join(payload.symptoms)
    sources = search_trusted_medical_sources(symptoms_joined, limit=3)

    guidance = (
        f"These symptoms ({symptoms_joined}) can occur for several reasons. "
        f"Some general possibilities include the items detailed below, but symptoms alone cannot confirm a clinical diagnosis. "
        f"Every person's physiology is unique, and factors such as duration ({payload.duration_days} day{'s' if payload.duration_days > 1 else ''}) "
        f"and severity ({payload.severity}) should be evaluated by a medical doctor if they persist or cause concern."
    )

    should_see_doctor = payload.severity in ["moderate", "severe"] or payload.duration_days > 3 or is_emergency

    # Save to symptom history
    history_record = models.SymptomHistory(
        user_id=current_user.id,
        symptoms_list=json.dumps(payload.symptoms),
        severity=payload.severity,
        duration_days=payload.duration_days,
        additional_context=payload.additional_context,
        ai_guidance=guidance,
        emergency_flag=is_emergency
    )
    db.add(history_record)
    db.commit()

    return schemas.SymptomAnalyzeResponse(
        symptoms=payload.symptoms,
        severity=payload.severity,
        guidance=guidance,
        general_possibilities=matched_possibilities,
        self_care_tips=matched_self_care,
        red_flags=matched_red_flags,
        emergency_warning=emergency_msg if is_emergency else None,
        should_see_doctor=should_see_doctor,
        sources=sources,
        disclaimer=MANDATORY_DISCLAIMER
    )

@router.get("/history")
def get_symptom_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    records = db.query(models.SymptomHistory).filter(
        models.SymptomHistory.user_id == current_user.id
    ).order_by(models.SymptomHistory.created_at.desc()).all()

    formatted = []
    for r in records:
        sym_list = json.loads(r.symptoms_list) if r.symptoms_list else []
        formatted.append({
            "id": r.id,
            "symptoms": sym_list,
            "severity": r.severity,
            "duration_days": r.duration_days,
            "additional_context": r.additional_context,
            "ai_guidance": r.ai_guidance,
            "emergency_flag": r.emergency_flag,
            "created_at": r.created_at
        })
    return formatted
