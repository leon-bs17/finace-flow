from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import UploadResult
from app.services.categorization import categorize_transaction
from app.services.statement_parser import parse_statement

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = (".csv", ".xlsx", ".xls", ".ofx", ".pdf")


@router.post("/statement", response_model=UploadResult)
async def upload_statement(
    file: UploadFile = File(...),
    account_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not account_id:
        if not current_user.accounts:
            raise HTTPException(status_code=400, detail="Usuário não possui conta bancária")
        account_id = current_user.accounts[0].id

    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail=f"Formato não suportado. Use: {', '.join(ALLOWED_EXTENSIONS)}")

    file_bytes = await file.read()
    try:
        parsed_transactions = parse_statement(file_bytes, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    existing_descriptions = {
        (t.date, t.amount, t.description)
        for t in db.query(Transaction).filter(Transaction.account_id == account_id).all()
    }

    imported, duplicates, auto_categorized = [], 0, 0
    for parsed in parsed_transactions:
        key = (parsed.date, parsed.amount, parsed.description)
        if key in existing_descriptions:
            duplicates += 1
            continue

        category_name, confidence = categorize_transaction(parsed.description, merchant=None)
        category = db.query(Category).filter(Category.name == category_name).first()
        if confidence > 0:
            auto_categorized += 1

        txn = Transaction(
            account_id=account_id,
            date=parsed.date,
            description=parsed.description,
            amount=parsed.amount,
            direction="income" if parsed.amount >= 0 else "expense",
            category_id=category.id if category else None,
            category_confidence=confidence,
            source=file.filename.split(".")[-1].lower(),
        )
        db.add(txn)
        imported.append(txn)

    db.commit()
    for txn in imported:
        db.refresh(txn)

    return UploadResult(
        filename=file.filename,
        transactions_imported=len(imported),
        duplicates_skipped=duplicates,
        categorized_automatically=auto_categorized,
        preview=imported[:10],
    )
