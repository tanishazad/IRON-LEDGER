/**
 * Redux Toolkit slice for routines + workout logs.
 *
 * Why Redux here (and Context elsewhere)?
 *   - routines/logs are read by many distant components (dashboard, log form,
 *     progress, explore) and are changed by async operations that need
 *     loading / error states → a good fit for createAsyncThunk.
 *   - auth and toasts are tiny, rarely-changing app-wide values → Context.
 */
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { workoutApi } from '../api/workoutApi';

/** createAsyncThunk wrapper: failures become `rejectWithValue(message)` so reducers/components get a clean string. */
const thunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (err) {
      return rejectWithValue(err.message || 'Something went wrong');
    }
  });

export const fetchWorkouts = thunk('workouts/fetch', () => workoutApi.fetchAll());
export const createRoutine = thunk('workouts/createRoutine', (input) =>
  workoutApi.createRoutine(input),
);
export const updateRoutine = thunk('workouts/updateRoutine', ({ id, changes }) =>
  workoutApi.updateRoutine(id, changes),
);
export const deleteRoutine = thunk('workouts/deleteRoutine', (id) => workoutApi.deleteRoutine(id));
export const saveLog = thunk('workouts/saveLog', (log) => workoutApi.saveLog(log));

const mutations = [createRoutine, updateRoutine, deleteRoutine, saveLog];

const slice = createSlice({
  name: 'workouts',
  initialState: {
    routines: [],
    logs: [],
    status: 'idle', // idle | loading | succeeded | failed   (the initial fetch)
    error: null,
    saving: 0, // how many create/update/delete/save calls are in flight
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkouts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.routines = payload.routines;
        state.logs = payload.logs;
      })
      .addCase(fetchWorkouts.rejected, (state, { payload, error }) => {
        state.status = 'failed';
        state.error = payload || error.message;
      })
      .addCase(createRoutine.fulfilled, (state, { payload }) => {
        state.routines.push(payload);
      })
      .addCase(updateRoutine.fulfilled, (state, { payload }) => {
        const i = state.routines.findIndex((r) => r.id === payload.id);
        if (i !== -1) state.routines[i] = payload;
      })
      .addCase(deleteRoutine.fulfilled, (state, { payload: id }) => {
        state.routines = state.routines.filter((r) => r.id !== id);
      })
      .addCase(saveLog.fulfilled, (state, { payload }) => {
        state.logs = state.logs.filter(
          (l) => !(l.date === payload.date && l.routineId === payload.routineId),
        );
        state.logs.push(payload);
      })
      .addMatcher(isAnyOf(...mutations.map((t) => t.pending)), (state) => {
        state.saving += 1;
      })
      .addMatcher(
        isAnyOf(...mutations.flatMap((t) => [t.fulfilled, t.rejected])),
        (state) => {
          state.saving = Math.max(0, state.saving - 1);
        },
      );
  },
});

export default slice.reducer;
