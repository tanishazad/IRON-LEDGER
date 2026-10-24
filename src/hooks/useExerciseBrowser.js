import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { fetchExercises, getErrorMessage } from '../api/exerciseApi';

/**
 * useExerciseBrowser — all the data-fetching logic for the Explore page.
 *
 *   mode 'pages'    → each page REPLACES the list  (numbered pagination)
 *   mode 'infinite' → each page is APPENDED        (infinite scroll)
 *
 * Handles: loading / loadingMore / error / success states, retry, cancelling
 * out-of-date requests (AbortController), and resetting to page 1 when the
 * search / filter / mode changes.
 */
export function useExerciseBrowser({ term, category, mode, source, pageSize = 12 }) {
  const filterKey = `${source}|${term}|${category}|${mode}`;

  // The page number is stored together with the filters it belongs to. When the
  // filters change, `page` falls back to 1 immediately — without a wasted fetch
  // for "old page number + new filters".
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | loadingMore | success | error
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const isSearch = source === 'api' && term.trim().length >= 2;
  const append = mode === 'infinite' && page > 1;

  useEffect(() => {
    const controller = new AbortController();
    setStatus(append ? 'loadingMore' : 'loading');
    setError('');

    fetchExercises({ source, term, category, page, pageSize, signal: controller.signal })
      .then((res) => {
        setCount(res.count);
        setItems((prev) => {
          if (!append) return res.items;
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...res.items.filter((i) => !seen.has(i.id))];
        });
        setStatus('success');
      })
      .catch((err) => {
        if (axios.isCancel(err)) return; // a newer request replaced this one — ignore
        setError(getErrorMessage(err));
        // A failed fresh query must not keep showing the PREVIOUS query's results as if they were current.
        // (A failed "load more" keeps what is already on screen and shows an inline retry instead.)
        if (!append) {
          setItems([]);
          setCount(0);
        }
        setStatus('error');
      });

    return () => controller.abort(); // cleanup: cancel the in-flight request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page, reloadKey]);

  const setPage = useCallback((n) => setPageState({ key: filterKey, page: n }), [filterKey]);
  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const totalPages = isSearch ? 1 : Math.max(1, Math.ceil(count / pageSize));
  const hasMore = !isSearch && page < totalPages;
  const loadMore = useCallback(() => setPage(page + 1), [setPage, page]);

  return { items, count, status, error, page, totalPages, hasMore, isSearch, setPage, loadMore, retry };
}
