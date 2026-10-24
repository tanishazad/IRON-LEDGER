import { useEffect, useState } from 'react';
import { loadExerciseNames } from '../api/exerciseApi';

/** Exercise-name suggestions for the routine form's <datalist> (carried over from Evaluation 1). */
export function useExerciseNames() {
  const [names, setNames] = useState([]);
  useEffect(() => {
    let cancelled = false;
    loadExerciseNames()
      .then((n) => !cancelled && setNames(n))
      .catch(() => {
        /* suggestions are optional — the field still works without them */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return names;
}
