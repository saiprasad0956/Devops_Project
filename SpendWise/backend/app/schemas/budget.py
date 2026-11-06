from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.category import CategoryOut


class BudgetCreate(BaseModel):
    category_id: int | None = None  # None = overall monthly budget
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)


class BudgetOut(BaseModel):
    id: int
    category_id: int | None
    category: CategoryOut | None
    amount: float
    month: int
    year: int
    spent: float
    remaining: float
    percentage: float
    status: str  # ok | warning | exceeded
