from datetime import date

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    current_balance: float
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    financial_health_score: int  # 0-100
    top_categories: list["CategoryBreakdown"]
    cash_flow: list["CashFlowPoint"]
    upcoming_bills: list["UpcomingBill"]


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str | None = None


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
    icon: str | None = None


class GoalResponse(BaseModel):
    id: str
    name: str
    icon: str | None
    target_amount: float
    current_amount: float
    target_date: date | None
    progress_percentage: float

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    name: str
    icon: str | None = None
    target_amount: float
    current_amount: float = 0
    target_date: date | None = None


class GoalUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    target_amount: float | None = None
    current_amount: float | None = None
    target_date: date | None = None


class SubscriptionCreate(BaseModel):
    merchant: str
    monthly_cost: float
    yearly_cost: float
    billing_cycle: str
    next_renewal: date | None = None
    price_increased: bool = False
    is_active: bool = True

class SubscriptionUpdate(BaseModel):
    merchant: str | None = None
    monthly_cost: float | None = None
    yearly_cost: float | None = None
    billing_cycle: str | None = None
    next_renewal: date | None = None
    price_increased: bool | None = None
    is_active: bool | None = None


class SubscriptionResponse(BaseModel):
    id: str
    merchant: str
    monthly_cost: float
    yearly_cost: float
    billing_cycle: str
    next_renewal: date | None
    price_increased: bool
    is_active: bool

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    chart_data: dict | None = None
