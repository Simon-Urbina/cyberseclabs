# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Cybersecurity learning platform (in Spanish) where users enroll in courses, work through lab modules, complete hands-on activities, and take quizzes. Users earn points for completing labs.

## Repository structure

```
frontend/   React 19 + TypeScript + Vite
backend/    Hono + Bun + PostgreSQL (Supabase)
```

Each folder has its own `package.json`, `node_modules`, and `.env`.

## Commands

### Frontend (`cd frontend`)
```bash
bun install          # install dependencies
bun dev              # dev server at localhost:5173
bun run build        # tsc -b + vite build
bun run lint         # ESLint
```

### Backend (`cd backend`)
```bash
bun install          # install dependencies
bun dev              # watch mode (hot reload)
bun start            # production start
```

## Architecture

**Runtime**: Bun throughout. The devcontainer (`ghcr.io/nhaef/devcontainer-bun`) provides the environment.

**Frontend** (`frontend/src/`): React 19 + TypeScript + Vite. `VITE_API_URL` in `.env` points to the backend.

**Backend** (`backend/src/`): Hono web framework. Intended layering: `Routes → Controllers → Services → DAO → Database`. Scaffolded folders:
- `src/routes/` — Hono route definitions
- `src/controllers/` — request/response handling
- `src/daos/` — database access (raw SQL with `postgres` driver)
- `src/models/` — plain JS domain classes (see below)

**Database**: PostgreSQL on Supabase. Schema in `backend/database/schema.sql` — idempotent, safe to re-run.

**Domain models** (`backend/src/models/`): Plain ES module classes (no ORM). Each mirrors a DB table and exposes:
- `static validate(...)` — returns an array of Spanish error strings
- Projection methods: `toPublic()`, `toSummary()`, `toAdmin()`, `toProfile()`, `toSession()`, `toRankingRow()` — use the least-privileged projection for each response

## Database schema key points

Hierarchy: `courses → course_modules → laboratories → laboratory_questions → laboratory_question_options / question_activities`

- Every lab requires exactly **5** quiz questions (`quiz_questions_required = 5`). Submissions must contain exactly 5 answers.
- Question types: `multiple_choice` (options in `laboratory_question_options`) and `activity_response` (linked 1:1 to a `question_activities` row).
- `activity_response` grading: compare user answer against `user_activity_progress.generated_response`.
- `score_percent` and `correct_answers_count` are computed in Services before inserting a `submissions` row.
- Three DB triggers handle denormalized state automatically:
  - `activity_action_logs` insert → upserts `user_activity_progress`
  - `submissions` insert → upserts `user_laboratory_progress`
  - `user_laboratory_progress` status → `completed` (first time) → adds `laboratories.points` to `users.points`
- Difficulty enum values are in Spanish: `principiante`, `intermedio`, `avanzado`.
- Soft-delete on `users` via `deleted_at`; hard cascade on most other tables.

## Deployment

- **Backend**: Railway — config in `backend/railway.json`. Set `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL` as Railway env vars.
- **Database**: Supabase PostgreSQL — run `backend/database/schema.sql` in the Supabase SQL Editor.
- **Frontend**: any static host (Vercel, Netlify, etc.) pointing at the `frontend/` folder; set `VITE_API_URL` to the Railway backend URL at build time.
