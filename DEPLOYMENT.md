# Deployment Guide

## Activity 6.1 — Frontend on Render

You can deploy the frontend to Render using either **Option A (Render Blueprint)** or **Option B (Manual Static Site)**:

### Option A: Via Render Blueprint (Recommended)
1. Push this repository to GitHub.
2. In Render, select **New +** → **Blueprint**.
3. Select your repository `Personalized-Travel-Itinerary-Planner`. Render will detect `render.yaml` automatically and configure the static site.
4. Set the `VITE_API_URL` environment variable to your backend URL (e.g. `https://your-api.vercel.app`).
5. Click **Apply**.

### Option B: Via Manual Static Site
1. In Render, select **New +** → **Static Site**.
2. Connect your GitHub repository `Personalized-Travel-Itinerary-Planner`.
3. Configure the settings:
   - **Name**: `travel-itinerary-frontend`
   - **Root Directory**: leave blank (or set to `frontend`)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. In the **Environment Variables** section, add:
   - `VITE_API_URL`: Your deployed Vercel backend URL (e.g. `https://your-api.vercel.app`)
5. Click **Create Static Site**.

---

## Activity 6.2 — Backend on Vercel

1. In the Vercel dashboard, click **Add New...** → **Project**.
2. Import the GitHub repository `Personalized-Travel-Itinerary-Planner`.
3. In **Root Directory**, click **Edit** and select `backend`.
4. Framework Preset: **Other**.
5. Add the following **Environment Variables**:
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
   - `OPENAI_API_KEY`: (optional, for LLM-enhanced rewriting)
   - `OPENAI_MODEL`: `gpt-4o-mini` (optional)
6. Click **Deploy**.
7. Once deployed, verify by opening `https://your-backend.vercel.app/api/health`.

---

## Activity 5.3 — Production Verification

- **Form validation**: Rejects submission if no travel style is selected or if duration is out of range.
- **Recommendations**: `POST /api/recommend` returns 4 scored destinations matching budget and vibe.
- **Itinerary generation**: Daily itinerary matches requested duration and includes meal, activity, and transit blocks.
- **Trip management**: Save, list, view, and delete trips persist reliably.
- **Exporting**: One-click download of Markdown (`.md`), printable HTML (`.html`), and raw JSON (`.json`).
- **Database synchronization**: When Supabase credentials are configured, `/api/health` reports `"persistence": "supabase"` and records appear in `trip_preferences` and `trips`.
