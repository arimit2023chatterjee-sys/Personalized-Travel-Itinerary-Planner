import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../data");
const dataFile = path.join(dataDir, "local-store.json");

function supabaseEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

async function readLocal() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return { preferences: [], trips: [] };
  }
}

async function writeLocal(store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

export async function savePreferences(preferences) {
  const record = {
    id: randomUUID(),
    ...preferences,
    created_at: new Date().toISOString()
  };

  if (supabaseEnabled()) {
    const { data, error } = await getSupabase()
      .from("trip_preferences")
      .insert({
        session_id: record.sessionId,
        origin: record.origin,
        start_date: record.startDate || null,
        end_date: record.endDate || null,
        duration_days: record.durationDays,
        budget_level: record.budgetLevel,
        pace: record.pace,
        travel_styles: record.travelStyles,
        vibe: record.vibe,
        companions: record.companions,
        dietary: record.dietary,
        mobility_notes: record.mobilityNotes
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ...record, id: data.id, persistence: "supabase" };
  }

  const store = await readLocal();
  store.preferences.push(record);
  await writeLocal(store);
  return { ...record, persistence: "local" };
}

export async function saveTrip(trip) {
  const record = {
    id: randomUUID(),
    ...trip,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabaseEnabled()) {
    const { data, error } = await getSupabase()
      .from("trips")
      .insert({
        session_id: record.sessionId,
        preference_id: record.preferenceId,
        destination_slug: record.destinationSlug,
        title: record.title,
        status: record.status || "saved",
        itinerary: record.itinerary
      })
      .select("id, created_at, updated_at")
      .single();
    if (error) throw error;
    return { ...record, ...data, persistence: "supabase" };
  }

  const store = await readLocal();
  store.trips.push(record);
  await writeLocal(store);
  return { ...record, persistence: "local" };
}

export async function listTrips(sessionId) {
  if (supabaseEnabled()) {
    const { data, error } = await getSupabase()
      .from("trips")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  const store = await readLocal();
  return store.trips
    .filter((trip) => trip.sessionId === sessionId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getTrip(id, sessionId) {
  if (supabaseEnabled()) {
    const { data, error } = await getSupabase()
      .from("trips")
      .select("*")
      .eq("id", id)
      .eq("session_id", sessionId)
      .single();
    if (error) throw error;
    return data;
  }
  const store = await readLocal();
  return store.trips.find((trip) => trip.id === id && trip.sessionId === sessionId) || null;
}

export async function deleteTrip(id, sessionId) {
  if (supabaseEnabled()) {
    const { error } = await getSupabase().from("trips").delete().eq("id", id).eq("session_id", sessionId);
    if (error) throw error;
    return true;
  }
  const store = await readLocal();
  store.trips = store.trips.filter((trip) => !(trip.id === id && trip.sessionId === sessionId));
  await writeLocal(store);
  return true;
}

export function persistenceMode() {
  return supabaseEnabled() ? "supabase" : "local-file";
}
