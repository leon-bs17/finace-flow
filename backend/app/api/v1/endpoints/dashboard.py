from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.dashboard import CashFlowPoint, CategoryBreakdown, DashboardSummary, Insight, UpcomingBill
from app.services.forecasting import financial_health_score
from app.services.insights import CategoryTotals, generate_insights

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    account_ids = [a.id for a in current_user.accounts]
    today = date.today()
    month_start = today.replace(day=1)

    month_txns = (
        db.query(Transaction)
        .filter(Transaction.account_id.in_(account_ids), Transaction.date >= month_start)
        .all()
    )

    income = sum(float(t.amount) for t in month_txns if t.direction == "income")
    expenses = abs(sum(float(t.amount) for t in month_txns if t.direction == "expense"))
    balance = sum(float(a.current_balance) for a in current_user.accounts)

    by_category: dict[str, float] = {}
    for t in month_txns:
        if t.direction == "expense" and t.category:
            by_category[t.category.name] = by_category.get(t.category.name, 0) + abs(float(t.amount))

    total_expenses = sum(by_category.values()) or 1
    top_categories = [
        CategoryBreakdown(category=name, amount=amount, percentage=round(amount / total_expenses * 100, 1))
        for name, amount in sorted(by_category.items(), key=lambda kv: kv[1], reverse=True)[:6]
    ]

    savings_rate = max(0.0, (income - expenses) / income) if income else 0.0
    score = financial_health_score(savings_rate=savings_rate, on_time_bill_ratio=0.9, budget_adherence=0.8)

    return DashboardSummary(
        current_balance=balance,
        monthly_income=income,
        monthly_expenses=expenses,
        monthly_savings=max(0.0, income - expenses),
        financial_health_score=score,
        top_categories=top_categories,
        cash_flow=_last_six_months_cash_flow(db, account_ids),
        upcoming_bills=[],  # populado quando o serviço de assinaturas roda (ver subscriptions.py)
    )


@router.get("/insights", response_model=list[Insight])
def get_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    account_ids = [a.id for a in current_user.accounts]
    today = date.today()
    month_start = today.replace(day=1)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)

    current = _category_totals(db, account_ids, month_start, today)
    previous = _category_totals(db, account_ids, prev_month_start, month_start - timedelta(days=1))

    totals = [
        CategoryTotals(category=cat, current_month=current.get(cat, 0), previous_month=previous.get(cat, 0))
        for cat in set(current) | set(previous)
    ]

    raw_insights = generate_insights(
        category_totals=totals,
        unused_subscriptions=[],  # ver services/subscription_detector.py para popular de fato
        recurring_waste=0,
        current_total=sum(current.values()),
        historical_average=sum(previous.values()) or 1,
    )
    return [Insight(**i) for i in raw_insights]


def _category_totals(db: Session, account_ids: list[str], start: date, end: date) -> dict[str, float]:
    rows = (
        db.query(Category.name, func.sum(func.abs(Transaction.amount)))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(Transaction.account_id.in_(account_ids), Transaction.date >= start, Transaction.date <= end,
                Transaction.direction == "expense")
        .group_by(Category.name)
        .all()
    )
    return {name: float(total) for name, total in rows}


def _last_six_months_cash_flow(db: Session, account_ids: list[str]) -> list[CashFlowPoint]:
    points = []
    today = date.today()
    for i in range(5, -1, -1):
        month_date = (today.replace(day=1) - timedelta(days=30 * i)).replace(day=1)
        next_month = (month_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        txns = (
            db.query(Transaction)
            .filter(Transaction.account_id.in_(account_ids), Transaction.date >= month_date, Transaction.date < next_month)
            .all()
        )
        income = sum(float(t.amount) for t in txns if t.direction == "income")
        expenses = abs(sum(float(t.amount) for t in txns if t.direction == "expense"))
        points.append(CashFlowPoint(label=month_date.strftime("%b"), income=income, expenses=expenses))
    return points
