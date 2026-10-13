from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    return schemas.UserResponse.from_orm(current_user)

@router.put("/profile", response_model=schemas.UserResponse)
def update_user_profile(
    payload: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    update_data = payload.dict(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            setattr(current_user, field, val)

    db.commit()
    db.refresh(current_user)
    return schemas.UserResponse.from_orm(current_user)
