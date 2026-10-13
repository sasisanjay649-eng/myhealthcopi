from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    age: Optional[int] = Field(None, ge=1, le=130)
    gender: Optional[str] = None
    height: Optional[float] = Field(None, ge=0.5, le=500)
    height_unit: Optional[str] = "cm"  # "cm" or "ft/in"
    weight: Optional[float] = Field(None, ge=1.0, le=1000)
    weight_unit: Optional[str] = "kg"  # "kg" or "lbs"
    health_goal: Optional[str] = None
    activity_level: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    contact_number: Optional[str] = None
    health_issue: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    email: EmailStr
    name: str
    picture: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    height_unit: Optional[str] = "cm"
    weight: Optional[float] = None
    weight_unit: Optional[str] = "kg"
    health_goal: Optional[str] = None
    activity_level: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    contact_number: Optional[str] = None
    health_issue: Optional[str] = None
    is_demo_user: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    height_unit: Optional[str] = None
    weight: Optional[float] = None
    weight_unit: Optional[str] = None
    health_goal: Optional[str] = None
    activity_level: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    contact_number: Optional[str] = None
    health_issue: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Health Record Schemas ---
class HealthRecordCreate(BaseModel):
    date: str  # YYYY-MM-DD
    sleep_duration: float = Field(..., ge=0, le=24, description="Sleep duration in hours")
    steps: int = Field(..., ge=0, le=100000, description="Daily steps")
    heart_rate: int = Field(..., ge=35, le=230, description="Resting heart rate bpm")
    water_intake: float = Field(..., ge=0, le=15, description="Water intake in liters")
    exercise_duration: int = Field(..., ge=0, le=600, description="Exercise in minutes")
    stress_level: int = Field(..., ge=1, le=10, description="Self-reported stress (1-10)")
    weight: float = Field(..., ge=20, le=350, description="Body weight in kg")
    notes: Optional[str] = None

class HealthRecordUpdate(BaseModel):
    date: Optional[str] = None
    sleep_duration: Optional[float] = None
    steps: Optional[int] = None
    heart_rate: Optional[int] = None
    water_intake: Optional[float] = None
    exercise_duration: Optional[int] = None
    stress_level: Optional[int] = None
    weight: Optional[float] = None
    notes: Optional[str] = None

class HealthRecordResponse(BaseModel):
    id: int
    user_id: int
    date: str
    sleep_duration: float
    steps: int
    heart_rate: int
    water_intake: float
    exercise_duration: int
    stress_level: int
    weight: float
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Sleep & Activity Schemas ---
class SleepRecordCreate(BaseModel):
    date: str
    duration_hours: float
    quality_rating: int = Field(3, ge=1, le=5)
    deep_sleep_hours: Optional[float] = None
    notes: Optional[str] = None

class SleepRecordResponse(BaseModel):
    id: int
    user_id: int
    date: str
    duration_hours: float
    quality_rating: int
    deep_sleep_hours: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ActivityRecordCreate(BaseModel):
    date: str
    steps: int
    calories_burned: Optional[int] = None
    active_minutes: Optional[int] = None
    activity_type: Optional[str] = "walking"

class ActivityRecordResponse(BaseModel):
    id: int
    user_id: int
    date: str
    steps: int
    calories_burned: Optional[int] = None
    active_minutes: Optional[int] = None
    activity_type: Optional[str] = "walking"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Health Summary & Trends ---
class HealthSummaryResponse(BaseModel):
    wellness_score: int
    sleep_avg: float
    steps_avg: int
    heart_rate_avg: int
    water_avg: float
    exercise_avg: int
    stress_avg: float
    weight_latest: float
    trend_status: str
    sleep_status: str
    activity_status: str
    is_demo_data: bool
    recent_records_count: int

class HealthTrendPoint(BaseModel):
    date: str
    sleep_duration: float
    steps: int
    heart_rate: int
    water_intake: float
    exercise_duration: int
    stress_level: int
    weight: float

class HealthTrendsResponse(BaseModel):
    trends: List[HealthTrendPoint]
    is_demo_data: bool

# --- AI Insight Schemas ---
class AIInsightResponse(BaseModel):
    id: int
    category: str
    title: str
    content: str
    score_impact: Optional[int] = None
    is_read: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Copilot Chat Schemas ---
class CopilotChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    model: Optional[str] = None
    temperature: Optional[float] = None

class StructuredCopilotData(BaseModel):
    summary: str
    what_your_data_shows: str
    general_information: str
    possible_next_steps: List[str]
    when_to_seek_professional_help: str
    sources: List[Dict[str, Any]]

class CopilotChatResponse(BaseModel):
    id: Optional[int] = None
    role: str
    content: str
    reply: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    safety_flags: Optional[Dict[str, Any]] = None
    sources: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[datetime.datetime] = None
    is_demo_ai: bool = False
    is_emergency: bool = False
    model_name: Optional[str] = None

class AIConfigResponse(BaseModel):
    provider: str
    model: str
    temperature: float
    is_configured: bool
    masked_api_key: Optional[str] = None
    endpoint_url: Optional[str] = None
    available_providers: List[Dict[str, Any]]

class AIConfigUpdateRequest(BaseModel):
    provider: str
    api_key: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    endpoint_url: Optional[str] = None

class AITestConnectionRequest(BaseModel):
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    endpoint_url: Optional[str] = None

class AITestConnectionResponse(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[int] = None
    model_name: Optional[str] = None
    sample_reply: Optional[str] = None


# --- Medication Schemas ---
class MedicationDetail(BaseModel):
    id: int
    name: str
    generic_name: Optional[str] = None
    class_name: Optional[str] = None
    general_uses: str
    common_side_effects: str
    precautions: str
    interaction_warnings: str
    safety_info: str
    trusted_sources: str
    is_verified: Optional[bool] = True

    class Config:
        from_attributes = True

class MedicationQuestionRequest(BaseModel):
    medication_name: str
    question: str

class MedicationQuestionResponse(BaseModel):
    medication_name: str
    question: str
    response: str
    general_uses: str
    precautions: str
    sources: List[Dict[str, Any]]
    disclaimer: str

class UserMedicationCreate(BaseModel):
    medication_name: str
    dosage: Optional[str] = None
    dosage_note: Optional[str] = None
    frequency: Optional[str] = None
    frequency_note: Optional[str] = None
    time: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "active"

class UserMedicationUpdate(BaseModel):
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    dosage_note: Optional[str] = None
    frequency: Optional[str] = None
    frequency_note: Optional[str] = None
    time: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    last_taken_date: Optional[str] = None
    status: Optional[str] = None

class UserMedicationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    medication_name: str
    dosage: Optional[str] = None
    dosage_note: Optional[str] = None
    frequency: Optional[str] = None
    frequency_note: Optional[str] = None
    time: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    last_taken_date: Optional[str] = None
    status: Optional[str] = "active"
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Symptom Schemas ---
class SymptomAnalyzeRequest(BaseModel):
    symptoms: List[str]
    severity: str = "mild"  # mild, moderate, severe
    duration_days: int = 1
    additional_context: Optional[str] = None

class SymptomAnalyzeResponse(BaseModel):
    symptoms: List[str]
    severity: str
    guidance: str
    general_possibilities: List[str]
    self_care_tips: List[str]
    red_flags: List[str]
    emergency_warning: Optional[str] = None
    should_see_doctor: bool
    sources: List[Dict[str, Any]]
    disclaimer: str

# --- Medical Search Schemas ---
class MedicalSourceItem(BaseModel):
    title: str
    source_name: str
    short_description: str
    url: str
    date: Optional[str] = None
    trustworthiness_score: float = 0.98

class MedicalSearchResponse(BaseModel):
    query: str
    total: int
    results: List[MedicalSourceItem]

# --- Medication & Tablet Reminder Schemas ---
class MedicationReminderCreate(BaseModel):
    medicine_name: str = Field(..., min_length=1)
    dosage: Optional[str] = "1 tablet"
    reminder_time: str = "08:00 AM"
    meal_timing: Optional[str] = "After Food"  # Before Food, After Food, With Food, Empty Stomach
    frequency: Optional[str] = "Daily"
    days: Optional[str] = "Everyday"
    notes: Optional[str] = None

class MedicationReminderUpdate(BaseModel):
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    reminder_time: Optional[str] = None
    meal_timing: Optional[str] = None
    frequency: Optional[str] = None
    days: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class MedicationReminderResponse(BaseModel):
    id: int
    user_id: int
    medicine_name: str
    dosage: str
    reminder_time: str
    meal_timing: str
    frequency: str
    days: str
    is_active: bool
    last_taken_date: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Nutrition & Food Suggestion Schemas ---
class BeneficialFoodItem(BaseModel):
    name: str
    category: str
    why_it_helps: str
    how_to_consume: str

class AvoidFoodItem(BaseModel):
    name: str
    reason: str
    healthier_alternative: str

class MealPlan(BaseModel):
    breakfast: str
    lunch: str
    afternoon_snack: str
    dinner: str

class NutritionRecommendationResponse(BaseModel):
    health_issue: str
    clinical_rationale: str
    beneficial_foods: List[BeneficialFoodItem]
    foods_to_avoid: List[AvoidFoodItem]
    sample_daily_meal_plan: MealPlan
    lifestyle_and_hydration_rules: List[str]
    disclaimer: str

