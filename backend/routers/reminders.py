import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/reminders", tags=["Medication & Tablet Reminders"])

SAMPLE_REMINDERS = [
    {
        "medicine_name": "Vitamin D3 + K2",
        "dosage": "1 Capsule (2000 IU)",
        "reminder_time": "08:30 AM",
        "meal_timing": "After Food",
        "frequency": "Daily",
        "days": "Everyday",
        "notes": "Take with breakfast containing healthy fats for optimal absorption.",
    },
    {
        "medicine_name": "Omega-3 Fish Oil",
        "dosage": "1 Softgel (1000mg)",
        "reminder_time": "01:00 PM",
        "meal_timing": "With Food",
        "frequency": "Daily",
        "days": "Everyday",
        "notes": "Supports cardiovascular resilience and joint lubrication.",
    },
    {
        "medicine_name": "Magnesium Glycinate",
        "dosage": "200 mg Tablet",
        "reminder_time": "09:30 PM",
        "meal_timing": "Before Bed",
        "frequency": "Daily",
        "days": "Everyday",
        "notes": "Take 45 minutes before sleep to assist autonomic nervous recovery.",
    }
]

@router.post("", response_model=schemas.MedicationReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    payload: schemas.MedicationReminderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reminder = models.MedicationReminder(
        user_id=current_user.id,
        medicine_name=payload.medicine_name.strip(),
        dosage=payload.dosage or "1 tablet",
        reminder_time=payload.reminder_time or "08:00 AM",
        meal_timing=payload.meal_timing or "After Food",
        frequency=payload.frequency or "Daily",
        days=payload.days or "Everyday",
        notes=payload.notes.strip() if payload.notes else None,
        is_active=True
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return schemas.MedicationReminderResponse.from_orm(reminder)

@router.get("", response_model=List[schemas.MedicationReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reminders = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.user_id == current_user.id
    ).order_by(models.MedicationReminder.reminder_time.asc()).all()

    return [schemas.MedicationReminderResponse.from_orm(r) for r in reminders]

@router.put("/{reminder_id}", response_model=schemas.MedicationReminderResponse)
def update_reminder(
    reminder_id: int,
    payload: schemas.MedicationReminderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reminder = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.id == reminder_id,
        models.MedicationReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Medication reminder not found.")

    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            setattr(reminder, k, v)

    db.commit()
    db.refresh(reminder)
    return schemas.MedicationReminderResponse.from_orm(reminder)

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reminder = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.id == reminder_id,
        models.MedicationReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Medication reminder not found.")

    db.delete(reminder)
    db.commit()
    return None

@router.post("/{reminder_id}/toggle", response_model=schemas.MedicationReminderResponse)
def toggle_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reminder = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.id == reminder_id,
        models.MedicationReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Medication reminder not found.")

    reminder.is_active = not reminder.is_active
    db.commit()
    db.refresh(reminder)
    return schemas.MedicationReminderResponse.from_orm(reminder)

@router.post("/{reminder_id}/take", response_model=schemas.MedicationReminderResponse)
def mark_reminder_taken(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reminder = db.query(models.MedicationReminder).filter(
        models.MedicationReminder.id == reminder_id,
        models.MedicationReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Medication reminder not found.")

    today_str = datetime.date.today().isoformat()
    # Toggle taken state for today
    if reminder.last_taken_date == today_str:
        reminder.last_taken_date = None  # untake
    else:
        reminder.last_taken_date = today_str

    db.commit()
    db.refresh(reminder)
    return schemas.MedicationReminderResponse.from_orm(reminder)

@router.post("/seed-sample")
def seed_sample_reminders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    created = []
    for item in SAMPLE_REMINDERS:
        existing = db.query(models.MedicationReminder).filter(
            models.MedicationReminder.user_id == current_user.id,
            models.MedicationReminder.medicine_name == item["medicine_name"]
        ).first()
        if not existing:
            rem = models.MedicationReminder(user_id=current_user.id, **item)
            db.add(rem)
            created.append(rem)

    db.commit()
    return {"message": "Sample reminders seeded successfully", "count": len(created)}
