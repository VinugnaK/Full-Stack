# SmartTask

SmartTask is a full-stack task management application that helps teams and individuals plan, track, and assess risk for work items. It combines a React + Vite frontend with a Node.js + Express backend, a MySQL database, and an optional small Python AI microservice. Tasks are automatically scored for overrun risk using rule-based heuristics and the system provides basic productivity analytics.

## Quick links
- Backend: `backend/`
- Frontend: `frontend/`
- Optional AI microservice: `ai-service/`
- Database schema & seed: `database/schema.sql`, `database/seed.sql`
- Demo: `fullstack_demo.mp4`
- Helper scripts: `callback.py`, `fix-commits.py`, `redate.py`

## Stack
- Languages: JavaScript (Node.js), JSX (React), Python (optional microservice), SQL
- Framework / runtime:
  - Backend: Node.js + Express
  - Frontend: React + Vite + Tailwind CSS
  - AI microservice: Python (Flask / FastAPI style lightweight service)
- Notable libraries:
  - express, mysql2, jsonwebtoken, bcryptjs (backend)
  - Vite, React, Tailwind CSS (frontend)

## Project structure

```
/ (repo root)
├── ai-service/        # optional Python AI microservice (requirements.txt, main.py)
├── backend/           # Express REST API (app.js, server.js, routes, controllers, models)
├── frontend/          # React + Vite app (src/, index.html, vite.config.js)
├── database/          # schema.sql, seed.sql
├── docs/              # documentation (placeholder)
├── fullstack_demo.mp4 # demo video
├── callback.py        # helper script
├── fix-commits.py     # helper script
├── redate.py          # helper script
└── README.md
```

How it fits together:
- The frontend is a single-page React app (development served by Vite) that calls the backend API under `/api/*`.
- The backend is an Express app that exposes auth, tasks, analytics and health endpoints. `server.js` starts the application using `app.js`.
- The optional `ai-service/` can provide AI-powered features if started separately and integrated with the backend.
- MySQL schema and seed files are provided to create the database and initial data.

## Run the system (quick start)

1) Prepare the database (MySQL):

```bash
# Apply schema and seed (adjust user/host as needed)
mysql -u root -p < database/schema.sql
mysql -u root -p smart_task_db < database/seed.sql
```

2) Start the backend:

```bash
cd backend
# copy env example if present and edit it with your DB credentials and JWT secret
cp .env.example .env || true
npm install
npm run dev   # uses nodemon; falls back to `node server.js` when running `npm start`
```

- Default backend port can be set with `PORT` environment variable (example below). The backend exposes a health endpoint at `GET /api/health` which returns a simple status JSON useful for readiness/liveness checks.

3) Start the frontend:

```bash
cd frontend
npm install
npm run dev    # starts Vite dev server (default port 5173 unless configured)
```

4) Optional: run the AI microservice (if you want AI features):

```bash
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r ai-service/requirements.txt
python ai-service/main.py
```

The backend will continue to function without the AI microservice but AI-related endpoints or integrations may be disabled.

## Environment variables (backend)

Example `.env` entries used by the backend:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=smart_task_db
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
```

## API (high level)

- POST /api/auth/register — Register user
- POST /api/auth/login — Login
- GET /api/tasks — List tasks
- POST /api/tasks — Create task (auto risk-scored)
- PUT /api/tasks/:id — Update task
- PATCH /api/tasks/:id/progress — Update progress
- DELETE /api/tasks/:id — Delete task
- GET /api/tasks/:id/risk — Get task risk score
- GET /api/analytics — Productivity analytics
- GET /api/users/me — Current user profile
- GET /api/health — Health check (returns { "status": "ok" })

Risk scoring: tasks are automatically scored for overrun risk on creation/update using rule-based checks that consider priority, deadline proximity, and user history. Risk levels are `LOW` / `MEDIUM` / `HIGH`.

## Database

- Use the SQL files in `database/` to create the schema and seed initial data.
- The schema includes users, tasks, and analytics-related tables (review `database/schema.sql` for details).

## Notes & housekeeping

- `ai-service/` is optional — inspect `ai-service/main.py` and `ai-service/requirements.txt` before enabling AI features.
- Demo video (`fullstack_demo.mp4`) and helper scripts (`callback.py`, `fix-commits.py`, `redate.py`) are provided at the repo root.
- There appears to be an unintended or oddly-named file in the repository root (filename similar to `tart = datetime(2026, 3, 1)`). Consider removing or renaming it if it was committed by accident.

## Contributing

Please open issues or PRs for improvements. Add tests for backend logic and follow standard git workflows.
