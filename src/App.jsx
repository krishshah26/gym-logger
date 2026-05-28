import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase, hasSupabase } from "./services/supabase";
import { useAuth } from "./context/AuthContext";
import { SignInPromptModal } from "./components/Common/SignInPromptModal";
import { DeleteConfirmModal } from "./components/Common/DeleteConfirmModal";
import { OneRepMaxInfoModal } from "./components/Common/OneRepMaxInfoModal";
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
  calculateWorkoutStreak,
  calculateBestWorkoutStreak,
  calculateExerciseOneRepMax,
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
  const [messageTone, setMessageTone] = useState("info");
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("signIn");
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
  // Workout detail (from calendar/history)
  const [detailWorkoutId, setDetailWorkoutId] = useState(null);
  const [detailReturnScreen, setDetailReturnScreen] = useState("calendar");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const hasHydratedCloudRef = useRef(false);
  const [streakSettings, setStreakSettings] = useState(() => {
    if (typeof window === "undefined") return { enabled: false, target: 7, lastResetDate: null };
    try {
      const saved = localStorage.getItem("gym-streak-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: Boolean(parsed.enabled),
          target: Math.max(1, Number.parseInt(parsed.target, 10) || 7),
          lastResetDate: parsed.lastResetDate || null,
        };
      }
    } catch {
      // ignore parse errors and fall back to defaults
    }
    return { enabled: false, target: 7, lastResetDate: null };
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = localStorage.getItem("gym-theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    workoutId: null,
    mode: "delete",
    title: "Delete Workout",
    description: "This will permanently remove this workout from your history.",
    confirmLabel: "Delete Workout",
  });
  const [showOneRepMaxInfo, setShowOneRepMaxInfo] = useState(false);

  const toggleTheme = () => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  };

  const toggleStreakTracking = () => {
    setStreakSettings((current) => ({
      ...current,
      enabled: !current.enabled,
    }));
  };

  const updateStreakTarget = (value) => {
    const parsed = Number.parseInt(value, 10);
    setStreakSettings((current) => ({
      ...current,
      target: Number.isNaN(parsed) ? 1 : Math.max(1, parsed),
    }));
  };

  const currentStreak = calculateWorkoutStreak(state.workouts, { resetFromDate: streakSettings.lastResetDate });
  const bestStreak = calculateBestWorkoutStreak(state.workouts);
  const streakTarget = Math.max(1, streakSettings.target || 1);
  const showWorkoutStreak = streakSettings.enabled;
  const goalJustReached = streakSettings.lastResetDate === todayKey();

  // Load schedule from localStorage
  useEffect(() => { setSchedule(loadSchedule()); }, []);
  useEffect(() => { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule)); }, [schedule]);

  useEffect(() => {
    if (!isGuest && session?.user?.id) {
      const localState = loadLocalState();
      setState({
        templates: localState.templates.length ? localState.templates : DEFAULT_TEMPLATES,
        workouts: localState.workouts,
        activeWorkout: localState.activeWorkout ?? null,
      });
      setLoading(false);

      if (!hasHydratedCloudRef.current) {
        hasHydratedCloudRef.current = true;
        hydrateFromCloud({ silent: true });
      }
      return;
    }

    hasHydratedCloudRef.current = false;

    if (isGuest) {
      const localState = loadLocalState();
      setState({
        templates: localState.templates.length ? localState.templates : DEFAULT_TEMPLATES,
        workouts: localState.workouts,
        activeWorkout: null,
      });
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [session?.user?.id, isGuest]);

  useEffect(() => {
    saveLocalState(state);
    if (state.activeWorkout) {
      setDraftSavedAt(new Date());
    }
  }, [state]);

  useEffect(() => {
    localStorage.setItem("gym-streak-settings", JSON.stringify(streakSettings));
  }, [streakSettings]);

  useEffect(() => {
    if (!streakSettings.enabled) return;
    if (currentStreak >= streakTarget && streakSettings.lastResetDate !== todayKey()) {
      setStreakSettings((previous) => ({
        ...previous,
        lastResetDate: todayKey(),
      }));
    }
  }, [currentStreak, streakSettings.enabled, streakTarget, streakSettings.lastResetDate]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("gym-theme", theme);
  }, [theme]);

  async function hydrateFromCloud(options = {}) {
    const { silent = false } = options;
    if (!supabase || !session) return;
    if (!silent) setLoading(true);
    const [{ data: templateRows, error: te }, { data: workoutRows, error: we }] = await Promise.all([
      supabase.from("workout_templates").select("id, name, exercises").order("created_at", { ascending: true }),
      supabase.from("workout_sessions").select("id, date, template_name, notes, exercises").order("date", { ascending: false }),
    ]);
    if (te || we) {
      setMessage(te?.message || we?.message || "Could not load cloud data.");
      if (!silent) setLoading(false);
      return;
    }
    
    const storedLocalState = loadStoredLocalState();
    const localState = loadLocalState();
    const draftWorkout = storedLocalState?.activeWorkout ?? null;
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
        activeWorkout: draftWorkout,
      });

      if (templatesCount > 0 || workoutsCount > 0) {
        setMessage(`✓ Imported ${workoutsCount} workout${workoutsCount !== 1 ? 's' : ''} and ${templatesCount} template${templatesCount !== 1 ? 's' : ''}`);
      }
    } else {
      setState({
        templates: cloudTemplates.length ? cloudTemplates : DEFAULT_TEMPLATES,
        workouts: cloudWorkouts.length ? cloudWorkouts : [],
        activeWorkout: draftWorkout,
      });
    }
    
    if (!silent) setLoading(false);
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
      return { ...prev, activeWorkout: { ...prev.activeWorkout, exercises: [...prev.activeWorkout.exercises, { id: safeId(), name: "New Exercise", note: "", sets: [emptySet(), emptySet(), emptySet()] }] } };
    });
  }
  function updateExerciseName(exerciseId, value) {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return { ...prev, activeWorkout: { ...prev.activeWorkout, exercises: prev.activeWorkout.exercises.map((ex) => ex.id === exerciseId ? { ...ex, name: value } : ex) } };
    });
  }
  function updateExerciseNote(exerciseId, value) {
    setState((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, note: value } : ex
          ),
        },
      };
    });
  }
  async function saveWorkout() {
    if (!requireSession("save a workout")) return;
    if (!state.activeWorkout) return;

    const workoutToSave = state.activeWorkout;
    const isEditingExisting = Boolean(editingWorkoutId);

    if (isEditingExisting) {
      const updatedWorkout = { ...workoutToSave, id: editingWorkoutId };
      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.map((workout) => workout.id === editingWorkoutId ? updatedWorkout : workout),
        activeWorkout: null,
      }));

      if (supabase && session) {
        setSyncing(true);
        const { error } = await supabase
          .from("workout_sessions")
          .update({
            date: updatedWorkout.date,
            template_name: updatedWorkout.templateName,
            notes: updatedWorkout.notes,
            exercises: updatedWorkout.exercises,
          })
          .eq("id", editingWorkoutId)
          .eq("user_id", session.user.id);
        setSyncing(false);

        if (error) {
          setMessage(`Update failed: ${error.message}`);
          return;
        }
      }

      setEditingWorkoutId(null);
      setScreen("home");
      setMessage("Workout updated ✓");
      return;
    }

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
    setEditingWorkoutId(null);
    setState((prev) => ({ ...prev, activeWorkout: null }));
    setScreen("home");
  }
  function duplicateLastWorkout() {
    if (!requireSession("repeat last workout")) return;
    if (!state.workouts.length) return;
    const latest = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const copy = {
      ...latest,
      id: safeId(),
      date: todayKey(),
      exercises: latest.exercises.map((ex) => ({
        ...ex,
        id: safeId(),
        note: ex.note || "",
        sets: ex.sets.map(() => emptySet()),
      })),
    };
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

  function requestWorkoutAction(workoutId, mode) {
    const action = mode === "delete" ? "delete a workout" : "clear workout logs";
    if (!requireSession(action)) return;

    setDeleteModalState({
      isOpen: true,
      workoutId,
      mode,
      title: mode === "delete" ? "Delete Workout" : "Clear Workout Logs",
      description: mode === "delete"
        ? "This will permanently remove this workout from your history."
        : "This will clear all logged weights and reps while keeping the workout record.",
      confirmLabel: mode === "delete" ? "Delete Workout" : "Clear Logs",
    });
  }

  async function handleDeleteModalConfirm() {
    if (!deleteModalState.workoutId) return;

    const { workoutId, mode } = deleteModalState;
    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));

    if (mode === "delete") {
      await deleteWorkout(workoutId);
      return;
    }

    await clearWorkoutLogs(workoutId);
  }

  async function deleteWorkout(workoutId) {
    const workoutToDelete = state.workouts.find((workout) => workout.id === workoutId);
    if (!workoutToDelete) return;

    if (session) {
      setSyncing(true);
      const { error } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", workoutId)
        .eq("user_id", session.user.id);
      setSyncing(false);

      if (error) {
        setMessage(`Delete failed: ${error.message}`);
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((workout) => workout.id !== workoutId),
    }));

    if (detailWorkoutId === workoutId) {
      setDetailWorkoutId(null);
      if (screen === "workoutDetail") {
        setScreen(detailReturnScreen || "calendar");
      }
    }

    setMessage("Workout deleted.");
  }

  async function clearWorkoutLogs(workoutId) {
    const workoutToClear = state.workouts.find((workout) => workout.id === workoutId);
    if (!workoutToClear) return;

    const clearedExercises = workoutToClear.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map(() => emptySet()),
    }));

    if (session) {
      setSyncing(true);
      const { error } = await supabase
        .from("workout_sessions")
        .update({ exercises: clearedExercises })
        .eq("id", workoutId)
        .eq("user_id", session.user.id);
      setSyncing(false);

      if (error) {
        setMessage(`Clear failed: ${error.message}`);
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      workouts: prev.workouts.map((workout) =>
        workout.id === workoutId
          ? { ...workout, exercises: clearedExercises }
          : workout
      ),
    }));

    setMessage("Workout logs cleared.");
  }

  function startEditingWorkout(workout) {
    setEditingWorkoutId(workout.id);
    setState((prev) => ({
      ...prev,
      activeWorkout: {
        ...workout,
        exercises: workout.exercises.map((exercise) => ({
          ...exercise,
          note: exercise.note || "",
          sets: exercise.sets.map((set) => ({
            weight: set.weight ?? "",
            reps: set.reps ?? "",
          })),
        })),
      },
    }));
    setScreen("workout");
  }

  function openWorkoutDetail(workoutId) {
    setDetailWorkoutId(workoutId);
    setScreen("workoutDetail");
  }

  function openWorkoutDetail(workoutId, returnScreen = "calendar") {
    setDetailWorkoutId(workoutId);
    setDetailReturnScreen(returnScreen);
    setScreen("workoutDetail");
  }

  // ── Calendar day click ──
  function handleCalDayClick(dateStr) {
    const completed = state.workouts.find((w) => w.date === dateStr);
    if (completed) {
      openWorkoutDetail(completed.id, "calendar");
      return;
    }
    setSelectedCalDay(selectedCalDay === dateStr ? null : dateStr);
  }

  // ── Auth ──
  function clearAuthStatus() {
    setMessage("");
    setMessageTone("info");
  }

  function showAuthMessage(text, tone = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  function validateAuthInput() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showAuthMessage("Please enter your email and password before continuing.", "error");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showAuthMessage("Please enter a valid email address.", "error");
      return false;
    }

    return true;
  }

  function enterGuestMode() {
    clearAuthStatus();
    setEmail("");
    setPassword("");
    setAuthMode("signIn");
    startGuestMode();
    setScreen("home");
  }

  function handleAuthError(error, fallbackMessage) {
    const authMessage = error?.message || fallbackMessage;
    if (/anonymous/i.test(authMessage)) {
      showAuthMessage("Anonymous sign-in is disabled for this project. Please create an account with email/password, or use Explore as Guest.", "error");
      return;
    }
    showAuthMessage(authMessage || fallbackMessage, "error");
  }

  async function signUp() {
    if (!supabase) { showAuthMessage("Supabase is not configured yet.", "error"); return; }
    if (!validateAuthInput()) return;

    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() });
      if (error) {
        handleAuthError(error, "Could not create your account.");
        return;
      }
      showAuthMessage("Account created. Check your email inbox for the confirmation link before signing in.", "success");
    } catch (error) {
      handleAuthError(error, "Could not create your account.");
    }
  }
  async function signIn() {
    if (!supabase) { showAuthMessage("Supabase is not configured yet.", "error"); return; }
    if (!validateAuthInput()) return;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
      if (error) {
        handleAuthError(error, "Could not sign in. Check your email and password.");
        return;
      }
      showAuthMessage("Signed in successfully.", "success");
    } catch (error) {
      handleAuthError(error, "Could not sign in. Check your email and password.");
    }
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
            <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={`auth-mode-btn ${authMode === "signIn" ? "active" : ""}`}
                onClick={() => setAuthMode("signIn")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-mode-btn ${authMode === "createAccount" ? "active" : ""}`}
                onClick={() => setAuthMode("createAccount")}
              >
                Create Account
              </button>
            </div>
            <p className="auth-mode-note">
              {authMode === "signIn"
                ? "Use this if you already have an account."
                : "Use this if you are new and want to create a cloud account."}
            </p>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email address" 
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
              onClick={authMode === "signIn" ? signIn : signUp} 
              disabled={!hasSupabase}
            >
              {authMode === "signIn" ? "Sign In" : "Create Account"}
            </button>
            <p className="muted small" style={{ marginTop: 2, textAlign: "center" }}>
              Need help? Enter your email and password, then tap the button above.
            </p>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <p className="muted small" style={{ marginBottom: 12 }}>or</p>
              <button 
                className="cta-btn" 
                style={{ backgroundColor: "#6c757d", color: "white" }}
                onClick={enterGuestMode}
              >
                Explore as Guest
              </button>
              <p className="muted small" style={{ marginTop: 8, fontSize: "12px" }}>You can sign in later to save your progress</p>
            </div>
          </div>
          
          {message && <div className={`banner banner-${messageTone}`} style={{ marginTop: 20 }}>{message}</div>}
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
            {message && <div className={`banner banner-${messageTone}`}>{message}</div>}
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
            {showWorkoutStreak && (
              <div className="section">
                <h2 className="section-title">Current Streak</h2>
                <div className="streak-card">
                  <div className="streak-fire">🔥</div>
                  <div className="streak-copy">
                    <div className="streak-number">{currentStreak}</div>
                    <p className="streak-label">{currentStreak === 1 ? "day streak" : "days streak"}</p>
                    <div className="streak-stats-row">
                      <span className="streak-stat-pill">Best {bestStreak} days</span>
                    </div>
                    <div className="streak-progress-shell" aria-hidden="true">
                      <div className="streak-progress-bar">
                        <div
                          className="streak-progress-fill"
                          style={{ width: `${Math.min(100, Math.max(0, (currentStreak / streakTarget) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <p className="streak-subtitle">
                      {goalJustReached
                        ? `Goal reached: ${streakTarget} days. Current streak reset and best streak preserved.`
                        : currentStreak >= streakTarget
                          ? `Goal reached: ${streakTarget} / ${streakTarget} days!`
                          : `${currentStreak} / ${streakTarget} days toward your goal`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {state.workouts.length > 0 && (() => {
              const last = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
              return (
                <div className="section">
                  <h2 className="section-title">Last Session</h2>
                  <div
                    className="workout-card clickable"
                    onClick={() => openWorkoutDetail(last.id, "home")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openWorkoutDetail(last.id, "home");
                      }
                    }}
                  >
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
              <button className="save-btn" onClick={saveWorkout}>{editingWorkoutId ? "Update Workout" : "Save Workout"}</button>
            </div>
            <div className="workout-header">
              <h1 className="screen-title">{state.activeWorkout.templateName}</h1>
              <span className="workout-date-pill">{state.activeWorkout.date}</span>
            </div>
            {draftSavedAt && (
              <p className="muted small" style={{ marginBottom: 10 }}>
                Draft saved locally at {draftSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.
              </p>
            )}
            <div className="exercises-stack">
              {state.activeWorkout.exercises.map((exercise) => {
                const last = getLastExerciseStats(state.workouts, exercise.name);
                const oneRepMax = calculateExerciseOneRepMax(exercise);
                return (
                  <div key={exercise.id} className="exercise-card">
                    <input className="exercise-name-input" value={exercise.name} onChange={(e) => updateExerciseName(exercise.id, e.target.value)} />
                    {last && (
                      <div className="last-time-hint">Last ({last.date}): {last.sets.map((s) => `${s.weight || "-"}×${s.reps || "-"}`).join("  ")}</div>
                    )}
                    <input
                      className="exercise-note-input"
                      value={exercise.note || ""}
                      onChange={(e) => updateExerciseNote(exercise.id, e.target.value)}
                      placeholder="Add a note"
                    />
                    {oneRepMax && (
                      <div className="one-rep-max-badge" onClick={() => setShowOneRepMaxInfo(true)}>
                        1RM estimate: {Math.round(oneRepMax)} lbs
                        <span className="one-rep-max-help">?</span>
                      </div>
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
          if (!workout) {
            return (
              <div className="screen">
                <div className="screen-header">
                  <button className="back-btn" onClick={() => {
                    setDetailWorkoutId(null);
                    setScreen(detailReturnScreen || "calendar");
                  }}>{Icons.back} {detailReturnScreen === "history" ? "History" : "Calendar"}</button>
                </div>
                <div className="empty-state">
                  <div className="empty-icon">🗑️</div>
                  <p>This workout no longer exists.</p>
                  <p className="muted small">It may have been deleted from history.</p>
                </div>
              </div>
            );
          }
          return (
            <div className="screen">
              <div className="screen-header">
                <button className="back-btn" onClick={() => setScreen(detailReturnScreen || "calendar")}>{Icons.back} {detailReturnScreen === "history" ? "History" : "Calendar"}</button>
              </div>
              <div className="workout-header">
                <h1 className="screen-title">{workout.templateName}</h1>
                <span className="workout-date-pill">{workout.date}</span>
              </div>
              <div className="workout-detail-actions">
                <button className="cta-btn secondary" onClick={() => startEditingWorkout(workout)}>Edit Workout</button>
                <button className="cta-btn secondary" onClick={() => requestWorkoutAction(workout.id, "clear")}>Clear Logs</button>
                <button className="cta-btn danger" onClick={() => requestWorkoutAction(workout.id, "delete")}>Delete Workout</button>
              </div>
              <div className="exercises-stack">
                {workout.exercises.map((exercise) => {
                  const oneRepMax = calculateExerciseOneRepMax(exercise);
                  return (
                    <div key={exercise.id} className="exercise-card">
                      <p className="exercise-detail-name">{exercise.name}</p>
                      {exercise.note && <p className="exercise-note-preview">{exercise.note}</p>}
                      {oneRepMax && (
                        <div className="one-rep-max-badge" onClick={() => setShowOneRepMaxInfo(true)}>
                          1RM estimate: {Math.round(oneRepMax)} lbs
                          <span className="one-rep-max-help">?</span>
                        </div>
                      )}
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
                  );
                })}
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
                  <div key={workout.id} className="workout-card clickable" onClick={() => openWorkoutDetail(workout.id, "history")}>
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
                    <div className="workout-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="mini-action-btn" onClick={(e) => { e.stopPropagation(); requestWorkoutAction(workout.id, "clear"); }}>Clear Logs</button>
                      <button className="mini-action-btn danger" onClick={(e) => { e.stopPropagation(); requestWorkoutAction(workout.id, "delete"); }}>Delete</button>
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
                  <div className="banner banner-info" style={{ marginBottom: "16px" }}>
                    👤 You're exploring as a guest. Sign in to save your progress to the cloud.
                  </div>
                )}
                {!hasSupabase && <div className="banner banner-error">Cloud login disabled — Supabase keys not added yet.</div>}
                <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
                  <button
                    type="button"
                    className={`auth-mode-btn ${authMode === "signIn" ? "active" : ""}`}
                    onClick={() => setAuthMode("signIn")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`auth-mode-btn ${authMode === "createAccount" ? "active" : ""}`}
                    onClick={() => setAuthMode("createAccount")}
                  >
                    Create Account
                  </button>
                </div>
                <p className="auth-mode-note">
                  {authMode === "signIn" ? "Use this if you already have an account." : "Use this if you are new and want to create a cloud account."}
                </p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" disabled={!hasSupabase} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" disabled={!hasSupabase} />
                <button className="cta-btn accent" onClick={authMode === "signIn" ? signIn : signUp} disabled={!hasSupabase}>
                  {authMode === "signIn" ? "Sign In" : "Create Account"}
                </button>
                <p className="muted small" style={{ textAlign: "center" }}>Need help? Enter your email and password, then tap the button above.</p>
              </div>
            ) : (
              <div className="auth-form">
                <div className="banner">Signed in as {session.user.email}</div>
                {syncing && <p className="muted small">Syncing...</p>}
                <div className="appearance-panel streak-panel">
                  <div className="appearance-panel-copy">
                    <p className="appearance-panel-title">Streak Tracking</p>
                    <p className="appearance-panel-subtitle">Turn on streak tracking and set your daily goal.</p>
                  </div>
                  <div className="streak-settings-stack">
                    <button
                      className={`theme-toggle ${streakSettings.enabled ? "active" : ""}`}
                      onClick={toggleStreakTracking}
                      aria-label={streakSettings.enabled ? "Disable streak tracking" : "Enable streak tracking"}
                    >
                      <span className="theme-toggle-track">
                        <span className="theme-toggle-thumb" />
                      </span>
                      <span className="theme-toggle-copy">{streakSettings.enabled ? "Streak on" : "Streak off"}</span>
                    </button>
                    <label className="streak-target-field">
                      <span className="streak-target-label">Target days</span>
                      <input
                        className="streak-target-input"
                        type="number"
                        min="1"
                        step="1"
                        value={streakSettings.target}
                        onChange={(e) => updateStreakTarget(e.target.value)}
                        disabled={!streakSettings.enabled}
                      />
                    </label>
                  </div>
                </div>
                <div className="appearance-panel">
                  <div className="appearance-panel-copy">
                    <p className="appearance-panel-title">Appearance</p>
                    <p className="appearance-panel-subtitle">Choose your theme: Light or Dark</p>
                  </div>
                  <button
                    className={`theme-toggle ${theme === "light" ? "active" : ""}`}
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    <span className="theme-toggle-track">
                      <span className="theme-toggle-thumb" />
                    </span>
                    <span className="theme-toggle-copy">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
                  </button>
                </div>
                <button className="cta-btn secondary" onClick={signOut}>Sign Out</button>
              </div>
            )}
            {message && <div className={`banner banner-${messageTone}`} style={{ marginTop: 12 }}>{message}</div>}
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      {showNav && (
        <div className="mobile-bottom-shell">
          <nav className="bottom-nav">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className={`nav-btn ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.title}
        description={deleteModalState.description}
        confirmLabel={deleteModalState.confirmLabel}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteModalConfirm}
      />

      {/* ── 1RM INFO MODAL ── */}
      <OneRepMaxInfoModal
        isOpen={showOneRepMaxInfo}
        onClose={() => setShowOneRepMaxInfo(false)}
      />

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