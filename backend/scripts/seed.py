import sys
import os
from datetime import datetime, timedelta
import random

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction

def seed():
    # Cria as tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter(User.email == "teste@financeflow.com").first()
        if not user:
            print("Criando usuário de teste...")
            user = User(
                name="Usuário de Teste",
                email="teste@financeflow.com",
                hashed_password=hash_password("123456"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print("Usuário já existe, limpando dados antigos...")
            # Limpa transações e contas para evitar duplicidade
            db.query(Transaction).filter(Transaction.account_id.in_([a.id for a in user.accounts])).delete(synchronize_session=False)
            db.query(Account).filter(Account.user_id == user.id).delete(synchronize_session=False)
            db.commit()

        # Cria Conta
        print("Criando conta bancária...")
        account = Account(
            user_id=user.id,
            name="Conta Corrente",
            institution="Banco FinanceFlow",
            account_type="checking",
            current_balance=12480.35,
        )
        db.add(account)
        db.commit()
        db.refresh(account)

        # Categorias
        category_names = ["Alimentação", "Transporte", "Moradia", "Assinaturas", "Saúde", "Salário", "Compras"]
        categories = {}
        for name in category_names:
            cat = db.query(Category).filter(Category.name == name).first()
            if not cat:
                cat = Category(name=name, kind="income" if name == "Salário" else "expense")
                db.add(cat)
                db.commit()
                db.refresh(cat)
            categories[name] = cat.id

        # Transações MOCK
        print("Criando transações...")
        transactions = [
            {"desc": "Supermercado Pão de Açúcar", "cat": "Alimentação", "amt": -312.50, "days": 1},
            {"desc": "Salário Empresa XYZ", "cat": "Salário", "amt": 7800.00, "days": 3},
            {"desc": "Spotify Premium", "cat": "Assinaturas", "amt": -21.90, "days": 4},
            {"desc": "Uber - Av. Paulista", "cat": "Transporte", "amt": -38.70, "days": 4},
            {"desc": "Farmácia Drogasil", "cat": "Saúde", "amt": -89.90, "days": 5},
            {"desc": "iFood - McDonald's", "cat": "Alimentação", "amt": -67.40, "days": 6},
            {"desc": "Netflix", "cat": "Assinaturas", "amt": -55.90, "days": 7},
            {"desc": "Amazon - Livros", "cat": "Compras", "amt": -189.90, "days": 8},
        ]
        
        # Add random transactions for the last 6 months for chart data
        for i in range(50):
            days_ago = random.randint(10, 180)
            cat_name = random.choice([c for c in category_names if c != "Salário"])
            amt = round(random.uniform(-10, -500), 2)
            transactions.append({
                "desc": f"Compra {cat_name} {i}",
                "cat": cat_name,
                "amt": amt,
                "days": days_ago
            })
            
        for i in range(5):
            days_ago = random.randint(30, 180)
            transactions.append({
                "desc": f"Salário Mensal",
                "cat": "Salário",
                "amt": round(random.uniform(7000, 8000), 2),
                "days": days_ago
            })

        for t in transactions:
            txn_date = datetime.utcnow().date() - timedelta(days=t["days"])
            db.add(Transaction(
                account_id=account.id,
                category_id=categories[t["cat"]],
                date=txn_date,
                description=t["desc"],
                merchant=t["desc"].split()[0],
                amount=t["amt"],
                direction="income" if t["amt"] > 0 else "expense",
                source="manual",
                category_confidence=0.9
            ))
            
        db.commit()
        print("Seed concluído com sucesso!")
        
    except Exception as e:
        print(f"Erro no seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
