import {
  addMinutes,
  clusterByArea,
  estimateTravelMinutes,
  getPaceConfig,
  minutesToTime
} from "./optimize.js";
import { personalizeNotes, personalizeTitle, vibeNarrative } from "./personalize.js";

const MEALS = {
  breakfast: {
    budget: "Neighborhood bakery breakfast",
    moderate: "Cafe breakfast near the day's first area",
    luxury: "Hotel or destination breakfast, unhurried"
  },
  lunch: {
    budget: "Casual local lunch",
    moderate: "Sit-down lunch in the same neighborhood",
    luxury: "Reservation lunch with a view"
  },
  dinner: {
    budget: "Market or counter dinner",
    moderate: "Neighborhood dinner",
    luxury: "Signature dinner"
  }
};

function pickActivities(destination, preferences) {
  const styles = preferences.travelStyles || [];
  const ranked = [...destination.activities].sort((a, b) => {
    const aHit = styles.includes(a.type) ? 2 : destination.tags.includes(a.type) ? 1 : 0;
    const bHit = styles.includes(b.type) ? 2 : destination.tags.includes(b.type) ? 1 : 0;
    return bHit - aHit;
  });
  return ranked;
}

function mealTitle(slot, budget) {
  return MEALS[slot][budget] || MEALS[slot].moderate;
}

function dayTheme(activities, dayIndex) {
  const top = activities[0];
  const themes = [
    `Arrive into ${top?.area || "the city"}`,
    `Deep dive: ${top?.area || "local life"}`,
    "Side-quest day",
    "Slow textures",
    "Signature landscapes",
    "Taste and nightfall",
    "Keep the best, drop the rush"
  ];
  return themes[dayIndex % themes.length];
}

export function buildItinerary(destination, preferences) {
  const pace = getPaceConfig(preferences.pace);
  const daysCount = preferences.durationDays;
  const ranked = pickActivities(destination, preferences);
  const clusters = clusterByArea(ranked);
  const used = new Set();
  const days = [];

  for (let dayIndex = 0; dayIndex < daysCount; dayIndex += 1) {
    const cluster = clusters[dayIndex % clusters.length];
    const area = cluster?.[0] || destination.areas[dayIndex % destination.areas.length];
    const unusedInArea = (cluster?.[1] || ranked).filter((item) => !used.has(item.title));
    const unusedAnywhere = ranked.filter((item) => !used.has(item.title));
    const recycle = ranked.map((item, index) => ranked[(index + dayIndex) % ranked.length]);
    const todays = [...unusedInArea, ...unusedAnywhere, ...recycle].slice(0, pace.activitiesPerDay);
    todays.forEach((item) => used.add(item.title));

    let cursor = pace.startHour * 60;
    const blocks = [];
    let lastArea = null;

    const pushBlock = (block) => {
      blocks.push(block);
      cursor = block.endMinutes;
      if (block.area) lastArea = block.area;
    };

    pushBlock({
      start: minutesToTime(cursor),
      end: minutesToTime(cursor + 50),
      endMinutes: cursor + 50,
      travelMinutes: 0,
      title: mealTitle("breakfast", preferences.budgetLevel),
      kind: "meal",
      area,
      notes: personalizeNotes({ type: "food" }, preferences)
    });

    todays.forEach((activity, index) => {
      const travel = estimateTravelMinutes(lastArea, activity.area, preferences.pace);
      if (travel >= 15) {
        pushBlock({
          start: minutesToTime(cursor),
          end: minutesToTime(cursor + travel),
          endMinutes: cursor + travel,
          travelMinutes: travel,
          title: `Move toward ${activity.area}`,
          kind: "transfer",
          area: activity.area,
          notes: `About ${travel} minutes between ${lastArea || area} and ${activity.area}.`
        });
      }

      const duration = activity.durationMin || 90;
      const start = minutesToTime(cursor);
      const endMinutes = cursor + duration;
      pushBlock({
        start,
        end: minutesToTime(endMinutes),
        endMinutes,
        travelMinutes: travel < 15 ? travel : 0,
        title: personalizeTitle(activity.title, preferences.vibe),
        kind: duration >= 240 ? "activity" : "activity",
        area: activity.area,
        notes: personalizeNotes(activity, preferences)
      });

      if (index === 0) {
        const lunchMinutes = preferences.pace === "packed" ? 45 : 70;
        pushBlock({
          start: minutesToTime(cursor),
          end: minutesToTime(cursor + lunchMinutes),
          endMinutes: cursor + lunchMinutes,
          travelMinutes: 5,
          title: mealTitle("lunch", preferences.budgetLevel),
          kind: "meal",
          area: activity.area,
          notes: personalizeNotes({ type: "food" }, preferences)
        });
      }
    });

    if (preferences.pace === "relaxed") {
      pushBlock({
        start: minutesToTime(cursor),
        end: minutesToTime(cursor + 40),
        endMinutes: cursor + 40,
        travelMinutes: 0,
        title: "Unscheduled window",
        kind: "rest",
        area: lastArea || area,
        notes: "A buffer so the day can breathe."
      });
    }

    const dinnerMinutes = preferences.budgetLevel === "luxury" ? 110 : 80;
    pushBlock({
      start: minutesToTime(Math.max(cursor, 18 * 60)),
      end: addMinutes(minutesToTime(Math.max(cursor, 18 * 60)), dinnerMinutes),
      endMinutes: Math.max(cursor, 18 * 60) + dinnerMinutes,
      travelMinutes: 12,
      title: mealTitle("dinner", preferences.budgetLevel),
      kind: "meal",
      area: lastArea || area,
      notes: personalizeNotes({ type: "food" }, preferences)
    });

    days.push({
      day: dayIndex + 1,
      theme: dayTheme(todays, dayIndex),
      summary: `A ${preferences.pace} day based around ${area}, with ${todays.length} anchors plus meals.`,
      blocks: blocks.map(({ endMinutes, ...rest }) => rest)
    });
  }

  return {
    destination: {
      slug: destination.slug,
      name: destination.name,
      country: destination.country
    },
    title: `${destination.name} · ${daysCount} days · ${preferences.pace}`,
    vibeNarrative: vibeNarrative(destination, preferences),
    days
  };
}
