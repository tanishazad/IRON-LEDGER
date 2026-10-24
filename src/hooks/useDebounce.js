import { useEffect, useState } from 'react';

/**
 * Returns `value`, but only after it has stopped changing for `delay` ms.
 * Typing "bench" fires 5 keystrokes yet only ONE value update (and one API call).
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // each new keystroke cancels the previous timer
  }, [value, delay]);
  return debounced;
}
