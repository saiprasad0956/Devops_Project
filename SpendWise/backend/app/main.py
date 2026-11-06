import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

import app.models  # noqa: F401  (registers tables)
from app.core.config import settings
from app.database.session import Base, engine
from app.routes import analytics, auth, budgets, categories, reports, transactions

logger = logging.getLogger("spendwise")


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)  # creates tables on first start
    yield


app = FastAPI(
    title="SpendWise API",
    description="Smart Personal Expense Tracker REST API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


@app.exception_handler(SQLAlchemyError)
async def db_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "A database error occurred. Please try again."})


for r in (auth, transactions, categories, budgets, analytics, reports):
    app.include_router(r.router)


@app.get("/", tags=["Health"])
def root():
    return {"app": "SpendWise API", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
