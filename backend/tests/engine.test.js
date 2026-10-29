import assert from "node:assert/strict";
import test from "node:test";
import { getDestination } from "../src/data/destinations.js";
import { buildItinerary } from "../src/engine/itinerary.js";
import { recommendDestinations, scoreDestination } from "../src/engine/recommend.js";
import { toMarkdown } from "../src/export.js";

const foodPrefs = {
  origin: "Delhi",
  durationDays: 5,
  budgetLevel: "budget",
  pace: "balanced",
  travelStyles: ["food", "culture"],
  vibe: "market mornings and late dinners",
  companions: "couple"
};

test("food-forward preferences rank Mexico City or Lisbon highly", () => {
  const ranked = recommendDestinations(foodPrefs, 12);
  assert.ok(ranked[0].matchScore >= ranked[1].matchScore);
  const slugs = ranked.slice(0, 3).map((item) => item.slug);
  assert.ok(slugs.includes("mexico-city") || slugs.includes("lisbon") || slugs.includes("chiang-mai"));
});

test("adventure preferences score Queenstown above Kyoto", () => {
  const prefs = { ...foodPrefs, travelStyles: ["adventure", "nature"], vibe: "alpine adrenaline" };
  const queenstown = scoreDestination(getDestination("queenstown"), prefs);
  const kyoto = scoreDestination(getDestination("kyoto"), prefs);
  assert.ok(queenstown > kyoto);
});

test("itinerary has one day per requested duration and clustered blocks", () => {
  const itinerary = buildItinerary(getDestination("kyoto"), { ...foodPrefs, durationDays: 4, pace: "relaxed" });
  assert.equal(itinerary.days.length, 4);
  assert.ok(itinerary.days[0].blocks.length >= 3);
  assert.ok(itinerary.days[0].blocks.some((block) => block.kind === "meal"));
});

test("markdown export includes day headings", () => {
  const itinerary = buildItinerary(getDestination("bali"), foodPrefs);
  const markdown = toMarkdown(itinerary);
  assert.match(markdown, /## Day 1/);
  assert.match(markdown, /Ubud|Bali/);
});
