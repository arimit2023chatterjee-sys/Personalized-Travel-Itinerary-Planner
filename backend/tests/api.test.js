import assert from "node:assert/strict";
import test from "node:test";
import app from "../src/app.js";
import { getDestination } from "../src/data/destinations.js";
import { buildItinerary } from "../src/engine/itinerary.js";
import { addMinutes, clusterByArea, estimateTravelMinutes, getPaceConfig, minutesToTime, timeToMinutes } from "../src/engine/optimize.js";
import { personalizeNotes, personalizeTitle, vibeNarrative } from "../src/engine/personalize.js";
import { buildItineraryPrompt, buildRecommendationPrompt, renderPromptText } from "../src/engine/prompts.js";
import { toMarkdown, toPrintableHtml } from "../src/export.js";

const testPrefs = {
  sessionId: "test-integration-session",
  origin: "Berlin",
  startDate: "2026-11-01",
  endDate: "2026-11-05",
  durationDays: 4,
  budgetLevel: "moderate",
  pace: "balanced",
  travelStyles: ["culture", "food"],
  vibe: "slow mornings and authentic street food",
  companions: "couple",
  dietary: "vegetarian",
  mobilityNotes: "easy walking"
};

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("GET /api/health returns 200 with service status", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.service, "personalized-travel-itinerary-planner");
  assert.ok(["local-file", "supabase"].includes(data.persistence));
});

test("POST /api/preferences validates input schema", async () => {
  const invalid = await fetch(`${baseUrl}/api/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ durationDays: 0 })
  });
  assert.equal(invalid.status, 400);
  const data = await invalid.json();
  assert.match(data.error, /durationDays/);

  const emptyStyles = await fetch(`${baseUrl}/api/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ durationDays: 3, budgetLevel: "moderate", pace: "balanced", travelStyles: [] })
  });
  assert.equal(emptyStyles.status, 400);

  const valid = await fetch(`${baseUrl}/api/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPrefs)
  });
  assert.equal(valid.status, 201);
  const validData = await valid.json();
  assert.ok(validData.preference?.id);
  assert.equal(validData.preference.origin, "Berlin");
});

test("POST /api/recommend returns ranked destinations and prompt", async () => {
  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPrefs)
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.destinations));
  assert.ok(data.destinations.length >= 1);
  assert.ok(data.destinations[0].matchScore >= 0);
  assert.ok(data.prompt.includes("User context:"));
});

test("POST /api/itinerary creates timed daily plan or returns 404 for invalid destination", async () => {
  const missing = await fetch(`${baseUrl}/api/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destinationSlug: "atlantis-invalid", preferences: testPrefs })
  });
  assert.equal(missing.status, 404);

  const valid = await fetch(`${baseUrl}/api/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destinationSlug: "kyoto", preferences: testPrefs })
  });
  assert.equal(valid.status, 200);
  const data = await valid.json();
  assert.equal(data.itinerary.days.length, 4);
  assert.ok(data.itinerary.vibeNarrative);
  assert.ok(data.itinerary.days[0].blocks.length > 0);
});

test("Full trip lifecycle: save, list, get, and delete", async () => {
  const destination = getDestination("kyoto");
  const itinerary = buildItinerary(destination, testPrefs);

  // 1. Save trip
  const saveRes = await fetch(`${baseUrl}/api/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: testPrefs.sessionId,
      destinationSlug: "kyoto",
      title: "Kyoto Autumn Getaway",
      itinerary
    })
  });
  assert.equal(saveRes.status, 201);
  const saveData = await saveRes.json();
  const tripId = saveData.trip?.id;
  assert.ok(tripId);

  // 2. List trips
  const listRes = await fetch(`${baseUrl}/api/trips?sessionId=${encodeURIComponent(testPrefs.sessionId)}`);
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  const found = listData.trips.find((t) => t.id === tripId);
  assert.ok(found);
  assert.equal(found.title, "Kyoto Autumn Getaway");

  // 3. Get specific trip
  const getRes = await fetch(`${baseUrl}/api/trips/${tripId}?sessionId=${encodeURIComponent(testPrefs.sessionId)}`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.trip?.id, tripId);

  // 4. Delete trip
  const delRes = await fetch(`${baseUrl}/api/trips/${tripId}?sessionId=${encodeURIComponent(testPrefs.sessionId)}`, {
    method: "DELETE"
  });
  assert.equal(delRes.status, 204);

  // 5. Confirm deletion
  const afterList = await fetch(`${baseUrl}/api/trips?sessionId=${encodeURIComponent(testPrefs.sessionId)}`);
  const afterData = await afterList.json();
  assert.ok(!afterData.trips.some((t) => t.id === tripId));
});

test("POST /api/export handles markdown, html, and json formats", async () => {
  const destination = getDestination("lisbon");
  const itinerary = buildItinerary(destination, testPrefs);

  const mdRes = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itinerary, format: "md" })
  });
  const mdData = await mdRes.json();
  assert.equal(mdData.mime, "text/markdown");
  assert.match(mdData.content, /# Lisbon/);

  const htmlRes = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itinerary, format: "html" })
  });
  const htmlData = await htmlRes.json();
  assert.equal(htmlData.mime, "text/html");
  assert.match(htmlData.content, /<!doctype html>/);

  const jsonRes = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itinerary, format: "json" })
  });
  const jsonData = await jsonRes.json();
  assert.equal(jsonData.mime, "application/json");
  const parsed = JSON.parse(jsonData.content);
  assert.equal(parsed.title, itinerary.title);
});

test("Engine optimizer helper functions calculate correct times and buffers", () => {
  assert.equal(minutesToTime(540), "09:00");
  assert.equal(minutesToTime(65), "01:05");
  assert.equal(timeToMinutes("09:30"), 570);
  assert.equal(addMinutes("08:15", 45), "09:00");

  const paceRelaxed = getPaceConfig("relaxed");
  assert.equal(paceRelaxed.activitiesPerDay, 3);
  const pacePacked = getPaceConfig("packed");
  assert.equal(pacePacked.activitiesPerDay, 5);

  const sameAreaTravel = estimateTravelMinutes("Gion", "Gion", "balanced");
  assert.equal(sameAreaTravel, 8);
  const crossAreaTravel = estimateTravelMinutes("Gion", "Arashiyama", "balanced");
  assert.ok(crossAreaTravel > sameAreaTravel);
});

test("Personalization engine adapts tone and injects dietary/mobility notes", () => {
  const title = personalizeTitle("Morning tea tasting", "slow and peaceful");
  assert.match(title, /Unhurried/);

  const notes = personalizeNotes(
    { type: "food" },
    { dietary: "vegan", mobilityNotes: "wheelchair access", pace: "relaxed", vibe: "peaceful" }
  );
  assert.match(notes, /vegan/);
  assert.match(notes, /wheelchair access/);
  assert.match(notes, /Leave slack/);

  const narrative = vibeNarrative(getDestination("kyoto"), testPrefs);
  assert.match(narrative, /Kyoto/);
  assert.match(narrative, /balanced/);
});

test("Prompt structuring functions format schemas properly", () => {
  const recPrompt = buildRecommendationPrompt(testPrefs);
  assert.ok(recPrompt.instructions);
  assert.equal(recPrompt.user.durationDays, 4);

  const rendered = renderPromptText(recPrompt);
  assert.ok(rendered.includes("User context:"));
  assert.ok(rendered.includes("Respond with JSON matching:"));

  const itinPrompt = buildItineraryPrompt({ preferences: testPrefs, destination: getDestination("bali") });
  assert.equal(itinPrompt.user.destination, "Ubud & Bali");
});

