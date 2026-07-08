from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionUpdateCategory, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _to_response(txn: Transaction) -> TransactionResponse:
    data = TransactionResponse.model_validate(txn)
    data.category_name = txn.category.name if txn.category else None
    return data


@router.get("", response_model=list[TransactionResponse])
def list_transactions(
    search: str | None = Query(None, description="Busca em linguagem natural (merchant, descrição, categoria)"),
    category_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account_ids = [a.id for a in current_user.accounts]
    query = db.query(Transaction).filter(Transaction.account_id.in_(account_ids))

    if search:
        like = f"%{search}%"
        query = query.filter(or_(Transaction.description.ilike(like), Transaction.merchant.ilike(like)))
    if category_id:
        query = query.filter(Transaction.category_id == category_id)

    transactions = query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()
    return [_to_response(t) for t in transactions]


@router.post("", response_model=TransactionResponse, status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    account_id = payload.account_id
    if not account_id:
        if not current_user.accounts:
            raise HTTPException(status_code=400, detail="Usuário não possui conta bancária")
        account_id = current_user.accounts[0].id

    direction = "income" if payload.amount >= 0 else "expense"
    txn = Transaction(
        account_id=account_id,
        date=payload.date,
        description=payload.description,
        merchant=payload.merchant,
        amount=payload.amount,
        direction=direction,
        category_id=payload.category_id,
        source="manual",
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return _to_response(txn)


@router.patch("/{transaction_id}/category", response_model=TransactionResponse)
def correct_category(transaction_id: str, payload: TransactionUpdateCategory, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    """
    Endpoint chamado quando o usuário corrige a categoria sugerida pela IA.
    Essa correção é o sinal usado por `services/categorization.py` para
    melhorar classificações futuras (few-shot para o LLM).
    """
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    txn.category_id = category.id
    txn.category_confidence = 1.0  # correção manual = confiança máxima
    db.commit()
    db.refresh(txn)
    return _to_response(txn)


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: str, payload: TransactionUpdate, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    # Ensure user owns the account
    if txn.account_id not in [a.id for a in current_user.accounts]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    update_data = payload.model_dump(exclude_unset=True)
    if "amount" in update_data:
        txn.direction = "income" if update_data["amount"] >= 0 else "expense"
        
    for key, value in update_data.items():
        setattr(txn, key, value)

    db.commit()
    db.refresh(txn)
    return _to_response(txn)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: str, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transação não encontrada")

    # Ensure user owns the account
    if txn.account_id not in [a.id for a in current_user.accounts]:
        raise HTTPException(status_code=403, detail="Acesso negado")

    db.delete(txn)
    db.commit()
    return None
