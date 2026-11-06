from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, Numeric, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.database.session import Base


class Budget(Base):
    """A monthly budget. category_id NULL means an overall budget for the month."""

    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "category_id", "month", "year", name="uq_budget_user_cat_month_year"),
        CheckConstraint("amount > 0", name="ck_budget_amount_positive"),
        CheckConstraint("month BETWEEN 1 AND 12", name="ck_budget_month"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
