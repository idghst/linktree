# 파일 목적: 애플리케이션 설정 관리 (pydantic-settings)
# 주요 기능: 환경변수 파싱 - DB URL, JWT, CORS, 서버 설정
# 사용 방법: from app.core.config import settings

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # 기본 환경
    environment: str = "development"

    # 보안
    secret_key: str = "your-super-secret-key-change-in-production-minimum-32-chars"

    # 데이터베이스
    database_url: str = "postgresql+asyncpg://linktree:linktree_password@postgres:5432/linktree_db"

    # JWT
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # 서버
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
