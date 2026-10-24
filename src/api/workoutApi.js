/**
 * workoutApi — the "backend" for routines and logs.
 *
 * Iron Ledger has no server, so this module is a thin async wrapper around
 * localStorage. Every method returns a Promise (with a short artificial delay)
 * exactly like a real REST client would, which lets the Redux thunks, loading
 * spinners and error states be written the way they would be for a real API.
 * Swapping this file for axios calls later would not touch any component.
 *
 * The storage key is unchanged from Evaluation 1, so existing data carries over.
 */
import { sleep, uid } from '../utils/helpers';

const STORE_KEY = 'ironledger_data_v1';
const LATENCY_MS = 250;

function read() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { routines: [], logs: [] };
    const data = JSON.parse(raw);
    return { routines: data.routines || [], logs: data.logs || [] };
  } catch (err) {
    console.error('Load failed, starting fresh.', err);
    return { routines: [], logs: [] };
  }
}

function write(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Save failed', err);
    throw new Error('Could not save — browser storage is unavailable');
  }
}

export const workoutApi = {
  async fetchAll() {
    await sleep(LATENCY_MS);
    return read();
  },

  async createRoutine({ name, exercises }) {
    await sleep(LATENCY_MS);
    const data = read();
    const routine = { id: uid(), name: name.trim(), exercises, createdAt: Date.now() };
    data.routines.push(routine);
    write(data);
    return routine;
  },

  async updateRoutine(id, changes) {
    await sleep(LATENCY_MS);
    const data = read();
    const idx = data.routines.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('That routine no longer exists');
    const updated = { ...data.routines[idx], ...changes };
    if (changes.name) updated.name = changes.name.trim();
    data.routines[idx] = updated;
    write(data);
    return updated;
  },

  async deleteRoutine(id) {
    await sleep(LATENCY_MS);
    const data = read();
    data.routines = data.routines.filter((r) => r.id !== id);
    write(data);
    return id;
  },

  async saveLog({ date, routineId, routineName, entries }) {
    await sleep(LATENCY_MS);
    const data = read();
    // one log per routine per day — saving again replaces it (same as Evaluation 1)
    data.logs = data.logs.filter((l) => !(l.date === date && l.routineId === routineId));
    const log = { id: uid(), date, routineId, routineName, entries };
    data.logs.push(log);
    write(data);
    return log;
  },
};
