# API

Base URL (local): `http://localhost:8787`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Persistence mode and LLM flag |
| POST | `/api/preferences` | Store a preference capture |
| POST | `/api/recommend` | Rank destinations + return the structured prompt |
| POST | `/api/itinerary` | Build a timed itinerary for a destination slug |
| POST | `/api/trips` | Save a trip |
| GET | `/api/trips?sessionId=` | List trips for a browser session |
| GET | `/api/trips/:id?sessionId=` | Load one trip |
| DELETE | `/api/trips/:id?sessionId=` | Delete a trip |
| POST | `/api/export` | `{ itinerary, format: "md" \| "html" \| "json" }` |

## Preference body

```json
{
  "sessionId": "uuid",
  "origin": "Delhi",
  "startDate": "2026-11-10",
  "endDate": "2026-11-15",
  "durationDays": 5,
  "budgetLevel": "moderate",
  "pace": "balanced",
  "travelStyles": ["food", "culture"],
  "vibe": "slow mornings and one memorable dinner",
  "companions": "couple",
  "dietary": "vegetarian",
  "mobilityNotes": ""
}
```

`budgetLevel`: `budget` | `moderate` | `luxury`  
`pace`: `relaxed` | `balanced` | `packed`
