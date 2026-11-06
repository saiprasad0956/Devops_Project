from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import PasswordChange, Token, UserCreate, UserLogin, UserOut, UserUpdate
from app.services.category_seed import seed_default_categories

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(full_name=data.full_name.strip(), email=email, hashed_password=hash_password(data.password))
    db.add(user)
    db.flush()
    seed_default_categories(db, user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    email = data.email.lower()
    clash = db.query(User).filter(User.email == email, User.id != user.id).first()
    if clash:
        raise HTTPException(status_code=409, detail="This email is already used by another account")
    user.full_name = data.full_name.strip()
    user.email = email
    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password")
def change_password(data: PasswordChange, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
