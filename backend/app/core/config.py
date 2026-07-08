"""Configuração central da aplicação, carregada a partir de variáveis de ambiente."""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve o caminho do .env independente de onde o processo é iniciado.
# Tenta primeiro o .env na raiz do projeto (dois níveis acima deste arquivo),
# depois o .env local (na pasta backend/) como fallback.
_root_env = Path(__file__).resolve().parents[3] / ".env"
_local_env = Path(__file__).resolve().parents[3] / "backend" / ".env"
_env_files = [str(p) for p in [_root_env, _local_env] if p.exists()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_files or ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    PROJECT_NAME: str = "FinanceFlow API"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Banco de dados
    # Default: SQLite local para dev sem Docker (sem dependências externas)
    DATABASE_URL: str = "sqlite:///./financeflow.db"

    # Segurança
    SECRET_KEY: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # IA
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    AI_PROVIDER: str = "openai"

    # Storage
    STORAGE_PROVIDER: str = "local"
    S3_BUCKET_NAME: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_REGION: str = "us-east-1"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
