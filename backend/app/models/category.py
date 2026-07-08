import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    kind: Mapped[str] = mapped_column(String(20), default="expense")  # expense | income

    transactions = relationship("Transaction", back_populates="category")


# Categorias padrão semeadas na inicialização (ver services/categorization.py)
DEFAULT_CATEGORIES = [
    ("Alimentação", "🍔", "#F2A65A", "expense"),
    ("Transporte", "🚗", "#5B8DEF", "expense"),
    ("Moradia", "🏠", "#8E7CC3", "expense"),
    ("Compras", "🛍️", "#E76F8B", "expense"),
    ("Assinaturas", "📺", "#3EB489", "expense"),
    ("Entretenimento", "🎮", "#F26B6B", "expense"),
    ("Saúde", "🩺", "#4FC3D9", "expense"),
    ("Educação", "🎓", "#9AA5B1", "expense"),
    ("Investimentos", "📈", "#3EB489", "income"),
    ("Contas", "🧾", "#F2A65A", "expense"),
    ("Salário", "💼", "#3EB489", "income"),
    ("Freelance", "💻", "#3EB489", "income"),
    ("Poupança", "🐷", "#5B8DEF", "expense"),
]
