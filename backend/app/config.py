from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    openrouter_api_key: str
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "openai/gpt-4o-mini"
    database_url: str = "sqlite:///./voyagelink.db"
    cors_origins: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
