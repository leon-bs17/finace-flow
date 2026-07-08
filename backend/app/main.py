from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
import app.models  # noqa: F401 — registra todos os modelos no metadata

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="API do FinanceFlow — finanças pessoais organizadas automaticamente por IA.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def on_startup() -> None:
    # Em produção use migrations (Alembic); create_all fica só para dev rápido.
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
