from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionOut
from app.services.budget_service import month_range, spent_by_category

router = APIRouter(prefix="/analytics", tags=["Analytics"])

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _last_months(n: int) -> list[tuple[int, int]]:
    today = date.today()
    y, m, out = today.year, today.month, []
    for _ in range(n):
        out.append((y, m))
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    return out[::-1]


def _monthly(db: Session, user: User, months: int) -> list[dict]:
    keys = _last_months(months)
    start = date(keys[0][0], keys[0][1], 1)
    rows = (
        db.query(
            extract("year", Transaction.date),
            extract("month", Transaction.date),
            Transaction.type,
            func.sum(Transaction.amount),
        )
        .filter(Transaction.user_id == user.id, Transaction.date >= start)
        .group_by(extract("year", Transaction.date), extract("month", Transaction.date), Transaction.type)
        .all()
    )
    data = {k: {"income": 0.0, "expense": 0.0} for k in keys}
    for y, m, t, total in rows:
        key = (int(y), int(m))
        if key in data:
            data[key][t] = float(total)
    return [
        {
            "month": f"{y}-{m:02d}",
            "label": f"{MONTH_NAMES[m - 1]} {str(y)[2:]}",
            "income": round(v["income"], 2),
            "expense": round(v["expense"], 2),
            "savings": round(v["income"] - v["expense"], 2),
        }
        for (y, m), v in data.items()
    ]


def _categories(db: Session, user: User, type_: str, start_date, end_date) -> list[dict]:
    q = (
        db.query(Category.id, Category.name, Category.color, func.sum(Transaction.amount))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(Transaction.user_id == user.id, Transaction.type == type_)
    )
    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)
    rows = q.group_by(Category.id, Category.name, Category.color).all()
    out = [{"category_id": i, "name": n, "color": c, "total": round(float(t), 2)} for i, n, c, t in rows]
    return sorted(out, key=lambda r: r["total"], reverse=True)


@router.get("/monthly")
def monthly(months: int = Query(6, ge=1, le=24), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _monthly(db, user, months)


@router.get("/categories")
def categories(
    type: Literal["income", "expense"] = "expense",
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _categories(db, user, type, start_date, end_date)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    totals = dict(
        db.query(Transaction.type, func.sum(Transaction.amount)).filter(Transaction.user_id == user.id).group_by(Transaction.type).all()
    )
    total_income = float(totals.get("income", 0) or 0)
    total_expenses = float(totals.get("expense", 0) or 0)

    spent_map = spent_by_category(db, user.id, today.year, today.month)
    month_spent = sum(spent_map.values())
    budgets = db.query(Budget).filter(Budget.user_id == user.id, Budget.month == today.month, Budget.year == today.year).all()
    overall = next((b for b in budgets if b.category_id is None), None)
    monthly_budget = float(overall.amount) if overall else sum(float(b.amount) for b in budgets)
    utilization = round(month_spent / monthly_budget * 100, 1) if monthly_budget else 0.0

    start, end = month_range(today.year, today.month)
    month_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id, Transaction.type == "income", Transaction.date >= start, Transaction.date < end
    ).scalar()

    recent = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .limit(6)
        .all()
    )
    return {
        "total_balance": round(total_income - total_expenses, 2),
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "month_income": round(float(month_income or 0), 2),
        "month_expenses": round(month_spent, 2),
        "monthly_budget": round(monthly_budget, 2),
        "remaining_budget": round(monthly_budget - month_spent, 2),
        "budget_utilization": utilization,
        "recent_transactions": [TransactionOut.model_validate(t).model_dump(mode="json") for t in recent],
        "monthly": _monthly(db, user, 6),
        "categories": _categories(db, user, "expense", start, today),
    }
