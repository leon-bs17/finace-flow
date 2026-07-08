import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id: Mapped[str] = mapped_column(String(36), ForeignKey("accounts.id"))
    category_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("categories.id"), nullable=True)

    date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(String(500))
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(14, 2))  # positivo = receita, negativo = despesa
    direction: Mapped[str] = mapped_column(String(10))  # "income" | "expense"

    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    is_duplicate_suspect: Mapped[bool] = mapped_column(Boolean, default=False)
    is_fraud_suspect: Mapped[bool] = mapped_column(Boolean, default=False)
    category_confidence: Mapped[float] = mapped_column(Numeric(4, 3), default=0)  # confiança da IA (0-1)
    source: Mapped[str] = mapped_column(String(20), default="manual")  # csv | pdf | xlsx | ofx | manual

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
