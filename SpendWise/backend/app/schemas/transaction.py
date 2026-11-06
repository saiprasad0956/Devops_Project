import datetime as dt
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryOut


class TransactionCreate(BaseModel):
    type: Literal["income", "expense"]
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category_id: int
    date: dt.date
    description: str | None = Field(default=None, max_length=255)


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    amount: float
    description: str | None
    date: dt.date
    category_id: int
    category: CategoryOut
    created_at: dt.datetime
