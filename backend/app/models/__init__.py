# Importa todos os modelos para que o SQLAlchemy os registre no metadata
# OBRIGATÓRIO: este arquivo deve ser importado antes de Base.metadata.create_all()
from app.models.user import User  # noqa: F401
from app.models.account import Account  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.subscription import Subscription, Goal  # noqa: F401
