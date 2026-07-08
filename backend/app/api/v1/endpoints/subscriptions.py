from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.subscription import Subscription
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.dashboard import SubscriptionResponse, SubscriptionCreate, SubscriptionUpdate
from app.services.subscription_detector import TxnPoint, detect_recurring_payments

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


def _to_response(sub: Subscription) -> SubscriptionResponse:
    data = SubscriptionResponse.model_validate(sub)
    data.yearly_cost = round(float(sub.monthly_cost) * 12, 2)
    return data


@router.get("", response_model=list[SubscriptionResponse])
def list_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subs = db.query(Subscription).filter(Subscription.user_id == current_user.id, Subscription.is_active.is_(True)).all()
    return [_to_response(s) for s in subs]


@router.post("/detect", response_model=list[SubscriptionResponse])
def run_detection(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Roda o detector de recorrência sobre o histórico de transações do usuário
    e materializa/atualiza os registros de `Subscription`. Pensado para rodar
    periodicamente (ex. job noturno) além de sob demanda pelo usuário.
    """
    account_ids = [a.id for a in current_user.accounts]
    txns = db.query(Transaction).filter(Transaction.account_id.in_(account_ids), Transaction.direction == "expense").all()

    points = [TxnPoint(merchant=t.merchant or t.description, date=t.date, amount=float(t.amount)) for t in txns]
    detected = detect_recurring_payments(points)

    for d in detected:
        existing = db.query(Subscription).filter(
            Subscription.user_id == current_user.id, Subscription.merchant == d["merchant"]
        ).first()
        if existing:
            existing.monthly_cost = d["monthly_cost"]
            existing.billing_cycle = d["billing_cycle"]
            existing.last_price = d["last_price"]
            existing.price_increased = d["price_increased"]
        else:
            db.add(Subscription(
                user_id=current_user.id,
                merchant=d["merchant"],
                monthly_cost=d["monthly_cost"],
                billing_cycle=d["billing_cycle"],
                last_price=d["last_price"],
                price_increased=d["price_increased"],
            ))
    db.commit()

    subs = db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
    return [_to_response(s) for s in subs]


@router.post("", response_model=SubscriptionResponse, status_code=201)
def create_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = Subscription(user_id=current_user.id, **payload.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return _to_response(sub)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(subscription_id: str, payload: SubscriptionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sub, key, value)

    db.commit()
    db.refresh(sub)
    return _to_response(sub)


@router.delete("/{subscription_id}", status_code=204)
def delete_subscription(subscription_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")
    db.delete(sub)
    db.commit()
