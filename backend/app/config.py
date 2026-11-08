from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CareGuide API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "careguide"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"
    ai_grounding_threshold: float = Field(default=0.34, ge=0.0, le=1.0)
    imagekit_private_key: str = ""
    auth_jwt_secret: str = ""
    auth_cookie_name: str = "careguide_auth"
    auth_cookie_max_age: int = 60 * 60 * 24 * 14
    demo_account_enabled: bool = True
    max_upload_bytes: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
