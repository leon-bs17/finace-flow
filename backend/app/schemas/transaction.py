from typing import Optional
from datetime import date

from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: str
    name: str
    type: str
    icon: Optional[str] = None
    color: Optional[str] = None

    model_config = {"from_attributes": True}


class TransactionResponse(BaseModel):
    id: str
    date: date
    description: str
    merchant: Optional[str] = None
    amount: float
    direction: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    is_recurring: bool
    is_duplicate_suspect: bool
    is_fraud_suspect: bool

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    account_id: Optional[str] = None
    date: date
    description: str
    merchant: Optional[str] = None
    amount: float
    category_id: Optional[str] = None


class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[str] = None


class TransactionUpdateCategory(BaseModel):
    category_id: str


class UploadResult(BaseModel):
    filename: str
    transactions_imported: int
    duplicates_skipped: int
    categorized_automatically: int
    preview: list
