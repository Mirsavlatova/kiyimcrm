from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "KiyimCRM"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql://postgres:12345@localhost:5432/kiyim_kechak"

    SECRET_KEY: str = "kiyim-crm-super-secret-key-2024-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    UPLOAD_DIR: str = "uploads/products"

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
