from datetime import date

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: str
    date: date
    description: str
    merchant: str | None
    amount: float
    direction: str
    category_id: str | None
    category_name: str | None = None
    is_recurring: bool
    is_duplicate_suspect: bool
    is_fraud_suspect: bool

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    account_id: str | None = None
    date: date
    description: str
    merchant: str | None = None
    amount: float
    category_id: str | None = None

class TransactionUpdate(BaseModel):
    date: date | None = None
    description: str | None = None
    merchant: str | None = None
    amount: float | None = None
    category_id: str | None = None


class TransactionUpdateCategory(BaseModel):
    category_id: str


class UploadResult(BaseModel):
    filename: str
    transactions_imported: int
    duplicates_skipped: int
    categorized_automatically: int
    preview: list[TransactionResponse]
