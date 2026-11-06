import csv
import io
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.routes.transactions import build_query

router = APIRouter(prefix="/reports", tags=["Reports"])


def _safe(value: str) -> str:
    """Prevent CSV/Excel formula injection."""
    return "'" + value if value and value[0] in "=+-@\t\r" else value


@router.get("/export")
def export_csv(
    start_date: date | None = None,
    end_date: date | None = None,
    type: Literal["income", "expense"] | None = None,
    category_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = build_query(db, user, None, category_id, type, start_date, end_date).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Date", "Type", "Category", "Description", "Amount"])
    for t in rows:
        writer.writerow([t.date.isoformat(), t.type, _safe(t.category.name), _safe(t.description or ""), f"{t.amount:.2f}"])
    filename = f"spendwise_report_{date.today().isoformat()}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
