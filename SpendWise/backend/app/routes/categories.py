from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])


def _own(db: Session, user: User, category_id: int) -> Category:
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Category).filter(Category.user_id == user.id).order_by(Category.type, Category.name).all()


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    name = data.name.strip()
    if db.query(Category).filter(Category.user_id == user.id, Category.name == name, Category.type == data.type).first():
        raise HTTPException(status_code=409, detail="Category already exists")
    cat = Category(user_id=user.id, name=name, type=data.type, color=data.color)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, data: CategoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = _own(db, user, category_id)
    if data.type != cat.type:
        raise HTTPException(status_code=400, detail="Category type cannot be changed")
    name = data.name.strip()
    clash = db.query(Category).filter(
        Category.user_id == user.id, Category.name == name, Category.type == cat.type, Category.id != cat.id
    ).first()
    if clash:
        raise HTTPException(status_code=409, detail="Category already exists")
    cat.name, cat.color = name, data.color
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = _own(db, user, category_id)
    if db.query(Transaction).filter(Transaction.category_id == cat.id).count() > 0:
        raise HTTPException(status_code=409, detail="Category has transactions. Delete or move them first")
    db.delete(cat)
    db.commit()
    return Response(status_code=204)
