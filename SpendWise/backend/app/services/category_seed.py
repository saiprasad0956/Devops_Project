from sqlalchemy.orm import Session

from app.models.category import Category

DEFAULT_CATEGORIES = [
    ("Food & Dining", "expense", "#f97316"),
    ("Rent", "expense", "#6366f1"),
    ("Transport", "expense", "#0ea5e9"),
    ("Shopping", "expense", "#ec4899"),
    ("Bills & Utilities", "expense", "#eab308"),
    ("Entertainment", "expense", "#8b5cf6"),
    ("Health", "expense", "#ef4444"),
    ("Education", "expense", "#14b8a6"),
    ("Other", "expense", "#64748b"),
    ("Salary", "income", "#10b981"),
    ("Freelance", "income", "#22c55e"),
    ("Investments", "income", "#06b6d4"),
    ("Other Income", "income", "#84cc16"),
]


def seed_default_categories(db: Session, user_id: int) -> None:
    for name, type_, color in DEFAULT_CATEGORIES:
        db.add(Category(user_id=user_id, name=name, type=type_, color=color))
