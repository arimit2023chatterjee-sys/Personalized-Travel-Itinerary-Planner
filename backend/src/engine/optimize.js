const PACE_CONFIG = {
  relaxed: { activitiesPerDay: 3, startHour: 9, endHour: 20, bufferMin: 35 },
  balanced: { activitiesPerDay: 4, startHour: 8, endHour: 21, bufferMin: 25 },
  packed: { activitiesPerDay: 5, startHour: 8, endHour: 22, bufferMin: 15 }
};

export function getPaceConfig(pace = "balanced") {
  return PACE_CONFIG[pace] || PACE_CONFIG.balanced;
}

export function clusterByArea(activities) {
  const groups = new Map();
  for (const activity of activities) {
    const key = activity.area || "City";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(activity);
  }
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

export function estimateTravelMinutes(fromArea, toArea, pace) {
  if (!fromArea || !toArea || fromArea === toArea) return 8;
  const base = 22;
  const modifier = pace === "packed" ? 0.8 : pace === "relaxed" ? 1.2 : 1;
  return Math.round(base * modifier);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function addMinutes(time, extra) {
  return minutesToTime(timeToMinutes(time) + extra);
}
