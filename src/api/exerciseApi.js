/**
 * exerciseApi — consuming a real third-party REST API with axios.
 *
 * Source: wger Workout Manager (https://wger.de/api/v2/) — a free, open,
 * key-less API for exercise data.
 *
 * What this file demonstrates:
 *   - a configured axios instance (baseURL, timeout)
 *   - query params for pagination (limit/offset) and filtering (category)
 *   - AbortController signals so stale requests can be cancelled
 *   - retry with exponential back-off for network errors / 5xx / 429
 *   - turning low-level axios errors into messages a user can act on
 *   - a local-JSON fallback source (the Evaluation 1 exercise library)
 */
import axios from 'axios';
import { htmlToText, sleep } from '../utils/helpers';

const ORIGIN = 'https://wger.de';
const ENGLISH = 2; // wger language id for English

const client = axios.create({
  baseURL: `${ORIGIN}/api/v2`,
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

export const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: '10', label: 'Abs' },
  { value: '8', label: 'Arms' },
  { value: '12', label: 'Back' },
  { value: '14', label: 'Calves' },
  { value: '11', label: 'Chest' },
  { value: '9', label: 'Legs' },
  { value: '13', label: 'Shoulders' },
  { value: '15', label: 'Cardio' },
];

/* ---------- retry + errors ---------- */

async function abortableSleep(ms, signal) {
  await sleep(ms);
  if (signal?.aborted) throw new axios.CanceledError('Request cancelled');
}

/**
 * Re-runs `fn` when the failure looks temporary (no response, 429, 5xx).
 * Client errors (4xx) and cancellations are never retried.
 * Delay doubles each attempt: 600ms, 1200ms, ...
 */
export async function withRetry(fn, { retries = 2, baseDelay = 600, signal } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (axios.isCancel(err) || signal?.aborted) throw err;
      const status = err.response?.status;
      const temporary = !err.response || status === 429 || status >= 500;
      if (!temporary || attempt >= retries) throw err;
      await abortableSleep(baseDelay * 2 ** attempt, signal);
    }
  }
}

export function getErrorMessage(err) {
  if (err.code === 'ECONNABORTED') return 'The exercise service took too long to respond.';
  if (!err.response) return "Can't reach the exercise service. Check your internet connection.";
  const { status } = err.response;
  if (status === 429) return 'Too many requests — wait a moment and try again.';
  if (status === 404) return 'That exercise data could not be found.';
  if (status >= 500) return 'The exercise service is having trouble right now.';
  return `Request failed (HTTP ${status}).`;
}

/* ---------- normalising API payloads into one shape ---------- */

const absoluteUrl = (u) => (!u ? null : u.startsWith('http') ? u : `${ORIGIN}${u}`);

function normalizeInfo(r) {
  // exerciseinfo returns an array of translations; pick English, else the first
  const t = Array.isArray(r.translations)
    ? r.translations.find((x) => x.language === ENGLISH) || r.translations[0]
    : null;
  const muscles = (r.muscles || []).map((m) => m.name_en || m.name).filter(Boolean);
  return {
    id: String(r.id),
    name: t?.name || r.name || 'Unnamed exercise',
    description: htmlToText(t?.description || r.description || ''),
    category: r.category?.name || '',
    muscles,
    equipment: (r.equipment || []).map((e) => e.name),
    image: absoluteUrl(r.images?.[0]?.image),
  };
}

function normalizeSuggestion(s) {
  const d = s.data || {};
  return {
    id: String(d.base_id ?? d.id ?? s.value),
    name: d.name || s.value,
    description: '',
    category: d.category || '',
    muscles: [],
    equipment: [],
    image: absoluteUrl(d.image_thumbnail || d.image),
  };
}

/* ---------- API calls ---------- */

/** Server-side pagination: GET /exerciseinfo/?limit=&offset=&category= */
async function browseApi({ category, page, pageSize, signal }) {
  const params = {
    language: ENGLISH,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
  if (category) params.category = category;
  const { data } = await withRetry(() => client.get('/exerciseinfo/', { params, signal }), {
    signal,
  });
  return { items: (data.results || []).map(normalizeInfo), count: data.count ?? 0 };
}

/** Name search: GET /exercise/search/?term= (returns one page of suggestions) */
async function searchApi({ term, category, signal }) {
  const { data } = await withRetry(
    () => client.get('/exercise/search/', { params: { term, language: 'en' }, signal }),
    { signal },
  );
  let items = (data.suggestions || []).map(normalizeSuggestion);
  if (category) {
    const label = CATEGORIES.find((c) => c.value === category)?.label;
    items = items.filter((i) => i.category.toLowerCase() === label.toLowerCase());
  }
  return { items, count: items.length };
}

/* ---------- offline fallback (the Evaluation 1 JSON library) ---------- */

let localCache = null;
const LOCAL_CATEGORY = { Core: 'Abs' };

async function loadLocal(signal) {
  if (!localCache) {
    const { data } = await axios.get(`${import.meta.env.BASE_URL}data/exercises.json`, { signal });
    localCache = data.map((ex, i) => ({
      id: `local-${i}`,
      name: ex.name,
      description: '',
      category: LOCAL_CATEGORY[ex.muscle] || ex.muscle,
      muscles: [ex.muscle],
      equipment: [],
      image: null, // card falls back to a bundled illustration
    }));
  }
  return localCache;
}

async function browseLocal({ term, category, page, pageSize, signal }) {
  const all = await loadLocal(signal);
  const label = CATEGORIES.find((c) => c.value === category)?.label;
  const t = term.trim().toLowerCase();
  const filtered = all.filter(
    (ex) =>
      (!category || ex.category.toLowerCase() === label.toLowerCase()) &&
      (!t || ex.name.toLowerCase().includes(t)),
  );
  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), count: filtered.length };
}

/**
 * One entry point for the UI.
 *   source 'api'   → wger (search endpoint if there is a search term, otherwise paginated browse)
 *   source 'local' → bundled JSON, filtered + paginated in the browser
 */
export function fetchExercises({ source, term, category, page, pageSize, signal }) {
  if (source === 'local') return browseLocal({ term, category, page, pageSize, signal });
  if (term.trim().length >= 2) return searchApi({ term: term.trim(), category, signal });
  return browseApi({ category, page, pageSize, signal });
}

/** Names for the <datalist> autocomplete in the routine form. */
export async function loadExerciseNames() {
  const all = await loadLocal();
  return all.map((e) => e.name);
}
