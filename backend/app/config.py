import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AIVOA Pharma QMS - Customer Complaint Management"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pharma_qms.db")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = "llama-3.3-70b-versatile" # Supported active model
    ALLOW_MOCK_FALLBACK: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
