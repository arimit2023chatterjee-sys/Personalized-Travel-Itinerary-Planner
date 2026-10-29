import { useEffect, useMemo, useState } from "react";
import { api, getSessionId } from "./api.js";

const STYLES = ["culture", "food", "nature", "adventure", "wellness", "nightlife", "romance", "family"];

const EMPTY = {
  origin: "",
  startDate: "",
  endDate: "",
  durationDays: 5,
  budgetLevel: "moderate",
  pace: "balanced",
  travelStyles: ["food", "culture"],
  vibe: "Slow mornings, neighborhood walks, and one memorable dinner",
  companions: "couple",
  dietary: "",
  mobilityNotes: ""
};

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [view, setView] = useState("plan");
  const [form, setForm] = useState(EMPTY);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [preferenceId, setPreferenceId] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [trips, setTrips] = useState([]);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleStyle(style) {
    setForm((current) => {
      const has = current.travelStyles.includes(style);
      const travelStyles = has
        ? current.travelStyles.filter((item) => item !== style)
        : [...current.travelStyles, style];
      return { ...current, travelStyles };
    });
  }

  async function onRecommend(event) {
    event.preventDefault();
    setError("");
    setLoading("Finding destinations that match your vibe…");
    try {
      const payload = { ...form, sessionId, durationDays: Number(form.durationDays) };
      const saved = await api.savePreferences(payload);
      setPreferenceId(saved.preference.id);
      const result = await api.recommend(payload);
      setDestinations(result.destinations);
      setItinerary(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  async function onGenerate(slug) {
    setError("");
    setLoading(`Building a ${form.durationDays}-day plan for ${slug}…`);
    try {
      const result = await api.itinerary({
        destinationSlug: slug,
        preferences: { ...form, sessionId, durationDays: Number(form.durationDays) }
      });
      setItinerary({ ...result.itinerary, destinationSlug: slug });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  async function onSaveTrip() {
    if (!itinerary) return;
    setLoading("Saving trip…");
    try {
      await api.saveTrip({
        sessionId,
        preferenceId,
        destinationSlug: itinerary.destination?.slug || itinerary.destinationSlug,
        title: itinerary.title,
        itinerary
      });
      const listed = await api.listTrips(sessionId);
      setTrips(listed.trips);
      setView("saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  async function loadTrips() {
    setView("saved");
    const listed = await api.listTrips(sessionId);
    setTrips(listed.trips);
  }

  async function onExport(format) {
    if (!itinerary) return;
    const result = await api.exportItinerary(itinerary, format);
    downloadFile(result.filename, result.content, result.mime);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="mark">AR</div>
          <div>
            <strong>Vibe Itinerary</strong>
            <small>Personalized travel planner</small>
          </div>
        </div>
        <nav className="nav">
          <button className={view === "plan" ? "active" : ""} onClick={() => setView("plan")}>
            Plan
          </button>
          <button className={view === "saved" ? "active" : ""} onClick={loadTrips}>
            Saved trips
          </button>
        </nav>
      </header>

      {view === "plan" && (
        <>
          <section className="hero">
            <div>
              <span className="pill">Milestone-ready planner</span>
              <h1>Build a trip that sounds like you.</h1>
              <p className="lede">
                Capture preferences, rank destinations, then generate a day-by-day route with meals,
                transfers, and vibe-based pacing.
              </p>
              <div className="pill-row">
                <span className="pill">Recommendation engine</span>
                <span className="pill">Route & time optimization</span>
                <span className="pill">Export markdown / HTML / JSON</span>
              </div>
            </div>
            <form className="panel" onSubmit={onRecommend}>
              <h2>Your trip brief</h2>
              <div className="grid-2">
                <label>
                  Origin
                  <input value={form.origin} onChange={(e) => update("origin", e.target.value)} placeholder="Mumbai, London…" />
                </label>
                <label>
                  Companions
                  <select value={form.companions} onChange={(e) => update("companions", e.target.value)}>
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="friends">Friends</option>
                    <option value="family">Family</option>
                  </select>
                </label>
                <label>
                  Start date
                  <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
                </label>
                <label>
                  End date
                  <input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
                </label>
                <label>
                  Duration (days)
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={form.durationDays}
                    onChange={(e) => update("durationDays", e.target.value)}
                  />
                </label>
                <label>
                  Budget
                  <select value={form.budgetLevel} onChange={(e) => update("budgetLevel", e.target.value)}>
                    <option value="budget">Budget</option>
                    <option value="moderate">Moderate</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </label>
                <label>
                  Pace
                  <select value={form.pace} onChange={(e) => update("pace", e.target.value)}>
                    <option value="relaxed">Relaxed</option>
                    <option value="balanced">Balanced</option>
                    <option value="packed">Packed</option>
                  </select>
                </label>
                <label>
                  Dietary
                  <input value={form.dietary} onChange={(e) => update("dietary", e.target.value)} placeholder="Vegetarian, halal…" />
                </label>
              </div>
              <label style={{ marginTop: 12 }}>
                Travel styles
                <div className="styles">
                  {STYLES.map((style) => (
                    <button
                      type="button"
                      key={style}
                      className={form.travelStyles.includes(style) ? "chip active" : "chip"}
                      onClick={() => toggleStyle(style)}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </label>
              <label style={{ marginTop: 12 }}>
                Vibe in your own words
                <textarea value={form.vibe} onChange={(e) => update("vibe", e.target.value)} />
              </label>
              <label style={{ marginTop: 12 }}>
                Mobility or energy notes
                <input
                  value={form.mobilityNotes}
                  onChange={(e) => update("mobilityNotes", e.target.value)}
                  placeholder="Prefer fewer stairs, need nap windows…"
                />
              </label>
              <div className="form-actions">
                <button className="primary" type="submit" disabled={Boolean(loading)}>
                  Recommend destinations
                </button>
              </div>
            </form>
          </section>

          <p className="status">
            {health?.ok
              ? `API online · persistence ${health.persistence} · LLM ${health.llm ? "enabled" : "local engine"}`
              : "Start the backend on port 8787 if recommendations fail."}
            {loading ? ` · ${loading}` : ""}
          </p>
          {error && <p className="error">{error}</p>}

          {destinations.length > 0 && (
            <section>
              <h2 className="serif">Destination matches</h2>
              <div className="cards">
                {destinations.map((destination) => (
                  <article key={destination.slug} className="card">
                    <header>
                      <div>
                        <h3 style={{ margin: 0 }}>
                          {destination.name}
                          <small style={{ display: "block", color: "var(--muted)", fontFamily: "Outfit, sans-serif", fontWeight: 400 }}>
                            {destination.country}
                          </small>
                        </h3>
                      </div>
                      <span className="score">{destination.matchScore}</span>
                    </header>
                    <div className="tags">
                      {destination.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p>{destination.why}</p>
                    <button className="primary" type="button" onClick={() => onGenerate(destination.slug)}>
                      Build itinerary
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {itinerary && (
            <section style={{ marginTop: 28 }}>
              <div className="itinerary-head">
                <div>
                  <h2 className="serif" style={{ margin: 0 }}>
                    {itinerary.title}
                  </h2>
                  <p className="lede">{itinerary.vibeNarrative}</p>
                </div>
                <div className="nav">
                  <button className="ghost" onClick={() => onExport("md")}>
                    Export markdown
                  </button>
                  <button className="ghost" onClick={() => onExport("html")}>
                    Export HTML
                  </button>
                  <button className="ghost" onClick={() => onExport("json")}>
                    Export JSON
                  </button>
                  <button className="primary" onClick={onSaveTrip}>
                    Save trip
                  </button>
                </div>
              </div>
              {itinerary.days?.map((day) => (
                <article className="day" key={day.day}>
                  <h3 style={{ margin: "0 0 6px" }}>
                    Day {day.day}: {day.theme}
                  </h3>
                  <p style={{ margin: 0, color: "var(--muted)" }}>{day.summary}</p>
                  {day.blocks.map((block, index) => (
                    <div className="block" key={`${day.day}-${index}`}>
                      <time>
                        {block.start}–{block.end}
                        {block.travelMinutes ? <div>{block.travelMinutes} min transfer</div> : null}
                      </time>
                      <div>
                        <div className="kind">{block.kind}</div>
                        <strong>{block.title}</strong>
                        {block.area ? <div style={{ color: "var(--muted)" }}>{block.area}</div> : null}
                        {block.notes ? <div style={{ color: "var(--muted)", fontSize: 14 }}>{block.notes}</div> : null}
                      </div>
                    </div>
                  ))}
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {view === "saved" && (
        <section>
          <h2 className="serif">Saved trips</h2>
          <div className="saved-list">
            {trips.length === 0 && <p className="status">No trips saved in this browser session yet.</p>}
            {trips.map((trip) => (
              <article className="saved-item" key={trip.id}>
                <div>
                  <strong>{trip.title}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>
                    {trip.destinationSlug || trip.destination_slug} · {trip.created_at}
                  </div>
                </div>
                <div className="nav">
                  <button
                    className="primary"
                    onClick={() => {
                      setItinerary(trip.itinerary);
                      setView("plan");
                    }}
                  >
                    Open
                  </button>
                  <button
                    className="ghost"
                    onClick={async () => {
                      await api.deleteTrip(trip.id, sessionId);
                      const listed = await api.listTrips(sessionId);
                      setTrips(listed.trips);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
