export function buildRecommendationPrompt(preferences) {
  return {
    role: "system",
    instructions:
      "You are a destination recommender for a personalized travel itinerary planner. Return JSON only.",
    user: {
      origin: preferences.origin,
      durationDays: preferences.durationDays,
      budgetLevel: preferences.budgetLevel,
      pace: preferences.pace,
      travelStyles: preferences.travelStyles,
      vibe: preferences.vibe,
      companions: preferences.companions
    },
    schema: {
      destinations: [
        {
          slug: "string",
          matchScore: "number 0-100",
          why: "one paragraph tied to the vibe"
        }
      ]
    }
  };
}

export function buildItineraryPrompt({ preferences, destination }) {
  return {
    role: "system",
    instructions:
      "Build a realistic day-by-day itinerary. Cluster activities by neighborhood, include meals, transfers, and downtime matching pace. Return JSON only.",
    user: {
      destination: destination.name,
      country: destination.country,
      durationDays: preferences.durationDays,
      budgetLevel: preferences.budgetLevel,
      pace: preferences.pace,
      travelStyles: preferences.travelStyles,
      vibe: preferences.vibe,
      companions: preferences.companions,
      dietary: preferences.dietary,
      mobilityNotes: preferences.mobilityNotes
    },
    schema: {
      title: "string",
      vibeNarrative: "string",
      days: [
        {
          day: 1,
          theme: "string",
          summary: "string",
          blocks: [
            {
              start: "HH:MM",
              end: "HH:MM",
              travelMinutes: 0,
              title: "string",
              kind: "activity|meal|transfer|rest",
              area: "string",
              notes: "string"
            }
          ]
        }
      ]
    }
  };
}

export function renderPromptText(prompt) {
  return [
    prompt.instructions,
    "",
    "User context:",
    JSON.stringify(prompt.user, null, 2),
    "",
    "Respond with JSON matching:",
    JSON.stringify(prompt.schema, null, 2)
  ].join("\n");
}
