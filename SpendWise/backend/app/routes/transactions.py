from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session, contains_eager

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionOut

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def build_query(db: Session, user: User, search, category_id, type_, start_date, end_date):
    q = (
        db.query(Transaction)
        .join(Transaction.category)
        .options(contains_eager(Transaction.category))
        .filter(Transaction.user_id == user.id)
    )
    if search:
        like = f"%{search.strip()}%"
        q = q.filter(or_(Transaction.description.ilike(like), Category.name.ilike(like)))
    if category_id:
        q = q.filter(Transaction.category_id == category_id)
    if type_:
        q = q.filter(Transaction.type == type_)
    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)
    return q.order_by(Transaction.date.desc(), Transaction.id.desc())


def _check_category(db: Session, user: User, category_id: int, tx_type: str) -> None:
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.type != tx_type:
        raise HTTPException(status_code=400, detail=f"'{cat.name}' is an {cat.type} category, not {tx_type}")


def _own(db: Session, user: User, tx_id: int) -> Transaction:
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    search: str | None = None,
    category_id: int | None = None,
    type: Literal["income", "expense"] | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=5000),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return build_query(db, user, search, category_id, type, start_date, end_date).offset(skip).limit(limit).all()


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _check_category(db, user, data.category_id, data.type)
    tx = Transaction(user_id=user.id, **data.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(tx_id: int, data: TransactionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tx = _own(db, user, tx_id)
    _check_category(db, user, data.category_id, data.type)
    for key, value in data.model_dump().items():
        setattr(tx, key, value)
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=204)
def delete_transaction(tx_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tx = _own(db, user, tx_id)
    db.delete(tx)
    db.commit()
    return Response(status_code=204)
