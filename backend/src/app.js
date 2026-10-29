import cors from "cors";
import express from "express";
import { getDestination } from "./data/destinations.js";
import { buildItinerary } from "./engine/itinerary.js";
import { maybeGenerateWithLlm } from "./engine/llm.js";
import { buildItineraryPrompt, buildRecommendationPrompt, renderPromptText } from "./engine/prompts.js";
import { recommendDestinations } from "./engine/recommend.js";
import { toMarkdown, toPrintableHtml } from "./export.js";
import { deleteTrip, getTrip, listTrips, persistenceMode, savePreferences, saveTrip } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function validatePreferences(body) {
  const durationDays = Number(body.durationDays);
  if (!durationDays || durationDays < 1 || durationDays > 14) {
    return "durationDays must be between 1 and 14";
  }
  if (!["budget", "moderate", "luxury"].includes(body.budgetLevel)) {
    return "budgetLevel must be budget, moderate, or luxury";
  }
  if (!["relaxed", "balanced", "packed"].includes(body.pace)) {
    return "pace must be relaxed, balanced, or packed";
  }
  if (!Array.isArray(body.travelStyles) || body.travelStyles.length === 0) {
    return "choose at least one travel style";
  }
  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "personalized-travel-itinerary-planner",
    persistence: persistenceMode(),
    llm: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/preferences", async (req, res) => {
  const error = validatePreferences(req.body);
  if (error) return res.status(400).json({ error });
  const saved = await savePreferences(req.body);
  res.status(201).json({ preference: saved });
});

app.post("/api/recommend", async (req, res) => {
  const error = validatePreferences(req.body);
  if (error) return res.status(400).json({ error });

  const local = recommendDestinations(req.body);
  const prompt = renderPromptText(buildRecommendationPrompt(req.body));
  let llm = null;
  try {
    llm = await maybeGenerateWithLlm("recommend", { preferences: req.body });
  } catch (err) {
    llm = { error: err.message };
  }

  res.json({
    destinations: local,
    prompt,
    llm
  });
});

app.post("/api/itinerary", async (req, res) => {
  const { preferences, destinationSlug } = req.body;
  const error = validatePreferences(preferences || {});
  if (error) return res.status(400).json({ error });

  const destination = getDestination(destinationSlug);
  if (!destination) return res.status(404).json({ error: "unknown destination" });

  const itinerary = buildItinerary(destination, preferences);
  const prompt = renderPromptText(buildItineraryPrompt({ preferences, destination }));
  let llm = null;
  try {
    llm = await maybeGenerateWithLlm("itinerary", { preferences, destination });
  } catch (err) {
    llm = { error: err.message };
  }

  res.json({ itinerary: llm?.days ? llm : itinerary, engine: llm?.days ? "llm" : "local", prompt });
});

app.post("/api/trips", async (req, res) => {
  const { sessionId, preferenceId, destinationSlug, itinerary, title } = req.body;
  if (!sessionId || !destinationSlug || !itinerary) {
    return res.status(400).json({ error: "sessionId, destinationSlug, and itinerary are required" });
  }
  const trip = await saveTrip({
    sessionId,
    preferenceId,
    destinationSlug,
    title: title || itinerary.title,
    itinerary,
    status: "saved"
  });
  res.status(201).json({ trip });
});

app.get("/api/trips", async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
  const trips = await listTrips(String(sessionId));
  res.json({ trips });
});

app.get("/api/trips/:id", async (req, res) => {
  const trip = await getTrip(req.params.id, String(req.query.sessionId || ""));
  if (!trip) return res.status(404).json({ error: "trip not found" });
  res.json({ trip });
});

app.delete("/api/trips/:id", async (req, res) => {
  await deleteTrip(req.params.id, String(req.query.sessionId || ""));
  res.status(204).end();
});

app.post("/api/export", (req, res) => {
  const { itinerary, format } = req.body;
  if (!itinerary) return res.status(400).json({ error: "itinerary is required" });
  if (format === "html") {
    return res.json({ filename: "itinerary.html", content: toPrintableHtml(itinerary), mime: "text/html" });
  }
  if (format === "json") {
    return res.json({
      filename: "itinerary.json",
      content: JSON.stringify(itinerary, null, 2),
      mime: "application/json"
    });
  }
  res.json({ filename: "itinerary.md", content: toMarkdown(itinerary), mime: "text/markdown" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "unexpected error" });
});

export default app;
