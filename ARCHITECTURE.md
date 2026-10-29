# Architecture

```
Browser (Vite React)
    │  /api/*
    ▼
Express API  ──► recommendation engine
             ──► itinerary + route optimizer
             ──► prompt builder (optional OpenAI)
             ──► export module
             ──► store (Supabase or local JSON)
```

## Frontend

Single-page planner. Preferences stay in React state; a `sessionId` in `localStorage` scopes saved trips.

## Backend

`backend/src/app.js` exposes REST routes. Engines are pure functions so they can be unit-tested without a database:

- `engine/recommend.js` — scores destinations against styles, budget, duration, vibe tokens, companions
- `engine/itinerary.js` — daily builder
- `engine/optimize.js` — area clustering, transfer estimates, pace windows
- `engine/personalize.js` — vibe tone, dietary/mobility notes
- `engine/prompts.js` — structured LLM prompts
- `engine/llm.js` — optional OpenAI JSON completion; falls back to local engines

## Data

Canonical destination catalog lives in `src/data/destinations.js` (also seed-shaped for Supabase). Trip rows are JSON itineraries plus metadata.

## Deployment split

Per the project brief:

- Frontend static site → Render (`render.yaml`)
- Backend Express → Vercel (`backend/vercel.json` + `backend/api/index.js`)
