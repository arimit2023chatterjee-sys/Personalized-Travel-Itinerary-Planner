import { DESTINATIONS } from "../data/destinations.js";

const STYLE_WEIGHT = 18;
const VIBE_WEIGHT = 14;
const BUDGET_WEIGHT = 12;
const DURATION_WEIGHT = 10;
const COMPANION_WEIGHT = 6;

function tokenize(text = "") {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

export function scoreDestination(destination, preferences) {
  const styles = preferences.travelStyles || [];
  let score = 20;

  for (const style of styles) {
    if (destination.tags.includes(style)) score += STYLE_WEIGHT;
    score += (destination.vibeScores[style] || 0) * VIBE_WEIGHT;
  }

  if (preferences.budgetLevel === destination.budget) score += BUDGET_WEIGHT;
  else if (
    (preferences.budgetLevel === "luxury" && destination.budget === "moderate") ||
    (preferences.budgetLevel === "budget" && destination.budget === "moderate")
  ) {
    score += BUDGET_WEIGHT / 2;
  }

  const days = preferences.durationDays;
  if (days >= destination.minDays && days <= destination.maxDays) score += DURATION_WEIGHT;
  else if (days === destination.minDays - 1 || days === destination.maxDays + 1) score += DURATION_WEIGHT / 2;

  const vibeTokens = tokenize(preferences.vibe);
  const destTokens = [
    ...tokenize(destination.summary),
    ...(destination.keywords || []),
    ...destination.tags
  ];
  const overlap = vibeTokens.filter((token) => destTokens.includes(token)).length;
  score += Math.min(18, overlap * 4);

  if (preferences.companions === "family" && (destination.vibeScores.family || 0) > 0.6) {
    score += COMPANION_WEIGHT;
  }
  if (preferences.companions === "couple" && (destination.vibeScores.romance || 0) > 0.7) {
    score += COMPANION_WEIGHT;
  }
  if (preferences.companions === "solo" && (destination.vibeScores.wellness || destination.vibeScores.culture)) {
    score += COMPANION_WEIGHT / 2;
  }

  return Math.round(Math.min(99, score));
}

function whyThisPlace(destination, preferences, score) {
  const styles = (preferences.travelStyles || []).filter((style) => destination.tags.includes(style));
  const styleText = styles.length ? styles.join(" + ") : destination.tags.slice(0, 2).join(" + ");
  const vibe = preferences.vibe ? ` It also tracks your “${preferences.vibe}” note.` : "";
  return `${destination.name} scores ${score} for a ${preferences.pace} ${preferences.budgetLevel} trip focused on ${styleText}.${vibe} ${destination.summary}`;
}

export function recommendDestinations(preferences, limit = 4) {
  return DESTINATIONS.map((destination) => {
    const matchScore = scoreDestination(destination, preferences);
    return {
      slug: destination.slug,
      name: destination.name,
      country: destination.country,
      region: destination.region,
      summary: destination.summary,
      tags: destination.tags,
      budget: destination.budget,
      matchScore,
      why: whyThisPlace(destination, preferences, matchScore)
    };
  })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
