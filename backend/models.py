import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    height = Column(Float, nullable=True)
    height_unit = Column(String(20), default="cm", nullable=True)
    weight = Column(Float, nullable=True)
    weight_unit = Column(String(20), default="kg", nullable=True)
    health_goal = Column(String(255), nullable=True)
    activity_level = Column(String(100), nullable=True)
    allergies = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    contact_number = Column(String(50), nullable=True)
    health_issue = Column(String(255), nullable=True)
    is_demo_user = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    health_records = relationship("HealthRecord", back_populates="user", cascade="all, delete-orphan")
    sleep_records = relationship("SleepRecord", back_populates="user", cascade="all, delete-orphan")
    activity_records = relationship("ActivityRecord", back_populates="user", cascade="all, delete-orphan")
    health_metrics = relationship("HealthMetric", back_populates="user", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    user_medications = relationship("UserMedication", back_populates="user", cascade="all, delete-orphan")
    medication_reminders = relationship("MedicationReminder", back_populates="user", cascade="all, delete-orphan")
    medication_questions = relationship("MedicationQuestion", back_populates="user", cascade="all, delete-orphan")
    symptom_history = relationship("SymptomHistory", back_populates="user", cascade="all, delete-orphan")


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False, index=True)
    sleep_duration = Column(Float, nullable=False, default=7.0)  # hours
    steps = Column(Integer, nullable=False, default=5000)
    heart_rate = Column(Integer, nullable=False, default=72)     # bpm
    water_intake = Column(Float, nullable=False, default=2.0)    # liters
    exercise_duration = Column(Integer, nullable=False, default=30)  # minutes
    stress_level = Column(Integer, nullable=False, default=5)    # 1 to 10
    weight = Column(Float, nullable=False, default=70.0)         # kg
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="health_records")


class SleepRecord(Base):
    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False, index=True)
    duration_hours = Column(Float, nullable=False)
    quality_rating = Column(Integer, default=3)  # 1 to 5
    deep_sleep_hours = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sleep_records")


class ActivityRecord(Base):
    __tablename__ = "activity_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False, index=True)
    steps = Column(Integer, nullable=False)
    calories_burned = Column(Integer, nullable=True)
    active_minutes = Column(Integer, nullable=True)
    activity_type = Column(String(100), default="walking")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activity_records")


class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_type = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="health_metrics")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="general")
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    score_impact = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_insights")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    structured_data = Column(Text, nullable=True)  # JSON string
    safety_flags = Column(Text, nullable=True)     # JSON string
    sources = Column(Text, nullable=True)          # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    generic_name = Column(String(150), nullable=True)
    class_name = Column(String(150), nullable=True)
    general_uses = Column(Text, nullable=False)
    common_side_effects = Column(Text, nullable=False)
    precautions = Column(Text, nullable=False)
    interaction_warnings = Column(Text, nullable=False)
    safety_info = Column(Text, nullable=False)
    trusted_sources = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=True)


class UserMedication(Base):
    __tablename__ = "user_medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_name = Column(String(150), nullable=False)
    dosage = Column(String(150), nullable=True)
    dosage_note = Column(String(150), nullable=True)
    frequency = Column(String(150), nullable=True)
    frequency_note = Column(String(150), nullable=True)
    time = Column(String(50), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    last_taken_date = Column(String(50), nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_medications")


class MedicationQuestion(Base):
    __tablename__ = "medication_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_name = Column(String(150), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="medication_questions")


class ExternalSource(Base):
    __tablename__ = "external_sources"

    id = Column(Integer, primary_key=True, index=True)
    query_term = Column(String(150), index=True, nullable=False)
    title = Column(String(250), nullable=False)
    source_name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    snippet = Column(Text, nullable=False)
    publication_date = Column(String(50), nullable=True)
    trustworthiness_score = Column(Float, default=0.98)


class SymptomHistory(Base):
    __tablename__ = "symptom_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symptoms_list = Column(Text, nullable=False)  # JSON string array
    severity = Column(String(50), default="mild")
    duration_days = Column(Integer, default=1)
    additional_context = Column(Text, nullable=True)
    ai_guidance = Column(Text, nullable=False)
    emergency_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="symptom_history")


class MedicationReminder(Base):
    __tablename__ = "medication_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_name = Column(String(150), nullable=False)
    dosage = Column(String(100), default="1 tablet")
    reminder_time = Column(String(20), nullable=False, default="08:00 AM")  # e.g., "08:00 AM", "01:00 PM"
    meal_timing = Column(String(50), default="After Food")  # "Before Food", "After Food", "With Food", "Empty Stomach"
    frequency = Column(String(50), default="Daily")
    days = Column(String(100), default="Everyday")
    is_active = Column(Boolean, default=True)
    last_taken_date = Column(String(50), nullable=True)  # YYYY-MM-DD
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="medication_reminders")
