const BASE = import.meta.env.BASE_URL;
const KNOWN = ['abs', 'arms', 'back', 'calves', 'chest', 'legs', 'shoulders', 'cardio'];
const ALIAS = {
  core: 'abs', abdominals: 'abs', biceps: 'arms', triceps: 'arms', forearms: 'arms', brachialis: 'arms',
  lats: 'back', traps: 'back', trapezius: 'back', 'latissimus dorsi': 'back', 'lower back': 'back',
  pectoralis: 'chest', pecs: 'chest', quadriceps: 'legs', hamstrings: 'legs', glutes: 'legs', gluteus: 'legs',
  deltoids: 'shoulders', delts: 'shoulders', gastrocnemius: 'calves', soleus: 'calves',
};

function pick(word) {
  const w = (word || '').toLowerCase().trim();
  if (KNOWN.includes(w)) return w;
  if (ALIAS[w]) return ALIAS[w];
  const hit = Object.keys(ALIAS).find((k) => w.includes(k));
  return hit ? ALIAS[hit] : KNOWN.find((k) => w.includes(k)) || null;
}

/** Bundled illustration that always exists: picked from category, then muscles, else a barbell. */
export function fallbackImage(exercise) {
  const key = pick(exercise.category) || exercise.muscles?.map(pick).find(Boolean) || 'default';
  return `${BASE}images/exercises/${key}.svg`;
}
