from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import Annotated, List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@postgres:5432/itstek"

    # Where the built frontend lives. Empty means "API only" — that is how the
    # Docker image runs, with nginx serving the static files instead.
    STATIC_DIR: str = ""

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RATE_LIMIT_ENABLED: bool = True

    # Admin seed
    FIRST_ADMIN_EMAIL: str = "admin@itstek.com"
    FIRST_ADMIN_PASSWORD: str = "admin123"

    # Telegram
    BOT_TOKEN: str = ""
    CHAT_ID: str = ""

    # App
    APP_ENV: str = "development"
    # NoDecode keeps pydantic-settings from JSON-decoding the raw env value, so
    # the validator below sees the string and can accept a comma-separated list.
    CORS_ORIGINS: Annotated[List[str], NoDecode] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def force_async_driver(cls, v):
        """Hosting platforms hand out a sync URL; this app needs the async one.

        Replit, Render, Railway and Heroku all inject DATABASE_URL as
        `postgres://…` or `postgresql://…`, which SQLAlchemy maps to psycopg2 —
        and then every request fails with 'greenlet_spawn has not been called'.
        """
        if isinstance(v, str):
            for prefix in ("postgresql://", "postgres://"):
                if v.startswith(prefix):
                    return "postgresql+psycopg://" + v[len(prefix):]
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            # Handle both JSON array and comma-separated
            v = v.strip()
            if v.startswith("["):
                import json
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.is_production:
            if self.SECRET_KEY == "dev-secret-key-change-in-production" or len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY must be a unique value of at least 32 characters in production")
            if self.FIRST_ADMIN_PASSWORD == "admin123" or len(self.FIRST_ADMIN_PASSWORD) < 12:
                raise ValueError("FIRST_ADMIN_PASSWORD must be at least 12 characters in production")
        return self


settings = Settings()
