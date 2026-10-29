const API_BASE = import.meta.env.VITE_API_URL || "";

function sessionId() {
  const key = "trip-session-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export function getSessionId() {
  return sessionId();
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  health: () => request("/api/health"),
  recommend: (preferences) => request("/api/recommend", { method: "POST", body: JSON.stringify(preferences) }),
  savePreferences: (preferences) =>
    request("/api/preferences", { method: "POST", body: JSON.stringify(preferences) }),
  itinerary: (payload) => request("/api/itinerary", { method: "POST", body: JSON.stringify(payload) }),
  saveTrip: (payload) => request("/api/trips", { method: "POST", body: JSON.stringify(payload) }),
  listTrips: (id) => request(`/api/trips?sessionId=${encodeURIComponent(id)}`),
  deleteTrip: (tripId, id) =>
    request(`/api/trips/${tripId}?sessionId=${encodeURIComponent(id)}`, { method: "DELETE" }),
  exportItinerary: (itinerary, format) =>
    request("/api/export", { method: "POST", body: JSON.stringify({ itinerary, format }) })
};
