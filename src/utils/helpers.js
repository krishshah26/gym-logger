import { DEFAULT_TEMPLATES, STORAGE_KEY, SCHEDULE_KEY } from "./constants";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const emptySet = () => ({ weight: "", reps: "" });

export function safeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getDefaultState() {
  return { templates: DEFAULT_TEMPLATES, workouts: [], activeWorkout: null };
}

export function fmtDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Mon = 0
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function createWorkoutFromTemplate(template) {
  return {
    id: safeId(),
    date: todayKey(),
    templateName: template.name,
    notes: "",
    exercises: template.exercises.map((name) => ({
      id: safeId(),
      name,
      sets: [emptySet(), emptySet(), emptySet()],
    })),
  };
}

export function loadStoredLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      activeWorkout: parsed.activeWorkout ?? null,
    };
  } catch {
    return null;
  }
}

export function loadLocalState() {
  const stored = loadStoredLocalState();
  if (!stored) return getDefaultState();
  return {
    templates: stored.templates.length ? stored.templates : DEFAULT_TEMPLATES,
    workouts: stored.workouts,
    activeWorkout: stored.activeWorkout,
  };
}

export function hasLocalDataToMigrate(storedState) {
  if (!storedState) return false;
  if (storedState.workouts.length > 0) return true;
  if (storedState.templates.length !== DEFAULT_TEMPLATES.length) return true;
  for (let i = 0; i < DEFAULT_TEMPLATES.length; i++) {
    const local = storedState.templates[i];
    const defaultTemplate = DEFAULT_TEMPLATES[i];
    if (!local || local.name !== defaultTemplate.name) return true;
    if (local.exercises.length !== defaultTemplate.exercises.length) return true;
    for (let j = 0; j < local.exercises.length; j++) {
      if (local.exercises[j] !== defaultTemplate.exercises[j]) return true;
    }
  }
  return false;
}

export function saveLocalState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadSchedule() {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function mapTemplatesFromRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
  }));
}

export function mapWorkoutsFromRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    templateName: row.template_name,
    notes: row.notes || "",
    exercises: (Array.isArray(row.exercises) ? row.exercises : []).map((ex) => ({
      id: ex.id || safeId(),
      name: ex.name,
      sets:
        Array.isArray(ex.sets) && ex.sets.length
          ? ex.sets
          : [emptySet(), emptySet(), emptySet()],
    })),
  }));
}

export function getLastExerciseStats(workouts, exerciseName) {
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const workout of sorted) {
    const ex = workout.exercises.find(
      (e) => e.name.toLowerCase() === exerciseName.toLowerCase()
    );
    if (ex) {
      const sets = ex.sets.filter((s) => s.weight || s.reps);
      if (sets.length) return { date: workout.date, sets };
    }
  }
  return null;
}

// ─── Data Migration ───
export async function migrateLocalDataToCloud(supabase, session, localState, cloudTemplates, cloudWorkouts) {
  if (!supabase || !session?.user) return { templatesCount: 0, workoutsCount: 0 };

  let templatesCount = 0;
  let workoutsCount = 0;

  // Migrate templates
  if (localState.templates && localState.templates.length) {
    // Create a set of existing cloud templates by content hash
    const cloudTemplateHashes = new Set(
      cloudTemplates.map((t) => `${t.name}|${t.exercises.join(",")}`)
    );

    for (const template of localState.templates) {
      // Skip default templates already in cloud
      const hash = `${template.name}|${template.exercises.join(",")}`;
      if (!cloudTemplateHashes.has(hash)) {
        const { error } = await supabase.from("workout_templates").insert({
          id: template.id,
          user_id: session.user.id,
          name: template.name,
          exercises: template.exercises,
        });
        if (!error) templatesCount++;
      }
    }
  }

  // Migrate workouts
  if (localState.workouts && localState.workouts.length) {
    // Create a set of existing cloud workouts by content hash
    const cloudWorkoutHashes = new Set(
      cloudWorkouts.map((w) => `${w.date}|${w.templateName}|${w.exercises.map((e) => e.name).join(",")}`)
    );

    for (const workout of localState.workouts) {
      const hash = `${workout.date}|${workout.templateName}|${workout.exercises.map((e) => e.name).join(",")}`;
      if (!cloudWorkoutHashes.has(hash)) {
        const { error } = await supabase.from("workout_sessions").insert({
          id: workout.id,
          user_id: session.user.id,
          date: workout.date,
          template_name: workout.templateName,
          notes: workout.notes,
          exercises: workout.exercises,
        });
        if (!error) workoutsCount++;
      }
    }
  }

  return { templatesCount, workoutsCount };
}
