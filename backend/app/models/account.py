from __future__ import annotations
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Account(Base):
    """Uma conta bancária/cartão vinculada ao usuário (suporte multi-conta)."""
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(255))
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    account_type: Mapped[str] = mapped_column(String(50), default="checking")  # checking, credit_card, savings
    currency: Mapped[str] = mapped_column(String(3), default="BRL")
    current_balance: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
