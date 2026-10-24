import { useMemo, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useExerciseBrowser } from '../hooks/useExerciseBrowser';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CATEGORIES } from '../api/exerciseApi';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import Pagination from '../components/ui/Pagination';
import { ErrorState, SkeletonGrid, Spinner, EmptyState } from '../components/ui/Feedback';
import ExerciseCard from '../components/explore/ExerciseCard';
import ExerciseDetailModal from '../components/explore/ExerciseDetailModal';

const VIEW_MODES = [
  { value: 'pages', label: 'Numbered pages' },
  { value: 'infinite', label: 'Infinite scroll' },
];
const SORTS = [
  { value: 'default', label: 'API order' },
  { value: 'az', label: 'Name A–Z' },
  { value: 'za', label: 'Name Z–A' },
];

/**
 * Explore — a third-party REST API mini-project (wger exercise database).
 *   debounced search · category filter · client-side sort
 *   numbered pagination OR infinite scroll (your choice is remembered)
 *   loading skeletons · error + retry · offline fallback · detail modal · add-to-routine
 */
export default function Explore() {
  useDocumentTitle('Explore exercises');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('default');
  const [mode, setMode] = useLocalStorage('ironledger_explore_mode', 'pages');
  const [source, setSource] = useState('api'); // 'api' | 'local' (offline fallback)
  const [selected, setSelected] = useState(null);

  // Only hit the API once the user has stopped typing for 400ms
  const term = useDebounce(search, 400);
  const typing = search !== term;

  const browser = useExerciseBrowser({ term, category, mode, source });
  const { items, status, error, page, totalPages, hasMore, isSearch, count } = browser;

  const sorted = useMemo(() => {
    if (sort === 'default') return items;
    const copy = [...items].sort((a, b) => a.name.localeCompare(b.name));
    return sort === 'za' ? copy.reverse() : copy;
  }, [items, sort]);

  const sentinelRef = useInfiniteScroll({
    enabled: mode === 'infinite' && hasMore && status === 'success',
    onLoadMore: browser.loadMore,
  });

  const firstLoad = status === 'loading';
  const noResults = status === 'success' && sorted.length === 0;
  const hasFilters = search || category;

  return (
    <section>
      <h1>Explore</h1>
      <div className="sub">
        Browse the open wger exercise database and drop moves straight into your routines.
      </div>

      {source === 'local' && (
        <div className="notice" role="status">
          Showing the built-in offline library.{' '}
          <button type="button" className="link-btn" onClick={() => setSource('api')}>
            Switch back to the live database
          </button>
        </div>
      )}

      <div className="toolbar">
        <InputField
          label="Search exercises"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. bench, squat, curl…"
          hint={isSearch ? undefined : 'Type 2+ letters to search by name'}
          className="grow"
        />
        <Dropdown label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
        <Dropdown label="Sort" options={SORTS} value={sort} onChange={setSort} />
        <Dropdown label="View" options={VIEW_MODES} value={mode} onChange={setMode} />
      </div>

      <div className="result-count" aria-live="polite">
        {status === 'error' && items.length === 0
          ? ''
          : firstLoad || typing
            ? 'Searching…'
            : isSearch
              ? `${count} result${count === 1 ? '' : 's'} for “${term.trim()}”`
              : `${count} exercises`}
      </div>

      {status === 'error' && items.length === 0 ? (
        <ErrorState title="Couldn't load exercises" message={error} onRetry={browser.retry}>
          {source === 'api' && (
            <button type="button" className="btn ghost" onClick={() => setSource('local')}>
              Use offline library
            </button>
          )}
        </ErrorState>
      ) : firstLoad && items.length === 0 ? (
        <SkeletonGrid />
      ) : noResults ? (
        <EmptyState title="No exercises found">
          Try a different search or category.{' '}
          {hasFilters && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setSearch('');
                setCategory('');
              }}
            >
              Clear filters
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className={`ex-grid ${firstLoad ? 'dim' : ''}`}>
            {sorted.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onOpen={setSelected} />
            ))}
          </div>

          {mode === 'infinite' ? (
            <>
              <div ref={sentinelRef} className="sentinel" aria-hidden="true" />
              {status === 'loadingMore' && <Spinner label="Loading more…" inline />}
              {status === 'error' && (
                <ErrorState title="Couldn't load more" message={error} onRetry={browser.retry} />
              )}
              {!hasMore && status === 'success' && items.length > 0 && !isSearch && (
                <p className="end-note">You've reached the end — {count} exercises.</p>
              )}
            </>
          ) : (
            <>
              {status === 'error' && (
                <ErrorState title="Couldn't load this page" message={error} onRetry={browser.retry} />
              )}
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  browser.setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={firstLoad}
              />
            </>
          )}
        </>
      )}

      <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
