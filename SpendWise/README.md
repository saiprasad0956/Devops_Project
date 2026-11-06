# SpendWise – Smart Personal Expense Tracker

React + Vite + Tailwind frontend · FastAPI backend · PostgreSQL database.

## 1. Prerequisites
Node.js 20+, Python 3.11+, PostgreSQL 16+. Check with `node -v`, `python --version`, `psql --version`.

## 2. Create the database (once)
```bash
psql -U postgres
```
```sql
CREATE DATABASE spendwise;
\q
```

## 3. Run the backend (Terminal 1)
Open a terminal in `SpendWise/backend`.

**Mac/Linux**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
**Windows (PowerShell)**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```
Edit `.env`: put your real postgres password in `DATABASE_URL` and set `SECRET_KEY`
(generate: `python -c "import secrets; print(secrets.token_hex(32))"`).

Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```
Tables are created automatically on first start. API docs: http://localhost:8000/docs
(click **Authorize** and paste the token from `/auth/login` to try protected endpoints).

## 4. Run the frontend (Terminal 2)
Open a second terminal in `SpendWise/frontend`:
```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```
Open http://localhost:5173, register an account and start adding data.

## Features
- Register / login (JWT, bcrypt hashed passwords), logout, profile update, change password
- Dashboard: balance, income, expenses, budget utilization, charts, recent transactions
- Transactions: add / edit / delete, search, filter by type, category and date
- Budgets: per-category or overall monthly budgets, progress bars, warnings at 80% and when exceeded
- Analytics: monthly spending, income vs expense, trends, category breakdown (Recharts)
- Reports: date/type/category filters, CSV export
- Every query is filtered by the logged-in user, so data is private per account
- 13 default categories are created for each new user

## Project structure
```
backend/app/  routes/ models/ schemas/ services/ core/ database/ main.py
frontend/src/ components/ pages/ layouts/ services/ hooks/ context/ utils/ App.jsx
```

## Troubleshooting
| Problem | Fix |
|---|---|
| `password authentication failed` | Wrong password in `backend/.env` `DATABASE_URL` (URL-encode special characters, e.g. `@` → `%40`) |
| `database "spendwise" does not exist` | Run the `CREATE DATABASE` step |
| Frontend: "Cannot reach the server" | Backend not running on port 8000 |
| CORS error in browser | Add your frontend URL to `CORS_ORIGINS` in `backend/.env`, restart backend |
| `Activate.ps1 cannot be loaded` (Windows) | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Port already in use | Stop the other process or use `--port 8001` (and update `VITE_API_URL`) |

## Notes
- Currency: change `CURRENCY` in `frontend/src/utils/format.js`.
- Tables are created with `create_all`. Alembic migrations can be added later when you change the schema.
