const TONE_BY_VIBE = [
  { test: /slow|quiet|soft|retreat|reset/i, prefix: "Unhurried" },
  { test: /night|late|music|party/i, prefix: "After-dark" },
  { test: /food|eat|kitchen|spice/i, prefix: "Flavor-led" },
  { test: /wild|hike|peak|adrenaline/i, prefix: "High-contrast" },
  { test: /romance|honeymoon|couple/i, prefix: "Two-person" },
  { test: /family|kids|multi-gen/i, prefix: "Easy-going" }
];

export function personalizeTitle(title, vibe) {
  if (!vibe) return title;
  const match = TONE_BY_VIBE.find((item) => item.test.test(vibe));
  if (!match) return title;
  if (title.toLowerCase().startsWith(match.prefix.toLowerCase())) return title;
  return `${match.prefix} ${title.charAt(0).toLowerCase()}${title.slice(1)}`;
}

export function personalizeNotes(activity, preferences) {
  const bits = [];
  if (preferences.dietary && activity.type === "food") {
    bits.push(`Flag ${preferences.dietary} options when you sit down.`);
  }
  if (preferences.mobilityNotes) {
    bits.push(`Pace this with your note: ${preferences.mobilityNotes}.`);
  }
  if (preferences.pace === "relaxed") {
    bits.push("Leave slack in the schedule — linger if it feels right.");
  }
  if (preferences.pace === "packed") {
    bits.push("Pre-book timed entry if the venue allows it.");
  }
  if (preferences.vibe) {
    bits.push(`Keep the ${preferences.vibe.toLowerCase()} feeling in how you move through this.`);
  }
  return bits.join(" ");
}

export function vibeNarrative(destination, preferences) {
  const styles = (preferences.travelStyles || []).join(", ") || "mixed interests";
  return `${destination.name} is planned as a ${preferences.durationDays}-day ${preferences.pace} trip for ${
    preferences.companions || "you"
  }. The days lean into ${styles}${preferences.vibe ? `, shaped by “${preferences.vibe}”` : ""}. Neighborhoods are clustered so you spend more time in the place and less time in transit.`;
}
