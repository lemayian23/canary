from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://canary_user:canary_password@localhost:5432/canary_db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # OpenAI
    openai_api_key: str
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    
    # Application
    environment: str = "development"
    log_level: str = "INFO"
    
    # Cost Controls
    max_cost_per_run: float = 10.00
    judge_model: str = "gpt-3.5-turbo"
    
    class Config:
        env_file = ".env"

settings = Settings()