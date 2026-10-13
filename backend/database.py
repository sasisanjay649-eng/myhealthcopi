import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("vitamind.database")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vitamind.db")

# Fix Heroku/Render postgres:// scheme to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def get_engine(db_url: str):
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(db_url, connect_args=connect_args)

try:
    engine = get_engine(DATABASE_URL)
    # Quick connectivity test
    with engine.connect() as conn:
        logger.info(f"Database engine connected successfully to: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
except Exception as e:
    logger.warning(f"Could not connect using {DATABASE_URL}: {e}")
    logger.info("Falling back to local SQLite database (sqlite:///./vitamind.db) to ensure flawless operation.")
    DATABASE_URL = "sqlite:///./vitamind.db"
    engine = get_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
