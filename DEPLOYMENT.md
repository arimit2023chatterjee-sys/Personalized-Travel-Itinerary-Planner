# Deployment

## Activity 6.1 — frontend on Render

1. Push this repository to GitHub.
2. In Render, create a **Static Site** from the repo, or use `render.yaml`.
3. Root directory: `frontend`.
4. Build: `npm install && npm run build`
5. Publish directory: `dist`
6. Set `VITE_API_URL` to the Vercel API origin, for example `https://your-api.vercel.app`.

## Activity 6.2 — backend on Vercel

1. Import the same GitHub repo in Vercel.
2. Set the root directory to `backend`.
3. Framework preset: Other.
4. Environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional)
   - `OPENAI_MODEL` (optional)
5. Deploy. Confirm `GET /api/health`.

CORS is open so the Render origin can call the API. Tighten `cors()` if you need a locked production domain.

## Activity 5.3 — production checks

- Preference form rejects empty travel styles
- Recommend returns four scored destinations
- Itinerary length matches `durationDays`
- Save / list / delete round-trip
- Export downloads a file
- With Supabase keys, `/api/health` reports `supabase` and new rows appear in `trips`
