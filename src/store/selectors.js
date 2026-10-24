import { createSelector } from '@reduxjs/toolkit';
import { parseISODate, toISODate } from '../utils/helpers';

export const selectRoutines = (s) => s.workouts.routines;
export const selectLogs = (s) => s.workouts.logs;
export const selectWorkoutStatus = (s) => s.workouts.status;
export const selectWorkoutError = (s) => s.workouts.error;
export const selectSaving = (s) => s.workouts.saving > 0;

/** Latest logged date for each routine id → { [routineId]: 'YYYY-MM-DD' } */
export const selectLastLogged = createSelector([selectLogs], (logs) => {
  const map = {};
  logs.forEach((l) => {
    if (!map[l.routineId] || l.date > map[l.routineId]) map[l.routineId] = l.date;
  });
  return map;
});

/** Every exercise name that appears in at least one log (for the Progress dropdown). */
export const selectLoggedExerciseNames = createSelector([selectLogs], (logs) => {
  const names = new Set();
  logs.forEach((l) => l.entries.forEach((e) => names.add(e.exerciseName)));
  return [...names].sort((a, b) => a.localeCompare(b));
});

export const selectStats = createSelector([selectRoutines, selectLogs], (routines, logs) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // streak: consecutive days (ending today or yesterday) with a logged entry
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  let cursor = today;
  for (const dateStr of dates) {
    const d = parseISODate(dateStr);
    const diff = Math.round((cursor - d) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = d;
    } else break;
  }

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6); // today + previous 6 days
  const week = logs.filter((l) => parseISODate(l.date) >= weekStart).length;

  return { total: logs.length, routines: routines.length, streak, week };
});

/** Everything the barbell on the dashboard needs. */
export const selectToday = createSelector([selectRoutines, selectLogs], (routines, logs) => {
  const todayStr = toISODate();
  const todays = logs.filter((l) => l.date === todayStr);
  const setsDone = todays.reduce(
    (sum, l) => sum + l.entries.reduce((a, e) => a + e.sets.length, 0),
    0,
  );
  let target = 0;
  todays.forEach((l) => {
    const r = routines.find((x) => x.id === l.routineId);
    if (r) target += r.exercises.reduce((a, e) => a + Number(e.targetSets || 0), 0);
  });
  if (!target) target = Math.max(setsDone, 12);
  return { hasLog: todays.length > 0, setsDone, target, names: todays.map((l) => l.routineName) };
});
