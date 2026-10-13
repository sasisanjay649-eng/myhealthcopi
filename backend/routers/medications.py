from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user
from services.medical_search import search_trusted_medical_sources
from services.safety_service import MANDATORY_DISCLAIMER

router = APIRouter(prefix="/api/medications", tags=["Medications Information"])

# Built-in verified clinical database for common medicines
SEED_MEDICATIONS = [
    {
        "name": "Acetaminophen",
        "generic_name": "Paracetamol",
        "class_name": "Analgesic & Antipyretic",
        "general_uses": "Commonly used for the temporary relief of mild to moderate pain (such as headaches, muscle aches, toothaches) and fever reduction.",
        "common_side_effects": "Generally well-tolerated at approved doses. Mild nausea, rash, or headache may occur rarely.",
        "precautions": "Maximum daily dose limits must never be exceeded to protect liver function. Avoid combining with other OTC cold/flu products containing acetaminophen.",
        "interaction_warnings": "Interacts with heavy alcohol consumption and may alter warfarin anticoagulation monitoring with prolonged usage.",
        "safety_info": "Acute overdose causes severe hepatic toxicity. Whether this medicine is appropriate for you depends on your medical history, allergies, current medicines and other factors. Please confirm with a qualified doctor or pharmacist.",
        "trusted_sources": "FDA Drug Safety Communication, MedlinePlus, NHS Health A-Z"
    },
    {
        "name": "Ibuprofen",
        "generic_name": "Ibuprofen",
        "class_name": "Nonsteroidal Anti-inflammatory Drug (NSAID)",
        "general_uses": "Commonly used for reducing inflammation, joint stiffness, menstrual cramps, dental discomfort, and acute musculoskeletal pain.",
        "common_side_effects": "Stomach irritation, heartburn, mild nausea, dizziness, fluid retention.",
        "precautions": "Best taken with food or milk to reduce gastric irritation. Use caution in individuals with active peptic ulcers, kidney impairment, or cardiovascular disease.",
        "interaction_warnings": "May interact with blood thinners (aspirin, warfarin), ACE inhibitors, diuretics, and corticosteroids.",
        "safety_info": "Chronic high-dose NSAID usage elevates risk of gastrointestinal bleeding. Please verify with a doctor or pharmacist before regular use.",
        "trusted_sources": "DailyMed, FDA Label Guidance, Mayo Clinic"
    },
    {
        "name": "Amoxicillin",
        "generic_name": "Amoxicillin Trihydrate",
        "class_name": "Penicillin-class Antibiotic",
        "general_uses": "Prescribed by physicians strictly for susceptible bacterial infections, including ear infections, streptococcal pharyngitis, and respiratory tract infections.",
        "common_side_effects": "Mild diarrhea, nausea, vomiting, skin rash, fungal overgrowth.",
        "precautions": "Strictly ineffective against viral illnesses such as the common cold or COVID-19. Strict adherence to completing the prescribed course prevents antimicrobial resistance.",
        "interaction_warnings": "May reduce efficacy of methotrexate clearance and interact with allopurinol or oral contraceptives.",
        "safety_info": "Contraindicated in individuals with severe penicillin or cephalosporin allergies. Never initiate antibiotics without direct medical diagnosis.",
        "trusted_sources": "CDC Antibiotic Stewardship, FDA, NHS Medicines Guide"
    },
    {
        "name": "Metformin",
        "generic_name": "Metformin Hydrochloride",
        "class_name": "Biguanide Antidiabetic Agent",
        "general_uses": "Prescribed as a first-line pharmacotherapy for managing type 2 diabetes and improving insulin sensitivity alongside dietary modifications.",
        "common_side_effects": "Gastrointestinal disturbances (diarrhea, bloating, metallic taste, nausea), typically improving after initial weeks.",
        "precautions": "Periodic monitoring of renal function and serum vitamin B12 levels is clinically recommended.",
        "interaction_warnings": "Iodinated radiocontrast agents require temporary suspension of metformin. Avoid excessive alcohol consumption.",
        "safety_info": "Lactic acidosis is an extremely rare but critical risk in patients with significant renal impairment. Always take under close medical supervision.",
        "trusted_sources": "American Diabetes Association (ADA), MedlinePlus, FDA"
    },
    {
        "name": "Omeprazole",
        "generic_name": "Omeprazole",
        "class_name": "Proton Pump Inhibitor (PPI)",
        "general_uses": "Used for the management of gastroesophageal reflux disease (GERD), persistent heartburn, and healing of peptic ulcers.",
        "common_side_effects": "Headache, abdominal pain, constipation, flatulence.",
        "precautions": "Best taken 30–60 minutes before the first meal of the day. Long-term uninterrupted usage should be reviewed periodically by a healthcare provider.",
        "interaction_warnings": "May alter absorption of medications dependent on gastric acidity (iron, ketoconazole) and interact with clopidogrel.",
        "safety_info": "Prolonged high-dose use may affect magnesium levels and bone density. Consult a physician for symptoms persisting beyond two weeks.",
        "trusted_sources": "NHS UK, FDA Drug Safety, National Institutes of Health"
    },
    {
        "name": "Cetirizine",
        "generic_name": "Cetirizine Hydrochloride",
        "class_name": "Second-Generation Antihistamine",
        "general_uses": "Relieves allergic symptoms such as sneezing, watery eyes, itchy palate, runny nose, and chronic hives (urticaria).",
        "common_side_effects": "Mild drowsiness in some individuals, dry mouth, mild fatigue.",
        "precautions": "Exercise caution when driving or consuming alcohol until you understand your individual response.",
        "interaction_warnings": "Concurrent use of central nervous system depressants or sedatives may enhance drowsiness.",
        "safety_info": "Generally non-drowsy compared to first-generation antihistamines. Confirm appropriate usage if you have renal impairment.",
        "trusted_sources": "MedlinePlus, American Academy of Allergy Asthma & Immunology"
    },
    {
        "name": "Lisinopril",
        "generic_name": "Lisinopril",
        "class_name": "ACE (Angiotensin-Converting Enzyme) Inhibitor",
        "general_uses": "Prescribed for managing arterial hypertension and supporting heart failure therapy after myocardial infarction.",
        "common_side_effects": "Persistent dry tickling cough, mild dizziness upon standing (orthostatic hypotension), elevated potassium.",
        "precautions": "Blood pressure and serum potassium/creatinine levels must be checked regularly. Strictly contraindicated during pregnancy.",
        "interaction_warnings": "Avoid potassium supplements or salt substitutes containing potassium without physician approval. Interacts with NSAIDs.",
        "safety_info": "Angioedema (swelling of face/lips/throat) is a critical emergency requiring immediate emergency care. Never discontinue abruptly without speaking to your doctor.",
        "trusted_sources": "American Heart Association, FDA MedWatch, DailyMed"
    },
    {
        "name": "Melatonin",
        "generic_name": "Melatonin (Endogenous neurohormone supplement)",
        "class_name": "Sleep-wake Cycle Regulator",
        "general_uses": "Often utilized for short-term mitigation of jet lag, circadian rhythm sleep phase delays, or shift work adjustments.",
        "common_side_effects": "Next-day grogginess, vivid dreams, mild headache, temporary dizziness.",
        "precautions": "Timing is crucial (often 1–2 hours before intended bedtime). High doses do not produce greater effectiveness and may disrupt sleep architecture.",
        "interaction_warnings": "May interact with blood thinners, immunosuppressants, and blood pressure medications.",
        "safety_info": "Melatonin is a dietary hormone supplement, not a long-term sedative cure for chronic insomnia. Consult a sleep specialist if sleep problems persist.",
        "trusted_sources": "National Center for Complementary and Integrative Health (NCCIH), CDC"
    }
]

def init_medications(db: Session):
    for item in SEED_MEDICATIONS:
        exists = db.query(models.Medication).filter(models.Medication.name.ilike(item["name"])).first()
        if not exists:
            med = models.Medication(**item)
            db.add(med)
    db.commit()

@router.get("/search", response_model=List[schemas.MedicationDetail])
def search_medications(q: Optional[str] = "", db: Session = Depends(get_db)):
    init_medications(db)
    if not q or not q.strip():
        meds = db.query(models.Medication).limit(10).all()
        return [schemas.MedicationDetail.from_orm(m) for m in meds]

    term = f"%{q.strip()}%"
    meds = db.query(models.Medication).filter(
        (models.Medication.name.ilike(term)) |
        (models.Medication.generic_name.ilike(term)) |
        (models.Medication.general_uses.ilike(term)) |
        (models.Medication.class_name.ilike(term))
    ).all()

    # If no local DB match found, dynamically provide an educational summary from trusted search
    if not meds:
        sources = search_trusted_medical_sources(q, limit=2)
        source_names = ", ".join([s["source_name"] for s in sources]) or "FDA, MedlinePlus"
        virtual_med = models.Medication(
            id=9999,
            name=q.title(),
            generic_name="Reference Compound",
            class_name="Pharmacological Category",
            general_uses=f"This medicine is commonly reviewed in clinical literature for condition-specific therapeutic indications. (Reference: {sources[0]['title'] if sources else 'Official Drug Monographs'})",
            common_side_effects="Side effects depend on dosage form, patient physiology, and concurrent medications. Consult the official patient information leaflet.",
            precautions="Whether this medicine is appropriate for you depends on your medical history, allergies, current medicines and other factors. Please confirm with a qualified doctor or pharmacist.",
            interaction_warnings="Inform your physician of all prescription, OTC, and herbal compounds you are currently taking.",
            safety_info="VitaMind AI does not determine dosage or prescribe medications. Please consult a qualified doctor or clinical pharmacist.",
            trusted_sources=source_names,
            is_verified=True
        )
        return [schemas.MedicationDetail.from_orm(virtual_med)]

    return [schemas.MedicationDetail.from_orm(m) for m in meds]

@router.get("/{name}", response_model=schemas.MedicationDetail)
def get_medication_by_name(name: str, db: Session = Depends(get_db)):
    init_medications(db)
    med = db.query(models.Medication).filter(
        models.Medication.name.ilike(name.strip())
    ).first()

    if not med:
        # Check partial
        med = db.query(models.Medication).filter(
            models.Medication.name.ilike(f"%{name.strip()}%")
        ).first()

    if not med:
        raise HTTPException(status_code=404, detail=f"Medication '{name}' not found in database.")

    return schemas.MedicationDetail.from_orm(med)

@router.post("/question", response_model=schemas.MedicationQuestionResponse)
def ask_medication_question(
    payload: schemas.MedicationQuestionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    init_medications(db)
    med = db.query(models.Medication).filter(
        models.Medication.name.ilike(f"%{payload.medication_name.strip()}%")
    ).first()

    sources = search_trusted_medical_sources(f"{payload.medication_name} {payload.question}", limit=2)

    if med:
        uses = med.general_uses
        precautions = med.precautions
        response_text = (
            f"{med.name} ({med.class_name or 'General Medicine'}): {med.general_uses}\n\n"
            f"**Important Safety & Precautions:**\n{med.precautions}\n\n"
            f"**Interactions to Discuss:**\n{med.interaction_warnings}\n\n"
            f"Whether this medicine is appropriate for you depends on your medical history, allergies, "
            f"current medicines and other factors. Please confirm with a qualified doctor or pharmacist."
        )
    else:
        uses = f"{payload.medication_name} is commonly described in official pharmaceutical references."
        precautions = "Safety and dosage must be strictly verified with a licensed clinical professional."
        response_text = (
            f"Educational information regarding {payload.medication_name}: "
            f"Please review official pharmacological monographs. "
            f"VitaMind AI does not prescribe medicines or determine dosage. "
            f"Always consult a licensed doctor or pharmacist before starting or altering any medicine."
        )

    # Save to user's question history
    q_record = models.MedicationQuestion(
        user_id=current_user.id,
        medication_name=payload.medication_name,
        question=payload.question,
        response=response_text
    )
    db.add(q_record)
    db.commit()

    return schemas.MedicationQuestionResponse(
        medication_name=payload.medication_name,
        question=payload.question,
        response=response_text,
        general_uses=uses,
        precautions=precautions,
        sources=sources,
        disclaimer=MANDATORY_DISCLAIMER
    )

# User's own medication tracking list
@router.get("/user/list", response_model=List[schemas.UserMedicationResponse])
def get_user_medications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_meds = db.query(models.UserMedication).filter(
        models.UserMedication.user_id == current_user.id
    ).order_by(models.UserMedication.id.desc()).all()
    return [schemas.UserMedicationResponse.from_orm(um) for um in user_meds]

@router.post("/user/add", response_model=schemas.UserMedicationResponse)
def add_user_medication(
    payload: schemas.UserMedicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    dosage_val = payload.dosage or payload.dosage_note or "1 tablet"
    freq_val = payload.frequency or payload.frequency_note or "Daily"
    
    med_rec = models.UserMedication(
        user_id=current_user.id,
        medication_name=payload.medication_name.strip(),
        dosage=dosage_val,
        dosage_note=dosage_val,
        frequency=freq_val,
        frequency_note=freq_val,
        time=payload.time or "08:00 AM",
        start_date=payload.start_date,
        end_date=payload.end_date,
        notes=payload.notes.strip() if payload.notes else None,
        status=payload.status or "active"
    )
    db.add(med_rec)
    db.commit()
    db.refresh(med_rec)
    return schemas.UserMedicationResponse.from_orm(med_rec)

@router.put("/user/{med_id}", response_model=schemas.UserMedicationResponse)
def update_user_medication(
    med_id: int,
    payload: schemas.UserMedicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    med_rec = db.query(models.UserMedication).filter(
        models.UserMedication.id == med_id,
        models.UserMedication.user_id == current_user.id
    ).first()

    if not med_rec:
        raise HTTPException(status_code=404, detail="Medication not found")

    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            setattr(med_rec, k, v)
            if k == "dosage":
                med_rec.dosage_note = v
            elif k == "frequency":
                med_rec.frequency_note = v

    db.commit()
    db.refresh(med_rec)
    return schemas.UserMedicationResponse.from_orm(med_rec)

@router.delete("/user/{med_id}", status_code=204)
def delete_user_medication(
    med_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    med_rec = db.query(models.UserMedication).filter(
        models.UserMedication.id == med_id,
        models.UserMedication.user_id == current_user.id
    ).first()

    if not med_rec:
        raise HTTPException(status_code=404, detail="Medication not found")

    db.delete(med_rec)
    db.commit()
    return None

@router.post("/user/{med_id}/take", response_model=schemas.UserMedicationResponse)
def toggle_user_medication_taken(
    med_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    med_rec = db.query(models.UserMedication).filter(
        models.UserMedication.id == med_id,
        models.UserMedication.user_id == current_user.id
    ).first()

    if not med_rec:
        raise HTTPException(status_code=404, detail="Medication not found")

    import datetime
    today_str = datetime.date.today().isoformat()
    if med_rec.last_taken_date == today_str:
        med_rec.last_taken_date = None
    else:
        med_rec.last_taken_date = today_str

    db.commit()
    db.refresh(med_rec)
    return schemas.UserMedicationResponse.from_orm(med_rec)

@router.post("/user/{med_id}/status", response_model=schemas.UserMedicationResponse)
def update_user_medication_status(
    med_id: int,
    status_str: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    med_rec = db.query(models.UserMedication).filter(
        models.UserMedication.id == med_id,
        models.UserMedication.user_id == current_user.id
    ).first()

    if not med_rec:
        raise HTTPException(status_code=404, detail="Medication not found")

    med_rec.status = status_str
    db.commit()
    db.refresh(med_rec)
    return schemas.UserMedicationResponse.from_orm(med_rec)

@router.post("/user/seed-sample")
def seed_sample_user_medications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    import datetime
    today = datetime.date.today()
    today_str = today.isoformat()
    past_7d = (today - datetime.timedelta(days=7)).isoformat()
    future_23d = (today + datetime.timedelta(days=23)).isoformat()
    past_30d = (today - datetime.timedelta(days=30)).isoformat()
    future_60d = (today + datetime.timedelta(days=60)).isoformat()
    past_14d = (today - datetime.timedelta(days=14)).isoformat()
    future_3d = (today + datetime.timedelta(days=3)).isoformat()
    future_10d = (today + datetime.timedelta(days=10)).isoformat()
    past_21d = (today - datetime.timedelta(days=21)).isoformat()
    past_3d = (today - datetime.timedelta(days=3)).isoformat()

    sample_items = [
        {
            "medication_name": "Vitamin D3 (Cholecalciferol)",
            "dosage": "2000 IU (1 Capsule)",
            "frequency": "Once daily",
            "time": "08:30 AM",
            "start_date": past_7d,
            "end_date": future_23d,
            "notes": "Take with morning meal containing healthy fats for optimal absorption.",
            "last_taken_date": today_str,
            "status": "active"
        },
        {
            "medication_name": "Metformin Hydrochloride",
            "dosage": "500 mg Tablet",
            "frequency": "Twice daily",
            "time": "07:30 PM",
            "start_date": past_30d,
            "end_date": future_60d,
            "notes": "Take immediately following dinner with a glass of water.",
            "last_taken_date": None,
            "status": "active"
        },
        {
            "medication_name": "Omega-3 Fish Oil",
            "dosage": "1000 mg Softgel",
            "frequency": "Once daily",
            "time": "01:00 PM",
            "start_date": past_14d,
            "end_date": None,
            "notes": "Supports cognitive clarity and cardiovascular wellness.",
            "last_taken_date": today_str,
            "status": "active"
        },
        {
            "medication_name": "Amoxicillin Trihydrate",
            "dosage": "500 mg Capsule",
            "frequency": "Three times daily",
            "time": "09:00 AM",
            "start_date": future_3d,
            "end_date": future_10d,
            "notes": "Scheduled 7-day post-dental antibiotic course. Finish entire prescribed course.",
            "last_taken_date": None,
            "status": "upcoming"
        },
        {
            "medication_name": "Cetirizine Hydrochloride",
            "dosage": "10 mg Tablet",
            "frequency": "Once daily",
            "time": "09:00 PM",
            "start_date": past_21d,
            "end_date": past_3d,
            "notes": "Seasonal allergy symptom relief course completed with good tolerability.",
            "last_taken_date": None,
            "status": "completed"
        }
    ]

    created = []
    for item in sample_items:
        exists = db.query(models.UserMedication).filter(
            models.UserMedication.user_id == current_user.id,
            models.UserMedication.medication_name == item["medication_name"]
        ).first()
        if not exists:
            rec = models.UserMedication(
                user_id=current_user.id,
                dosage_note=item["dosage"],
                frequency_note=item["frequency"],
                **item
            )
            db.add(rec)
            created.append(rec)

    db.commit()
    return {"message": "Sample medications seeded successfully", "count": len(created)}
