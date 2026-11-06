from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetOut
from app.services.budget_service import serialize_budget, spent_by_category

router = APIRouter(prefix="/budgets", tags=["Budgets"])


def _own(db: Session, user: User, budget_id: int) -> Budget:
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    return b


def _validate(db: Session, user: User, data: BudgetCreate, exclude_id: int | None = None) -> None:
    if data.category_id is not None:
        cat = db.query(Category).filter(Category.id == data.category_id, Category.user_id == user.id).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        if cat.type != "expense":
            raise HTTPException(status_code=400, detail="Budgets can only be set for expense categories")
    q = db.query(Budget).filter(Budget.user_id == user.id, Budget.month == data.month, Budget.year == data.year)
    q = q.filter(Budget.category_id.is_(None) if data.category_id is None else Budget.category_id == data.category_id)
    if exclude_id:
        q = q.filter(Budget.id != exclude_id)
    if q.first():
        raise HTTPException(status_code=409, detail="A budget for this category and month already exists")


def _out(db: Session, user: User, budget: Budget) -> dict:
    return serialize_budget(budget, spent_by_category(db, user.id, budget.year, budget.month))


@router.get("", response_model=list[BudgetOut])
def list_budgets(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    month, year = month or today.month, year or today.year
    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.user_id == user.id, Budget.month == month, Budget.year == year)
        .all()
    )
    spent = spent_by_category(db, user.id, year, month)
    result = [serialize_budget(b, spent) for b in budgets]
    result.sort(key=lambda r: (r["category_id"] is not None, -r["percentage"]))
    return result


@router.post("", response_model=BudgetOut, status_code=201)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _validate(db, user, data)
    b = Budget(user_id=user.id, **data.model_dump())
    db.add(b)
    db.commit()
    db.refresh(b)
    return _out(db, user, b)


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(budget_id: int, data: BudgetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = _own(db, user, budget_id)
    _validate(db, user, data, exclude_id=b.id)
    for key, value in data.model_dump().items():
        setattr(b, key, value)
    db.commit()
    db.refresh(b)
    return _out(db, user, b)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = _own(db, user, budget_id)
    db.delete(b)
    db.commit()
    return Response(status_code=204)
