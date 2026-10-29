# Deployment Guide

## Overview

| Platform | What it hosts | Directory |
|---|---|---|
| **Render** | React / Vite frontend (Static Site) | `frontend/` |
| **Vercel** | Express API backend (Serverless) | `backend/` |

---

## Frontend → Render (Static Site)

Render is pointed directly at the `frontend/` folder. It installs dependencies and runs `vite build` there. No root-level build script is needed.

### Settings in Render Dashboard

| Field | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Environment Variables
| Key | Value |
|---|---|
| `VITE_API_URL` | Your Vercel backend URL e.g. `https://your-api.vercel.app` |

### Via render.yaml (Blueprint)
The `render.yaml` in the repo root is already configured. In Render choose **New → Blueprint** and it will auto-configure.

### Rewrite Rule (SPA)
The `render.yaml` includes a rewrite rule (`/* → /index.html`) so page refreshes work correctly for the React single-page app. You can also add this manually in the Render dashboard under **Redirects/Rewrites**.

---

## Backend → Vercel (Serverless)

Vercel is pointed at the `backend/` folder. The `backend/api/index.js` exports the Express app as the serverless handler. `backend/vercel.json` routes all requests through it.

### Settings in Vercel Dashboard

| Field | Value |
|---|---|
| **Root Directory** | `backend` |
| **Framework Preset** | Other |
| **Build Command** | *(leave blank)* |
| **Output Directory** | *(leave blank)* |

### Environment Variables
| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `OPENAI_API_KEY` | *(optional)* Your OpenAI key |
| `OPENAI_MODEL` | *(optional)* e.g. `gpt-4o-mini` |

### Verify deployment
Open `https://your-api.vercel.app/api/health`. You should see:
```json
{ "ok": true, "service": "personalized-travel-itinerary-planner", "persistence": "local-file", "llm": false }
```
With Supabase configured, `persistence` will show `"supabase"`.

---

## Connecting Frontend to Backend

After deploying both:
1. Copy your Vercel backend URL (e.g. `https://your-api.vercel.app`).
2. In the Render dashboard, go to **Environment** and set `VITE_API_URL` to that URL.
3. Trigger a new Render deploy (or it redeploys automatically on env change).

---

## Local Development

Both services run locally with one command from the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8787/api/health

The Vite dev server proxies `/api/*` to `http://localhost:8787` automatically (`frontend/vite.config.js`), so `VITE_API_URL` is not needed locally.

---

## Production Checks

- `GET /api/health` returns `ok: true`
- Preference form rejects empty travel styles and invalid durations
- Recommend returns 4 scored destinations  
- Itinerary length matches `durationDays`
- Save / list / delete trips work end-to-end
- Export downloads a `.md`, `.html`, or `.json` file
- With Supabase keys, new rows appear in `trip_preferences` and `trips`
