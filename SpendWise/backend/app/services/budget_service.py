from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.transaction import Transaction


def month_range(year: int, month: int) -> tuple[date, date]:
    """Returns (first day of month, first day of next month)."""
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


def spent_by_category(db: Session, user_id: int, year: int, month: int) -> dict[int, float]:
    start, end = month_range(year, month)
    rows = (
        db.query(Transaction.category_id, func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= start,
            Transaction.date < end,
        )
        .group_by(Transaction.category_id)
        .all()
    )
    return {cid: float(total) for cid, total in rows}


def serialize_budget(budget: Budget, spent_map: dict[int, float]) -> dict:
    amount = float(budget.amount)
    if budget.category_id is None:
        spent = sum(spent_map.values())
    else:
        spent = spent_map.get(budget.category_id, 0.0)
    pct = round(spent / amount * 100, 1) if amount else 0.0
    status = "exceeded" if pct >= 100 else "warning" if pct >= 80 else "ok"
    return {
        "id": budget.id,
        "category_id": budget.category_id,
        "category": budget.category,
        "amount": amount,
        "month": budget.month,
        "year": budget.year,
        "spent": round(spent, 2),
        "remaining": round(amount - spent, 2),
        "percentage": pct,
        "status": status,
    }
