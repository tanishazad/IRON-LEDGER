import { useEffect, useRef } from 'react';

/**
 * Infinite scroll with IntersectionObserver.
 * Attach the returned ref to an invisible "sentinel" element placed after the
 * list; when it scrolls into view (within `rootMargin`), onLoadMore() runs.
 *
 * `enabled` should be false while a request is in flight or when there is
 * nothing more to load. Because the observer is re-created whenever `enabled`
 * flips back to true, it fires again immediately if the sentinel is still on
 * screen — so tall screens keep loading until the page is filled.
 */
export function useInfiniteScroll({ enabled, onLoadMore, rootMargin = '240px' }) {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore; // always call the latest callback
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!enabled || !el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
