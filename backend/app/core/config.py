import os
from dotenv import load_dotenv

load_dotenv()

# Simple settings without pydantic
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://canary_user:canary_password@localhost:5432/canary_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "dummy-key")