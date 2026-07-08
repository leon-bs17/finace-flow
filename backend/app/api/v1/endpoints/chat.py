from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.endpoints.dashboard import get_summary
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.dashboard import ChatRequest, ChatResponse
from app.services.ai_assistant import ask_financial_assistant

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Reaproveita o resumo do dashboard como contexto factual para o LLM,
    # garantindo que a resposta seja fundamentada nos dados reais do usuário.
    summary = get_summary(db=db, current_user=current_user)
    context = summary.model_dump()

    reply = ask_financial_assistant(
        question=payload.message,
        financial_context=context,
        history=[m.model_dump() for m in payload.history],
    )
    return ChatResponse(reply=reply, chart_data=None)
