# SpendWise - Smart Personal Expense Tracker

SpendWise is a personal finance application with a React, Vite, and Tailwind CSS frontend, a FastAPI backend, and PostgreSQL. Docker Compose runs the database, API, and web frontend as separate services.

## Architecture

- **Frontend:** React and Vite, served by Nginx in the Docker deployment.
- **Backend:** FastAPI and SQLAlchemy; the API creates its tables on startup.
- **Database:** PostgreSQL 16, persisted in the named `postgres_data` Docker volume.
- **CI/CD:** Jenkins validates the backend and builds the frontend, then builds and deploys the application images with Docker Compose.

## Prerequisites

For local development, install Node.js 20+, Python 3.11+, and PostgreSQL 16+. For the container deployment, install Docker Engine or Docker Desktop with the Docker Compose v2 plugin. Check versions with `node --version`, `python --version`, `psql --version`, and `docker compose version`.

The Jenkins pipeline needs a Linux agent with Python 3, Node.js/npm, Docker CLI, Docker Compose v2, and access to the Docker daemon.

## Local development

### Backend

Create a PostgreSQL database named `spendwise`, then open a terminal in `SpendWise/backend`.

**macOS/Linux**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

**Windows PowerShell**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set the database URL and a strong `SECRET_KEY` in `backend/.env`. Generate a key with `python -c "import secrets; print(secrets.token_hex(32))"`. Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs. Use **Authorize** and a token from `/auth/login` to try protected endpoints.

### Frontend

In another terminal, open `SpendWise/frontend`:

```bash
npm install
npm run dev
```

The development frontend is at http://localhost:5173.

## Docker Compose deployment

The Compose stack needs `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `SECRET_KEY`. Start from the placeholder template and replace every `replace-with-...` value with your own. The database password should be URL-safe because it is included in `DATABASE_URL`. Never commit the completed environment file.

For local deployment, run the following from the `SpendWise` directory. The copy step preserves an existing environment file; edit the new copy with your local values before starting the stack.

**Windows PowerShell**
```powershell
$envFile = "$env:USERPROFILE\SpendWise-jenkins.env"
if (-not (Test-Path $envFile)) { Copy-Item .env.example $envFile }
# Edit $envFile, then run:
docker compose --env-file "$envFile" config --quiet
docker compose --env-file "$envFile" up --detach --build --wait --wait-timeout 180
docker compose --env-file "$envFile" ps
```

**macOS/Linux**
```bash
env_file="$HOME/SpendWise-jenkins.env"
if [ ! -e "$env_file" ]; then cp .env.example "$env_file"; fi
# Edit "$env_file", then run:
docker compose --env-file "$env_file" config --quiet
docker compose --env-file "$env_file" up --detach --build --wait --wait-timeout 180
docker compose --env-file "$env_file" ps
```

The web app is at http://localhost, and the API docs are at http://localhost:8000/docs. The named `postgres_data` volume preserves database contents across deployments. Do not use `docker compose down -v`; it deletes the database volume.

## Jenkins CI/CD

1. Configure the `SpendWise-Pipeline` job to build the `main` branch and use `SpendWise/Jenkinsfile` as its script path.
2. Add a Jenkins **Secret file** credential with ID `SpendWise-env`. Its file must define `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `SECRET_KEY`. Keep actual values only in Jenkins credentials or a local, ignored env file.
3. Ensure the job's Linux agent has the prerequisites listed above and Docker daemon access.
4. Run the job. The pipeline checks out the repository, sets up and validates the backend, installs and builds the frontend, validates the Compose configuration with the secret file, builds the backend/frontend images, then starts the Compose services and waits for their health checks.

The root `jenkins/Dockerfile` provides a Jenkins image with Docker Compose v2 installed. Build it from the repository root with `docker build -t spendwise-jenkins:latest ./jenkins`.

The current Jenkinsfile has two deployment stages (`Deploy SpendWise` and `Deploy`) that run the Compose deployment commands. Both have been left unchanged to preserve the existing pipeline.

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
backend/app/       FastAPI routes, models, schemas, services, and database setup
frontend/src/      React components, pages, hooks, and API services
docker-compose.yml PostgreSQL, backend, and frontend services
Jenkinsfile        Jenkins CI/CD pipeline
```

## Troubleshooting
| Problem | Fix |
|---|---|
| `password authentication failed` | Check the local `DATABASE_URL` or Compose env file. For Compose, use a URL-safe `POSTGRES_PASSWORD`. |
| `database "spendwise" does not exist` | Run the `CREATE DATABASE` step |
| Frontend: "Cannot reach the server" | Backend not running on port 8000 |
| CORS error in browser | Add your frontend URL to `CORS_ORIGINS` in `backend/.env`, restart backend |
| `Activate.ps1 cannot be loaded` (Windows) | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Port already in use | Stop the other process or use `--port 8001` (and update `VITE_API_URL`) |

## Notes
- Currency: change `CURRENCY` in `frontend/src/utils/format.js`.
- Tables are created with `create_all`. Alembic migrations can be added later when you change the schema.
