# Personalized Travel Itinerary Planner

A vibe-based travel itinerary planning application that captures traveler preferences, scores and recommends curated global destinations, builds optimized day-by-day itineraries clustered by neighborhood with realistic transit buffers, and offers complete trip management and multi-format exports (Markdown, printable HTML, and JSON).

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
  - [Using Cursor / VS Code Tasks](#using-cursor--vs-code-tasks)
  - [Using Terminal / NPM](#using-terminal--npm)
- [Architecture](#architecture)
- [Project Milestones & Implementation Status](#project-milestones--implementation-status)
  - [Milestone 1: Vibe Coding Environment Setup](#milestone-1-vibe-coding-environment-setup)
  - [Milestone 2: Supabase Database Setup](#milestone-2-supabase-database-setup)
  - [Milestone 3: Preference Collection & Recommendation Engine](#milestone-3-preference-collection--recommendation-engine)
  - [Milestone 4: Itinerary Generation & Personalization](#milestone-4-itinerary-generation--personalization)
  - [Milestone 5: Productization & Deployment](#milestone-5-productization--deployment)
  - [Milestone 6: Deployment](#milestone-6-deployment)
  - [Milestone 7: Final Testing & Documentation](#milestone-7-final-testing--documentation)
- [API Reference](#api-reference)
- [Database Schema & Seeds](#database-schema--seeds)
- [Deployment Guide](#deployment-guide)

---

## Features

- **Vibe & Preference Capture**: Origin, dates, duration (1–14 days), budget levels (`budget`, `moderate`, `luxury`), paces (`relaxed`, `balanced`, `packed`), travel styles (culture, food, nature, adventure, wellness, nightlife, romance, family), custom vibe narrative, dietary restrictions, and mobility/energy considerations.
- **Scored Destination Recommendation Engine**: Multi-dimensional scoring evaluating travel styles, budget compatibility, duration fit, tokenized vibe overlap, and companion match across 12 curated destinations.
- **Daily Itinerary Builder**: Generates day-by-day schedules with breakfast, lunch, and dinner slots, neighborhood-clustered activities, realistic transfer buffers, and unscheduled relaxation windows.
- **Vibe-Based Personalization**: Dynamic tone adjustment (unhurried, flavor-led, high-contrast, after-dark), dietary cautions at meal stops, pace guidance, and mobility reminders.
- **Persistence & Trip Management**: Dual-mode storage supporting Cloud **Supabase PostgreSQL** with Row Level Security (RLS) or zero-dependency **local JSON fallback** (`backend/data/local-store.json`).
- **Multi-Format Export**: One-click exports to structured **Markdown** (`.md`), **printable HTML** (`.html`), and raw **JSON** (`.json`).
- **AI Integration**: Structured prompt formatting matching ChatGPT/OpenAI JSON schema with graceful local engine fallback.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- npm v10+

### Using Cursor / VS Code Tasks
Preconfigured tasks are available under `.vscode/tasks.json`. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and choose **Tasks: Run Task**:

```
>_ Start Express API on port 8787
>_ Start Vite frontend on port 5173
>_ Start All (Backend + Frontend)
```

### Using Terminal / NPM

1. **Install dependencies:**
   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Configure environment:**
   ```bash
   # Windows PowerShell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env

   # macOS / Linux
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start development servers:**
   ```bash
   # Run both servers concurrently
   npm run dev

   # Or run individually in separate terminals:
   npm run dev:backend   # Express API on http://localhost:8787
   npm run dev:frontend  # Vite React on http://localhost:5173
   ```

4. **Verify running services:**
   - Frontend UI: [http://localhost:5173](http://localhost:5173)
   - API Health: [http://localhost:8787/api/health](http://localhost:8787/api/health)

---

## Architecture

```
Browser Client (React 19 + Vite @ port 5173)
       │
       │ HTTP /api/*
       ▼
Express API Backend (Node.js 20+ @ port 8787)
  ├── POST /api/preferences   ──► Validates and persists trip brief
  ├── POST /api/recommend     ──► Multi-factor scoring engine + LLM prompt builder
  ├── POST /api/itinerary     ──► Day-by-day scheduler + Area clustering + Transit optimizer
  ├── POST /api/trips         ──► Save trip record
  ├── GET  /api/trips         ──► List saved trips for current session
  ├── POST /api/export        ──► Markdown / HTML / JSON generator
  └── Store Layer
        ├── Supabase Client (when SUPABASE_URL is configured)
        └── Local File Store (backend/data/local-store.json fallback)
```

---

## Project Milestones & Implementation Status

### Milestone 1: Vibe Coding Environment Setup
- **Activity 1.1**: Cursor IDE configuration, Node.js runtime, and GitHub repository initialization.
- **Activity 1.2**: AI coding integration with `.cursor/` and `.vscode/tasks.json` automated task runners, OpenAI-compatible prompt schemas in `backend/src/engine/prompts.js`.
- **Activity 1.3**: Clean modular project structure separating frontend, backend, database migrations, tests, and deployment manifests.

### Milestone 2: Supabase Database Setup
- **Activity 2.1**: Supabase project integration with client factory in `backend/src/store.js`.
- **Activity 2.2**: PostgreSQL schema in `backend/database/schema.sql` defining:
  - `profiles`: User profile tracking
  - `trip_preferences`: Traveler preference captures
  - `destinations`: Curated destination catalog
  - `trips`: Saved itineraries with JSONB storage and timestamps
  - Row Level Security (RLS) policies for user and session isolation
  - `backend/database/seeds.sql` containing seed data for 12 destinations.
- **Activity 2.3**: Secure credential management via `backend/.env` with `.env.example` templates and `.gitignore` rules preventing secret leaks.

### Milestone 3: Preference Collection & Recommendation Engine
- **Activity 3.1**: Interactive preference form in `frontend/src/App.jsx` capturing origin, companions, dates, duration, budget, pace, styles, vibe notes, dietary needs, and mobility restrictions.
- **Activity 3.2**: Prompt structuring logic in `backend/src/engine/prompts.js` rendering JSON schema instructions for LLM completion.
- **Activity 3.3**: Destination recommendation engine in `backend/src/engine/recommend.js` scoring travel style affinity, budget matching, duration fit, vibe token overlap, and companion suitability.

### Milestone 4: Itinerary Generation & Personalization
- **Activity 4.1**: Daily itinerary builder in `backend/src/engine/itinerary.js` constructing structured schedules across the trip duration.
- **Activity 4.2**: Route & time optimization in `backend/src/engine/optimize.js` grouping activities by neighborhood area to eliminate unnecessary cross-town transit and calculating realistic travel buffers.
- **Activity 4.3**: Vibe-based personalization in `backend/src/engine/personalize.js` tailoring activity titles, pacing notes, dietary reminders, and overall vibe narrative.

### Milestone 5: Productization & Deployment
- **Activity 5.1**: Trip save and management (`POST /api/trips`, `GET /api/trips`, `DELETE /api/trips`) with browser session persistence.
- **Activity 5.2**: Export module in `backend/src/export.js` supporting Markdown (`.md`), printable HTML (`.html`), and raw JSON (`.json`) downloads.
- **Activity 5.3**: Unit and integration test suite (`backend/tests/`) verifying engine scoring, clustering, export generation, and all API endpoints.

### Milestone 6: Deployment
- **Activity 6.1**: Frontend static deployment configuration on **Render** via `render.yaml`.
- **Activity 6.2**: Backend serverless API deployment configuration on **Vercel** via `backend/vercel.json` and `backend/api/index.js`.

### Milestone 7: Final Testing & Documentation
- **Activity 7.1**: Automated test suite with 13 comprehensive test cases passing (`npm test`).
- **Activity 7.2**: Validation workflows for database updates and local persistence fallback. Complete documentation across `README.md`, `SETUP.md`, `ARCHITECTURE.md`, `API.md`, and `DEPLOYMENT.md`.

---

## API Reference

Base URL: `http://localhost:8787`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns service health, active persistence mode, and LLM flag |
| `POST` | `/api/preferences` | Stores traveler preference brief |
| `POST` | `/api/recommend` | Calculates destination match scores and generates AI prompt |
| `POST` | `/api/itinerary` | Builds neighborhood-clustered daily itinerary |
| `POST` | `/api/trips` | Saves an itinerary with session identifier |
| `GET` | `/api/trips?sessionId=<id>` | Lists all trips saved in the specified session |
| `GET` | `/api/trips/:id?sessionId=<id>` | Retrieves a specific trip record |
| `DELETE` | `/api/trips/:id?sessionId=<id>` | Deletes a trip record |
| `POST` | `/api/export` | Generates formatted file content (`md`, `html`, or `json`) |

---

## Database Schema & Seeds

To connect a Supabase project:
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Run the schema script: [backend/database/schema.sql](backend/database/schema.sql).
4. Run the seed script: [backend/database/seeds.sql](backend/database/seeds.sql).
5. Add your credentials to `backend/.env`:
   ```ini
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
6. Restart the backend. `/api/health` will report `"persistence": "supabase"`.

---

## Testing

Run the automated test suite:

```bash
npm test
```

Test coverage includes:
- Destination scoring and ranking
- Area clustering and transit buffer calculations
- Daily itinerary generation matching requested duration
- Tone and vibe personalization
- Multi-format file exports (Markdown, HTML, JSON)
- REST API validation, lifecycle (save/list/get/delete), and error handling

---

## Deployment Guide

### Frontend on Render
You can deploy the frontend to Render in two ways:
- **Blueprint (Recommended)**: Choose **New +** → **Blueprint**, select this repository, and Render will automatically detect `render.yaml`. Set `VITE_API_URL` to your Vercel backend URL.
- **Manual Static Site**: Choose **New +** → **Static Site**, connect this repository, leave Root Directory blank (or `frontend`), set Build Command to `npm run build`, and Publish Directory to `dist`. Add the environment variable `VITE_API_URL` pointing to your Vercel backend.

### Backend on Vercel
1. Import this repository in Vercel.
2. Set **Root Directory** to `backend`.
3. Framework Preset: **Other**.
4. Configure Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` (optional).
5. Deploy and verify via `GET /api/health`.
