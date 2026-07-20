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


from app.models.category import Category, DEFAULT_CATEGORIES
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

@app.on_event("startup")
def on_startup() -> None:
    # Em produção use migrations (Alembic); create_all fica só para dev rápido.
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)
        
        # Seed default categories if database is empty
        with SessionLocal() as db:
            if db.query(Category).count() == 0:
                for name, icon, color, kind in DEFAULT_CATEGORIES:
                    db.add(Category(name=name, kind=kind, icon=icon, color=color))
                db.commit()


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
