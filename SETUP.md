# Setup

## Activity 1.1 — tools

- Cursor IDE
- Node.js 20+
- Git (already initialized in this folder)

## Activity 1.2 — AI coding tools

This repo is meant to be edited in Cursor. Optional: set `OPENAI_API_KEY` in `backend/.env` if you want the planner to rewrite recommendations through ChatGPT-compatible prompts.

## Activity 1.3 — folder structure

```
backend/
  api/index.js          Vercel entry
  database/schema.sql   Supabase tables
  src/                  Express app + engines
  tests/
frontend/               Vite + React UI
API.md
ARCHITECTURE.md
DEPLOYMENT.md
PROJECT_COMPLETION.md
README.md
render.yaml
SETUP.md
```

## Install

From the repo root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run dev
```

On macOS/Linux use `cp` instead of `copy`.

## Milestone 2 — Supabase

1. Create a Supabase project.
2. Run `backend/database/schema.sql` in the SQL editor.
3. Put the project URL and **service role** key in `backend/.env`.
4. Restart the API. `/api/health` should report `"persistence": "supabase"`.

Until those keys exist, trips are stored in `backend/data/local-store.json`.

Never commit `.env` files.
