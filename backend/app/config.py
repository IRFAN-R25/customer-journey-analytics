import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered E-Commerce Customer Journey Analytics"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:irfan@localhost:5432/customer_journey_db"
    )
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", 
        "customer-journey-analytics-jwt-secret-2026"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
