"""Database connection management and session factory."""

import os
from sqlalchemy import create_engine, event, Engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/innovation_hub"
)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# SQLAlchemy Engine Configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
)

@event.listens_for(Engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    logger.debug("New database connection established")

@event.listens_for(Engine, "close")
def receive_close(dbapi_conn, connection_record):
    logger.debug("Database connection closed")

@event.listens_for(Engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    logger.debug("Database connection returned to pool")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Get database session for FastAPI dependency injection."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def close_db():
    """Close all database connections."""
    try:
        engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {str(e)}")

def check_db_health() -> bool:
    """Check if database connection is healthy."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database health check passed")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False

__all__ = ["engine", "SessionLocal", "get_db", "close_db", "check_db_health"]