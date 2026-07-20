from typing import Optional, List
from datetime import date

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    current_balance: float
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    financial_health_score: int  # 0-100
    top_categories: List["CategoryBreakdown"]
    cash_flow: List["CashFlowPoint"]
    upcoming_bills: List["UpcomingBill"]


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: Optional[str] = None


class CashFlowPoint(BaseModel):
    label: str
    income: float
    expenses: float


class UpcomingBill(BaseModel):
    merchant: str
    amount: float
    due_date: date


class Insight(BaseModel):
    id: str
    message: str
    kind: str  # "warning" | "positive" | "neutral" | "tip"
    icon: Optional[str] = None


class GoalResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    target_amount: float
    current_amount: float
    target_date: Optional[date] = None
    progress_percentage: float

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    target_amount: float
    current_amount: float = 0
    target_date: Optional[date] = None


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[date] = None


class SubscriptionCreate(BaseModel):
    merchant: str
    monthly_cost: float
    yearly_cost: float
    billing_cycle: str
    next_renewal: Optional[date] = None
    price_increased: bool = False
    is_active: bool = True


class SubscriptionUpdate(BaseModel):
    merchant: Optional[str] = None
    monthly_cost: Optional[float] = None
    yearly_cost: Optional[float] = None
    billing_cycle: Optional[str] = None
    next_renewal: Optional[date] = None
    price_increased: Optional[bool] = None
    is_active: Optional[bool] = None


class SubscriptionResponse(BaseModel):
    id: str
    merchant: str
    monthly_cost: float
    yearly_cost: float
    billing_cycle: str
    next_renewal: Optional[date] = None
    price_increased: bool
    is_active: bool

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    chart_data: Optional[dict] = None
