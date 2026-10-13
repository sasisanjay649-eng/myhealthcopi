import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, SessionLocal
import models
from routers import auth, users, health, copilot, medications, symptoms, search, reminders, nutrition
from routers.medications import init_medications

logger = logging.getLogger("vitamind.main")
logging.basicConfig(level=logging.INFO)

# Create tables in Database (PostgreSQL or fallback SQLite)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    # Initialize seed medications
    with SessionLocal() as db:
        init_medications(db)
except Exception as e:
    logger.error(f"Error during database initialization: {e}")

app = FastAPI(
    title="VitaMind AI – Personal Health & Wellness Copilot API",
    description="Intelligent personal health tracking, AI wellness insights, medication facts, and medical literature search.",
    version="1.0.0"
)

# CORS configuration
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(health.router)
app.include_router(copilot.router)
app.include_router(medications.router)
app.include_router(reminders.router)
app.include_router(nutrition.router)
app.include_router(symptoms.router)
app.include_router(search.router)

@app.get("/")
def root():
    return {
        "app": "VitaMind AI",
        "tagline": "Your health has a story. Let's understand it.",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/api/health-check")
def health_check():
    ai_provider = os.getenv("AI_PROVIDER", "mock")
    db_connected = True
    try:
        with engine.connect() as conn:
            pass
    except Exception:
        db_connected = False

    return {
        "status": "healthy",
        "database_connected": db_connected,
        "ai_provider": ai_provider,
        "timestamp": os.getenv("LOCAL_TIME", "2026-10-12")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
