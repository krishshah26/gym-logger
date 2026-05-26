import React, { useEffect, useMemo, useState } from "react";
import { supabase, hasSupabase } from "./services/supabase";
import { useAuth } from "./context/AuthContext";
import { SignInPromptModal } from "./components/Common/SignInPromptModal";
import { Icons } from "./utils/icons";
import {
  DEFAULT_TEMPLATES,
  MONTH_NAMES,
  DAY_LABELS,
  SCHEDULE_KEY,
} from "./utils/constants";
import {
  todayKey,
  emptySet,
  safeId,
  getDefaultState,
  fmtDate,
  getMonthGrid,
  createWorkoutFromTemplate,
  loadLocalState,
  loadStoredLocalState,
  hasLocalDataToMigrate,
  saveLocalState,
  loadSchedule,
  mapTemplatesFromRows,
  mapWorkoutsFromRows,
  getLastExerciseStats,
  migrateLocalDataToCloud,
} from "./utils/helpers";

export default function App() {
  const { session, isGuest, loading: authLoading, startGuestMode, signOut: authSignOut } = useAuth();
  
  const [state, setState] = useState(getDefaultState());
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState("");
  const [screen, setScreen] = useState("home");
  // Sign-in prompt modal state
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [signInPromptAction, setSignInPromptAction] = useState("");
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
    if (!isGuest && session) { 
      hydrateFromCloud();
    } else if (isGuest) {
      // Load local data or default templates for guest mode
      const localState = loadLocalState();
      setState({
        templates: localState.templates.length ? localState.templates : DEFAULT_TEMPLATES,
        workouts: localState.workouts,
        activeWorkout: null,
      });
      setLoading(false);
    } else if (!session) {
      setLoading(false);
    }
  }, [session, isGuest]);

  useEffect(() => { saveLocalState(state); }, [state]);

  async function hydrateFromCloud() {
    if (!supabase || !session) return;
    setLoading(true);
    const [{ data: templateRows, error: te }, { data: workoutRows, error: we }] = await Promise.all([
      supabase.from("workout_templates").select("id, name, exercises").order("created_at", { ascending: true }),
      supabase.from("workout_sessions").select("id, date, template_name, notes, exercises").order("date", { ascending: false }),
    ]);
    if (te || we) { setMessage(te?.message || we?.message || "Could not load cloud data."); setLoading(false); return; }
    
    const storedLocalState = loadStoredLocalState();
    const localState = loadLocalState();
    const cloudTemplates = templateRows?.length ? mapTemplatesFromRows(templateRows) : [];
    const cloudWorkouts = workoutRows?.length ? mapWorkoutsFromRows(workoutRows) : [];
    const shouldMigrate = hasLocalDataToMigrate(storedLocalState);

    if (shouldMigrate) {
      setMessage("Importing your local data to cloud...");
      const { templatesCount, workoutsCount } = await migrateLocalDataToCloud(
        supabase,
        session,
        localState,
        cloudTemplates,
        cloudWorkouts
      );

      const [{ data: updatedTemplateRows }, { data: updatedWorkoutRows }] = await Promise.all([
        supabase.from("workout_templates").select("id, name, exercises").order("created_at", { ascending: true }),
        supabase.from("workout_sessions").select("id, date, template_name, notes, exercises").order("date", { ascending: false }),
      ]);

      const migratedTemplates = updatedTemplateRows?.length ? mapTemplatesFromRows(updatedTemplateRows) : DEFAULT_TEMPLATES;
      const migratedWorkouts = updatedWorkoutRows?.length ? mapWorkoutsFromRows(updatedWorkoutRows) : [];

      setState({
        templates: migratedTemplates,
        workouts: migratedWorkouts,
        activeWorkout: null,
      });

      if (templatesCount > 0 || workoutsCount > 0) {
        setMessage(`✓ Imported ${workoutsCount} workout${workoutsCount !== 1 ? 's' : ''} and ${templatesCount} template${templatesCount !== 1 ? 's' : ''}`);
      }
    } else {
      setState({
        templates: cloudTemplates.length ? cloudTemplates : DEFAULT_TEMPLATES,
        workouts: cloudWorkouts.length ? cloudWorkouts : [],
        activeWorkout: null,
      });
    }
    
    setLoading(false);
  }

  function requireSession(action = "perform this action") {
    if (isGuest) {
      setSignInPromptAction(action);
      setShowSignInPrompt(true);
      return false;
    }
    if (!session) {
      setMessage(`Please sign in to ${action}.`);
      return false;
    }
    return true;
  }

  function handleSignInFromPrompt() {
    setShowSignInPrompt(false);
    setScreen("account");
  }

  // ── Workout actions ──
  function startWorkout(template) {
    if (!requireSession("start a workout")) return;
    setState((prev) => ({ ...prev, activeWorkout: createWorkoutFromTemplate(template) }));
    setScreen("workout");
  }
  function startWorkoutOnDate(templateId, date) {
    if (!requireSession("start a workout")) return;
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
    if (!requireSession("save a workout")) return;
    if (!state.activeWorkout) return;
    const workoutToSave = state.activeWorkout;
    setState((prev) => ({ ...prev, workouts: [...prev.workouts, workoutToSave], activeWorkout: null }));
    setScreen("home");
    setSyncing(true);
    const { error } = await supabase.from("workout_sessions").insert({
      id: workoutToSave.id, user_id: session.user.id, date: workoutToSave.date,
      template_name: workoutToSave.templateName, notes: workoutToSave.notes, exercises: workoutToSave.exercises,
    });
    setSyncing(false);
    setMessage(error ? `Save failed: ${error.message}` : "Workout saved ✓");
  }
  function cancelWorkout() {
    setState((prev) => ({ ...prev, activeWorkout: null }));
    setScreen("home");
  }
  function duplicateLastWorkout() {
    if (!requireSession("repeat last workout")) return;
    if (!state.workouts.length) return;
    const latest = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const copy = { ...latest, id: safeId(), date: todayKey(), exercises: latest.exercises.map((ex) => ({ ...ex, id: safeId(), sets: ex.sets.map(() => emptySet()) })) };
    setState((prev) => ({ ...prev, activeWorkout: copy }));
    setScreen("workout");
  }

  // ── Template actions ──
  async function addTemplate() {
    if (!requireSession("add a template")) return;
    const name = templateName.trim();
    const exercises = templateExercises.split(",").map((x) => x.trim()).filter(Boolean);
    if (!name || !exercises.length) return;
    const newTemplate = { id: safeId(), name, exercises };
    setState((prev) => ({ ...prev, templates: [...prev.templates, newTemplate] }));
    setTemplateName(""); setTemplateExercises("");
    setSyncing(true);
    const { error } = await supabase.from("workout_templates").insert({ id: newTemplate.id, user_id: session.user.id, name: newTemplate.name, exercises: newTemplate.exercises });
    setSyncing(false);
    if (error) setMessage(`Save failed: ${error.message}`);
  }
  async function removeTemplate(templateId) {
    if (!requireSession("remove a template")) return;
    setState((prev) => ({ ...prev, templates: prev.templates.filter((t) => t.id !== templateId) }));
    setSyncing(true);
    const { error } = await supabase.from("workout_templates").delete().eq("id", templateId).eq("user_id", session.user.id);
    setSyncing(false);
    if (error) setMessage(`Remove failed: ${error.message}`);
  }
  function startEditTemplate(template) {
    setEditingTemplateId(template.id);
    setEditName(template.name);
    setEditExercises(template.exercises.join(", "));
  }
  async function saveEditTemplate() {
    if (!requireSession("update a template")) return;
    const name = editName.trim();
    const exercises = editExercises.split(",").map((x) => x.trim()).filter(Boolean);
    if (!name || !exercises.length) return;
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => t.id === editingTemplateId ? { ...t, name, exercises } : t),
    }));
    setSyncing(true);
    const { error } = await supabase.from("workout_templates").update({ name, exercises }).eq("id", editingTemplateId).eq("user_id", session.user.id);
    setSyncing(false);
    if (error) setMessage(`Update failed: ${error.message}`);
    setEditingTemplateId(null);
  }

  // ── Schedule actions ──
  function assignSchedule(date, templateId) {
    if (!requireSession("schedule a workout")) return;
    setSchedule((prev) => ({ ...prev, [date]: templateId }));
    setSelectedCalDay(null);
  }
  function removeScheduleDay(date) {
    if (!requireSession("modify schedule")) return;
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
    await authSignOut();
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

  if (authLoading || loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🏋️</div>
          <p>Loading your gym data...</p>
        </div>
      </div>
    );
  }

  // ─── Authentication Guard ───
  if (!session && !isGuest) {
    return (
      <div className="app auth-screen">
        <div className="auth-screen-container">
          <div className="auth-screen-logo">🏋️</div>
          <h1 className="auth-screen-title">Gym Logger</h1>
          <p className="auth-screen-subtitle">Track your workouts in the cloud</p>
          
          {!hasSupabase && (
            <div className="banner" style={{ marginBottom: 20 }}>
              ⚠️ Supabase keys not configured. Contact admin.
            </div>
          )}
          
          <div className="auth-form" style={{ marginTop: 30 }}>
            <h2 className="section-title">Sign In or Create Account</h2>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              type="email" 
              disabled={!hasSupabase}
            />
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              type="password" 
              disabled={!hasSupabase}
            />
            <button 
              className="cta-btn accent" 
              onClick={signIn} 
              disabled={!hasSupabase}
            >
              Sign In
            </button>
            <button 
              className="cta-btn secondary" 
              onClick={signUp} 
              disabled={!hasSupabase}
            >
              Create Account
            </button>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <p className="muted small" style={{ marginBottom: 12 }}>or</p>
              <button 
                className="cta-btn" 
                style={{ backgroundColor: "#6c757d", color: "white" }}
                onClick={startGuestMode}
              >
                Explore as Guest
              </button>
              <p className="muted small" style={{ marginTop: 8, fontSize: "12px" }}>You can sign in later to save your progress</p>
            </div>
          </div>
          
          {message && <div className="banner" style={{ marginTop: 20 }}>{message}</div>}
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
          {isGuest && <div className="badge" style={{ backgroundColor: "#ffc107", color: "#000", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", textAlign: "center", marginBottom: "12px", fontWeight: "500" }}>👤 Guest Mode</div>}
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
                {isGuest && (
                  <div className="banner" style={{ backgroundColor: "#ffc107", color: "#000", marginBottom: "16px" }}>
                    👤 You're exploring as a guest. Sign in to save your progress to the cloud.
                  </div>
                )}
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

      {/* ── SIGN-IN PROMPT MODAL ── */}
      <SignInPromptModal 
        isOpen={showSignInPrompt}
        action={signInPromptAction}
        onClose={() => setShowSignInPrompt(false)}
        onSignIn={handleSignInFromPrompt}
      />
    </div>
  );
}