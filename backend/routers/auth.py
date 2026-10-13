from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    user = models.User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        age=payload.age,
        gender=payload.gender,
        height=payload.height,
        height_unit=payload.height_unit or "cm",
        weight=payload.weight,
        weight_unit=payload.weight_unit or "kg",
        health_goal=payload.health_goal or "Maintain balanced vitality and energy",
        activity_level=payload.activity_level or "Moderately Active",
        allergies=payload.allergies,
        current_medications=payload.current_medications,
        contact_number=payload.contact_number,
        health_issue=payload.health_issue or "General Wellness",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return schemas.TokenResponse(access_token=token, user=schemas.UserResponse.from_orm(user))

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return schemas.TokenResponse(access_token=token, user=schemas.UserResponse.from_orm(user))

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserResponse.from_orm(current_user)

@router.post("/google", response_model=schemas.TokenResponse)
def google_auth(payload: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Create user account for Google sign-in
        random_pw = hash_password("GoogleAuth_Secure_Random_2026")
        user = models.User(
            name=payload.name or "Google User",
            email=email,
            password_hash=random_pw,
            health_goal="Improve daily wellness and habits",
            activity_level="Moderately Active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return schemas.TokenResponse(access_token=token, user=schemas.UserResponse.from_orm(user))
