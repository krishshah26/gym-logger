import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "gym-logger-v1";
const SCHEDULE_KEY = "gym-schedule-v1";
const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const defaultTemplates = [
  { id: "t1", name: "Back + Biceps", exercises: ["Lat Pulldown", "Seated Row", "Single Arm Row", "Barbell Curl", "Hammer Curl"] },
  { id: "t2", name: "Chest + Triceps", exercises: ["Bench Press", "Incline Dumbbell Press", "Cable Fly", "Triceps Pushdown", "Overhead Extension"] },
  { id: "t3", name: "Legs", exercises: ["Squat", "Leg Press", "Leg Curl", "Leg Extension", "Calf Raise"] },
  { id: "t4", name: "Shoulders + Abs", exercises: ["Shoulder Press", "Lateral Raise", "Rear Delt Fly", "Cable Crunch", "Leg Raise"] },
  { id: "t5", name: "Arms + Abs", exercises: ["EZ Bar Curl", "Incline Curl", "Skull Crusher", "Rope Pushdown", "Cable Crunch"] },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const todayKey = () => new Date().toISOString().slice(0, 10);
const emptySet = () => ({ weight: "", reps: "" });

function safeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function getDefaultState() {
  return { templates: defaultTemplates, workouts: [], activeWorkout: null };
}
function fmtDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Mon = 0
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function createWorkoutFromTemplate(template) {
  return {
    id: safeId(), date: todayKey(), templateName: template.name, notes: "",
    exercises: template.exercises.map((name) => ({ id: safeId(), name, sets: [emptySet(), emptySet(), emptySet()] })),
  };
}
function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return {
      templates: Array.isArray(parsed.templates) && parsed.templates.length ? parsed.templates : defaultTemplates,
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      activeWorkout: parsed.activeWorkout ?? null,
    };
  } catch { return getDefaultState(); }
}
function saveLocalState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadSchedule() {
  try { const raw = localStorage.getItem(SCHEDULE_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function mapTemplatesFromRows(rows) {
  return rows.map((row) => ({ id: row.id, name: row.name, exercises: Array.isArray(row.exercises) ? row.exercises : [] }));
}
function mapWorkoutsFromRows(rows) {
  return rows.map((row) => ({
    id: row.id, date: row.date, templateName: row.template_name, notes: row.notes || "",
    exercises: (Array.isArray(row.exercises) ? row.exercises : []).map((ex) => ({
      id: ex.id || safeId(), name: ex.name,
      sets: Array.isArray(ex.sets) && ex.sets.length ? ex.sets : [emptySet(), emptySet(), emptySet()],
    })),
  }));
}
function getLastExerciseStats(workouts, exerciseName) {
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const workout of sorted) {
    const ex = workout.exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (ex) {
      const sets = ex.sets.filter((s) => s.weight || s.reps);
      if (sets.length) return { date: workout.date, sets };
    }
  }
  return null;
}

const Icons = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  calendar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  history: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  templates: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  account: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevLeft: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

export default function App() {
  const [state, setState] = useState(getDefaultState());
  const [schedule, setSchedule] = useState({});
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState("");
  const [screen, setScreen] = useState("home");
  // Calendar state
  const [calView, setCalView] = useState(() => {
    const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() };
  });
  const [selectedCalDay, setSelectedCalDay] = useState(null);
  // Template editing state
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editExercises, setEditExercises] = useState("");
  // Workout detail (from calendar)
  const [detailWorkoutId, setDetailWorkoutId] = useState(null);

  // Load schedule from localStorage
  useEffect(() => { setSchedule(loadSchedule()); }, []);
  useEffect(() => { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule)); }, [schedule]);

  useEffect(() => {
    const local = loadLocalState();
    setState(local);
    if (!supabase) {
      setMessage("Offline mode — workouts save locally on this device.");
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) { setMessage(error.message); setLoading(false); return; }
      setSession(data.session ?? null);
      if (data.session) { await hydrateFromCloud(); } else { setLoading(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      if (nextSession) { await hydrateFromCloud(); } else { setState(loadLocalState()); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => { saveLocalState(state); }, [state]);

  async function hydrateFromCloud() {
    if (!supabase) return;
    setLoading(true);
    const [{ data: templateRows, error: te }, { data: workoutRows, error: we }] = await Promise.all([
      supabase.from("workout_templates").select("id, name, exercises").order("created_at", { ascending: true }),
      supabase.from("workout_sessions").select("id, date, template_name, notes, exercises").order("date", { ascending: false }),
    ]);
    if (te || we) { setMessage(te?.message || we?.message || "Could not load cloud data."); setLoading(false); return; }
    setState({
      templates: templateRows?.length ? mapTemplatesFromRows(templateRows) : defaultTemplates,
      workouts: workoutRows?.length ? mapWorkoutsFromRows(workoutRows) : [],
      activeWorkout: null,
    });
    setLoading(false);
  }

  // ── Workout actions ──
  function startWorkout(template) {
    setState((prev) => ({ ...prev, activeWorkout: createWorkoutFromTemplate(template) }));
    setScreen("workout");
  }
  function startWorkoutOnDate(templateId, date) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;
    const workout = { ...createWorkoutFromTemplate(template), date };
    setState((prev) => ({ ...prev, activeWorkout: workout }));
    setSelectedCalDay(null);
    setScreen("workout");
  }
  function updateSet(exerciseId, setIndex, field, value) {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((ex) =>
            ex.id === exerciseId
              ? { ...ex, sets: ex.sets.map((set, i) => i === setIndex ? { ...set, [field]: value } : set) }
              : ex
          ),
        },
      };
    });
  }
  function addSet(exerciseId) {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return { ...prev, activeWorkout: { ...prev.activeWorkout, exercises: prev.activeWorkout.exercises.map((ex) => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, emptySet()] } : ex) } };
    });
  }
  function removeSet(exerciseId, setIndex) {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            if (ex.sets.length <= 1) return ex;
            return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
          }),
        },
      };
    });
  }
  function addExerciseToActive() {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return { ...prev, activeWorkout: { ...prev.activeWorkout, exercises: [...prev.activeWorkout.exercises, { id: safeId(), name: "New Exercise", sets: [emptySet(), emptySet(), emptySet()] }] } };
    });
  }
  function updateExerciseName(exerciseId, value) {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return { ...prev, activeWorkout: { ...prev.activeWorkout, exercises: prev.activeWorkout.exercises.map((ex) => ex.id === exerciseId ? { ...ex, name: value } : ex) } };
    });
  }
  async function saveWorkout() {
    if (!state.activeWorkout) return;
    const workoutToSave = state.activeWorkout;
    setState((prev) => ({ ...prev, workouts: [...prev.workouts, workoutToSave], activeWorkout: null }));
    setScreen("home");
    if (!supabase || !session?.user) { setMessage("Workout saved locally."); return; }
    setSyncing(true);
    const { error } = await supabase.from("workout_sessions").insert({
      id: workoutToSave.id, user_id: session.user.id, date: workoutToSave.date,
      template_name: workoutToSave.templateName, notes: workoutToSave.notes, exercises: workoutToSave.exercises,
    });
    setSyncing(false);
    setMessage(error ? `Saved locally — sync failed: ${error.message}` :"Workout saved ✓");
  }
  function cancelWorkout() {
    setState((prev) => ({ ...prev, activeWorkout: null }));
    setScreen("home");
  }
  function duplicateLastWorkout() {
    if (!state.workouts.length) return;
    const latest = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const copy = { ...latest, id: safeId(), date: todayKey(), exercises: latest.exercises.map((ex) => ({ ...ex, id: safeId(), sets: ex.sets.map(() => emptySet()) })) };
    setState((prev) => ({ ...prev, activeWorkout: copy }));
    setScreen("workout");
  }

  // ── Template actions ──
  async function addTemplate() {
    const name = templateName.trim();
    const exercises = templateExercises.split(",").map((x) => x.trim()).filter(Boolean);
    if (!name || !exercises.length) return;
    const newTemplate = { id: safeId(), name, exercises };
    setState((prev) => ({ ...prev, templates: [...prev.templates, newTemplate] }));
    setTemplateName(""); setTemplateExercises("");
    if (supabase && session?.user) {
      const { error } = await supabase.from("workout_templates").insert({ id: newTemplate.id, user_id: session.user.id, name: newTemplate.name, exercises: newTemplate.exercises });
      if (error) setMessage(`Template saved locally — sync failed: ${error.message}`);
    }
  }
  async function removeTemplate(templateId) {
    setState((prev) => ({ ...prev, templates: prev.templates.filter((t) => t.id !== templateId) }));
    if (supabase && session?.user) {
      await supabase.from("workout_templates").delete().eq("id", templateId).eq("user_id", session.user.id);
    }
  }
  function startEditTemplate(template) {
    setEditingTemplateId(template.id);
    setEditName(template.name);
    setEditExercises(template.exercises.join(", "));
  }
  async function saveEditTemplate() {
    const name = editName.trim();
    const exercises = editExercises.split(",").map((x) => x.trim()).filter(Boolean);
    if (!name || !exercises.length) return;
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => t.id === editingTemplateId ? { ...t, name, exercises } : t),
    }));
    if (supabase && session?.user) {
      await supabase.from("workout_templates").update({ name, exercises }).eq("id", editingTemplateId).eq("user_id", session.user.id);
    }
    setEditingTemplateId(null);
  }

  // ── Schedule actions ──
  function assignSchedule(date, templateId) {
    setSchedule((prev) => ({ ...prev, [date]: templateId }));
    setSelectedCalDay(null);
  }
  function removeScheduleDay(date) {
    setSchedule((prev) => { const next = { ...prev }; delete next[date]; return next; });
    setSelectedCalDay(null);
  }

  // ── Calendar day click ──
  function handleCalDayClick(dateStr) {
    const completed = state.workouts.find((w) => w.date === dateStr);
    if (completed) {
      setDetailWorkoutId(completed.id);
      setScreen("workoutDetail");
      return;
    }
    setSelectedCalDay(selectedCalDay === dateStr ? null : dateStr);
  }

  // ── Auth ──
  async function signUp() {
    if (!supabase) { setMessage("Supabase not configured."); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Account created — check your email.");
  }
  async function signIn() {
    if (!supabase) { setMessage("Supabase not configured."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in ✓");
  }
  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("Signed out.");
  }

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (!q) return sorted;
    return sorted.filter((w) =>
      w.templateName.toLowerCase().includes(q) || w.date.includes(q) ||
      w.exercises.some((e) => e.name.toLowerCase().includes(q))
    );
  }, [state.workouts, search]);

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🏋️</div>
          <p>Loading your gym data...</p>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: "home", label: "Home", icon: Icons.home },
    { id: "calendar", label: "Calendar", icon: Icons.calendar },
    { id: "history", label: "History", icon: Icons.history },
    { id: "templates", label: "Templates", icon: Icons.templates },
  ];

  const showNav = !["choose", "workout"].includes(screen);

  return (
    <div className="app">
      {/* ── SIDEBAR (desktop only) ── */}
      {showNav && (
        <aside className="sidebar">
          <div className="sidebar-logo">🏋️ Gym Logger</div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className={`sidebar-nav-btn ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button className="sidebar-account-btn" onClick={() => setScreen("account")}>
            {Icons.account}
            <span>{session ? session.user.email.split("@")[0] : "Account"}</span>
          </button>
        </aside>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">

        {/* ── HOME ── */}
        {screen === "home" && (
          <div className="screen">
            <div className="screen-header">
              <div>
                <p className="screen-eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                <h1 className="screen-title">Gym Logger</h1>
              </div>
              <button className="icon-btn mobile-only" onClick={() => setScreen("account")}>{Icons.account}</button>
            </div>
            {message && <div className="banner">{message}</div>}
            <div className="home-actions">
              {state.activeWorkout ? (
                <button className="cta-btn accent" onClick={() => setScreen("workout")}>Resume: {state.activeWorkout.templateName} →</button>
              ) : (
                <button className="cta-btn accent" onClick={() => setScreen("choose")}>Start Workout</button>
              )}
              {state.workouts.length > 0 && !state.activeWorkout && (
                <button className="cta-btn secondary" onClick={duplicateLastWorkout}>Repeat Last Workout</button>
              )}
            </div>
            {state.workouts.length > 0 && (() => {
              const last = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
              return (
                <div className="section">
                  <h2 className="section-title">Last Session</h2>
                  <div className="workout-card">
                    <div className="workout-card-header">
                      <span className="workout-name">{last.templateName}</span>
                      <span className="workout-date-pill">{last.date}</span>
                    </div>
                    <div className="exercise-list">
                      {last.exercises.slice(0, 4).map((ex) => (
                        <div key={ex.id} className="exercise-summary">
                          <span className="ex-name">{ex.name}</span>
                          <span className="ex-sets-summary">{ex.sets.filter((s) => s.weight || s.reps).map((s) => `${s.weight || "-"}×${s.reps || "-"}`).join("  ") || "—"}</span>
                        </div>
                      ))}
                      {last.exercises.length > 4 && <p className="muted small">+{last.exercises.length - 4} more</p>}
                    </div>
                  </div>
                </div>
              );
            })()}
            {state.workouts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏋️</div>
                <p>No workouts yet.</p>
                <p className="muted small">Tap Start Workout to log your first session.</p>
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR ── */}
        {screen === "calendar" && (
          <div className="screen">
            <div className="screen-header">
              <h1 className="screen-title">Calendar</h1>
            </div>
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={() => setCalView((v) => {
                const m = v.month === 0 ? 11 : v.month - 1;
                const y = v.month === 0 ? v.year - 1 : v.year;
                return { year: y, month: m };
              })}>{Icons.chevLeft}</button>
              <span className="cal-month-label">{MONTH_NAMES[calView.month]} {calView.year}</span>
              <button className="cal-nav-btn" onClick={() => setCalView((v) => {
                const m = v.month === 11 ? 0 : v.month + 1;
                const y = v.month === 11 ? v.year + 1 : v.year;
                return { year: y, month: m };
              })}>{Icons.chevRight}</button>
            </div>

            <div className="cal-grid">
              {DAY_LABELS.map((d) => <div key={d} className="cal-day-label">{d}</div>)}
              {getMonthGrid(calView.year, calView.month).map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = fmtDate(calView.year, calView.month, day);
                const today = todayKey();
                const isToday = dateStr === today;
                const completed = state.workouts.find((w) => w.date === dateStr);
                const scheduled = !completed && schedule[dateStr]
                  ? state.templates.find((t) => t.id === schedule[dateStr])
                  : null;
                const isSelected = selectedCalDay === dateStr;
                return (
                  <div
                    key={dateStr}
                    className={`cal-day ${isToday ? "today" : ""} ${completed ? "has-workout" : ""} ${scheduled ? "has-schedule" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => handleCalDayClick(dateStr)}
                  >
                    <span className="cal-day-num">{day}</span>
                    {completed && <span className="cal-label completed">{completed.templateName.split(" ")[0]}</span>}
                    {scheduled && <span className="cal-label scheduled">{scheduled.name.split(" ")[0]}</span>}
                  </div>
                );
              })}
            </div>

            {/* Day detail panel */}
            {selectedCalDay && (() => {
              const scheduledTemplateId = schedule[selectedCalDay];
              const scheduledTemplate = scheduledTemplateId ? state.templates.find((t) => t.id === scheduledTemplateId) : null;
              const isPast = selectedCalDay < todayKey();
              return (
                <div className="day-panel">
                  <div className="day-panel-header">
                    <span className="day-panel-date">{selectedCalDay}</span>
                    <button className="icon-btn" onClick={() => setSelectedCalDay(null)}>✕</button>
                  </div>
                  {scheduledTemplate && (
                    <div className="day-panel-scheduled">
                      <span className="muted small">Scheduled:</span>
                      <span className="workout-name">{scheduledTemplate.name}</span>
                    </div>
                  )}
                  <div className="day-panel-actions">
                    {scheduledTemplate && (
                      <button className="cta-btn accent" onClick={() => startWorkoutOnDate(scheduledTemplateId, selectedCalDay)}>
                        Start This Workout
                      </button>
                    )}
                    {!scheduledTemplate && (
                      <div>
                        <p className="muted small" style={{ marginBottom: 10 }}>Assign a workout to this day:</p>
                        <div className="template-pick-list">
                          {state.templates.map((t) => (
                            <button key={t.id} className="template-pick-btn" onClick={() => assignSchedule(selectedCalDay, t.id)}>
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {scheduledTemplate && (
                      <button className="cta-btn secondary" onClick={() => removeScheduleDay(selectedCalDay)}>
                        Remove Schedule
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="cal-legend">
              <span className="legend-item"><span className="legend-dot completed" />Completed</span>
              <span className="legend-item"><span className="legend-dot scheduled" />Scheduled</span>
              <span className="legend-item"><span className="legend-dot today" />Today</span>
            </div>
          </div>
        )}

        {/* ── CHOOSE WORKOUT ── */}
        {screen === "choose" && (
          <div className="screen">
            <div className="screen-header">
              <button className="back-btn" onClick={() => setScreen("home")}>{Icons.back} Back</button>
            </div>
            <h1 className="screen-title">Choose Workout</h1>
            <div className="template-list">
              {state.templates.map((template) => (
                <div key={template.id} className="template-row" onClick={() => startWorkout(template)}>
                  <div className="template-row-info">
                    <span className="template-row-name">{template.name}</span>
                    <span className="template-row-exercises muted small">{template.exercises.join(" · ")}</span>
                  </div>
                  <span className="template-row-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVE WORKOUT ── */}
        {screen === "workout" && state.activeWorkout && (
          <div className="screen">
            <div className="screen-header">
              <button className="back-btn danger-text" onClick={cancelWorkout}>✕ Cancel</button>
              <button className="save-btn" onClick={saveWorkout}>Save Workout</button>
            </div>
            <div className="workout-header">
              <h1 className="screen-title">{state.activeWorkout.templateName}</h1>
              <span className="workout-date-pill">{state.activeWorkout.date}</span>
            </div>
            <div className="exercises-stack">
              {state.activeWorkout.exercises.map((exercise) => {
                const last = getLastExerciseStats(state.workouts, exercise.name);
                return (
                  <div key={exercise.id} className="exercise-card">
                    <input className="exercise-name-input" value={exercise.name} onChange={(e) => updateExerciseName(exercise.id, e.target.value)} />
                    {last && (
                      <div className="last-time-hint">Last ({last.date}): {last.sets.map((s) => `${s.weight || "-"}×${s.reps || "-"}`).join("  ")}</div>
                    )}
                    <div className="sets-header">
                      <span>Set</span><span>Weight</span><span>Reps</span><span></span>
                    </div>
                    {exercise.sets.map((set, index) => (
                      <div key={index} className="set-row">
                        <span className="set-number">{index + 1}</span>
                        <input type="number" inputMode="decimal" placeholder="0" value={set.weight} onChange={(e) => updateSet(exercise.id, index, "weight", e.target.value)} />
                        <input type="number" inputMode="numeric" placeholder="0" value={set.reps} onChange={(e) => updateSet(exercise.id, index, "reps", e.target.value)} />
                        <button className="remove-set-btn" onClick={() => removeSet(exercise.id, index)}>✕</button>
                      </div>
                    ))}
                    <button className="add-set-btn" onClick={() => addSet(exercise.id)}>+ Add Set</button>
                  </div>
                );
              })}
            </div>
            <button className="add-exercise-btn" onClick={addExerciseToActive}>+ Add Exercise</button>
          </div>
        )}

        {/* ── WORKOUT DETAIL (from calendar) ── */}
        {screen === "workoutDetail" && (() => {
          const workout = state.workouts.find((w) => w.id === detailWorkoutId);
          if (!workout) return null;
          return (
            <div className="screen">
              <div className="screen-header">
                <button className="back-btn" onClick={() => setScreen("calendar")}>{Icons.back} Calendar</button>
              </div>
              <div className="workout-header">
                <h1 className="screen-title">{workout.templateName}</h1>
                <span className="workout-date-pill">{workout.date}</span>
              </div>
              <div className="exercises-stack">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="exercise-card">
                    <p className="exercise-detail-name">{exercise.name}</p>
                    <div className="sets-header">
                      <span>Set</span><span>Weight</span><span>Reps</span><span></span>
                    </div>
                    {exercise.sets.filter((s) => s.weight || s.reps).map((set, i) => (
                      <div key={i} className="set-row readonly">
                        <span className="set-number">{i + 1}</span>
                        <span className="set-val">{set.weight || "—"}</span>
                        <span className="set-val">{set.reps || "—"}</span>
                        <span />
                      </div>
                    ))}
                    {exercise.sets.filter((s) => s.weight || s.reps).length === 0 && (
                      <p className="muted small">No sets logged</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── HISTORY ── */}
        {screen === "history" && (
          <div className="screen">
            <div className="screen-header">
              <h1 className="screen-title">History</h1>
            </div>
            <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workouts..." />
            {filteredHistory.length === 0 ? (
              <div className="empty-state"><p className="muted">No workouts found.</p></div>
            ) : (
              <div className="workout-list">
                {filteredHistory.map((workout) => (
                  <div key={workout.id} className="workout-card">
                    <div className="workout-card-header">
                      <span className="workout-name">{workout.templateName}</span>
                      <span className="workout-date-pill">{workout.date}</span>
                    </div>
                    <div className="exercise-list">
                      {workout.exercises.map((ex) => (
                        <div key={ex.id} className="exercise-summary">
                          <span className="ex-name">{ex.name}</span>
                          <span className="ex-sets-summary">{ex.sets.filter((s) => s.weight || s.reps).map((s) => `${s.weight || "-"}×${s.reps || "-"}`).join("  ") || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TEMPLATES ── */}
        {screen === "templates" && (
          <div className="screen">
            <div className="screen-header">
              <h1 className="screen-title">Templates</h1>
            </div>
            <div className="template-list">
              {state.templates.map((template) => (
                <div key={template.id} className="template-card-full">
                  {editingTemplateId === template.id ? (
                    <div className="edit-form">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Workout name" />
                      <input value={editExercises} onChange={(e) => setEditExercises(e.target.value)} placeholder="Exercises separated by commas" />
                      <div className="edit-form-actions">
                        <button className="cta-btn accent" onClick={saveEditTemplate}>Save</button>
                        <button className="cta-btn secondary" onClick={() => setEditingTemplateId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="template-card-top">
                        <span className="template-row-name">{template.name}</span>
                        <div className="template-card-actions">
                          <button className="edit-btn" onClick={() => startEditTemplate(template)}>{Icons.edit} Edit</button>
                          <button className="danger-btn" onClick={() => removeTemplate(template.id)}>Delete</button>
                        </div>
                      </div>
                      <div className="chips">
                        {template.exercises.map((ex) => <span key={ex} className="chip">{ex}</span>)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="create-template">
              <h2 className="section-title">New Template</h2>
              <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Workout name (e.g. Push Day)" />
              <input value={templateExercises} onChange={(e) => setTemplateExercises(e.target.value)} placeholder="Exercises separated by commas" />
              <button className="cta-btn accent" onClick={addTemplate}>Add Template</button>
            </div>
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {screen === "account" && (
          <div className="screen">
            <div className="screen-header">
              <button className="back-btn" onClick={() => setScreen("home")}>{Icons.back} Back</button>
            </div>
            <h1 className="screen-title">Account</h1>
            {!session ? (
              <div className="auth-form">
                {!hasSupabase && <div className="banner">Cloud login disabled — Supabase keys not added yet.</div>}
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" disabled={!hasSupabase} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" disabled={!hasSupabase} />
                <button className="cta-btn accent" onClick={signIn} disabled={!hasSupabase}>Sign In</button>
                <button className="cta-btn secondary" onClick={signUp} disabled={!hasSupabase}>Create Account</button>
              </div>
            ) : (
              <div className="auth-form">
                <div className="banner">Signed in as {session.user.email}</div>
                {syncing && <p className="muted small">Syncing...</p>}
                <button className="cta-btn secondary" onClick={signOut}>Sign Out</button>
              </div>
            )}
            {message && <div className="banner" style={{ marginTop: 12 }}>{message}</div>}
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      {showNav && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={`nav-btn ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}