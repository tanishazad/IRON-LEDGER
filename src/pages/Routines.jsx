import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectLastLogged, selectRoutines, selectSaving } from '../store/selectors';
import { deleteRoutine } from '../store/workoutsSlice';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate } from '../utils/helpers';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/Feedback';
import RoutineFormModal from '../components/routines/RoutineFormModal';

const FILTERS = [
  { value: 'all', label: 'All routines' },
  { value: 'logged', label: 'Logged before' },
  { value: 'never', label: 'Never logged' },
];
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'count', label: 'Most exercises' },
];

/**
 * Routines list — the C, R, U and D of CRUD:
 *   Create: "New routine" modal      Read: this list + detail page
 *   Update: "Edit" modal             Delete: confirm dialog
 * Search, filter and sort all run client-side on the Redux data via useMemo.
 */
export default function Routines() {
  useDocumentTitle('Routines');
  const dispatch = useDispatch();
  const toast = useToast();
  const routines = useSelector(selectRoutines);
  const lastLogged = useSelector(selectLastLogged);
  const saving = useSelector(selectSaving);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [formState, setFormState] = useState({ open: false, routine: null });
  const [toDelete, setToDelete] = useState(null);

  const debouncedSearch = useDebounce(search, 250);

  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    // keep the original index so "newest/oldest" works even for routines without createdAt
    let list = routines.map((r, index) => ({ r, index }));
    if (q)
      list = list.filter(
        ({ r }) =>
          r.name.toLowerCase().includes(q) || r.exercises.some((e) => e.name.toLowerCase().includes(q)),
      );
    if (filter === 'logged') list = list.filter(({ r }) => lastLogged[r.id]);
    if (filter === 'never') list = list.filter(({ r }) => !lastLogged[r.id]);
    const sorters = {
      newest: (a, b) => b.index - a.index,
      oldest: (a, b) => a.index - b.index,
      name: (a, b) => a.r.name.localeCompare(b.r.name),
      count: (a, b) => b.r.exercises.length - a.r.exercises.length,
    };
    return list.sort(sorters[sort]).map(({ r }) => r);
  }, [routines, debouncedSearch, filter, sort, lastLogged]);

  const confirmDelete = async () => {
    try {
      await dispatch(deleteRoutine(toDelete.id)).unwrap();
      toast.success(`Deleted "${toDelete.name}"`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not delete the routine');
    }
    setToDelete(null);
  };

  const hasFilters = search || filter !== 'all';

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Routines</h1>
          <div className="sub">Build the sessions you'll come back to — name it, load it with exercises, save it.</div>
        </div>
        <button type="button" className="btn" onClick={() => setFormState({ open: true, routine: null })}>
          + New Routine
        </button>
      </div>

      {routines.length > 0 && (
        <div className="toolbar">
          <InputField
            label="Search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Routine or exercise name…"
            className="grow"
          />
          <Dropdown label="Show" options={FILTERS} value={filter} onChange={setFilter} />
          <Dropdown label="Sort by" options={SORTS} value={sort} onChange={setSort} />
        </div>
      )}

      {routines.length === 0 ? (
        <EmptyState title="No routines yet">
          Create one to start logging workouts.
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn" onClick={() => setFormState({ open: true, routine: null })}>
              + New Routine
            </button>
          </div>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState title="No matches">
          Nothing fits those filters.{' '}
          {hasFilters && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
            >
              Clear filters
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="result-count" aria-live="polite">
            Showing {visible.length} of {routines.length}
          </div>
          <div className="routine-grid">
            {visible.map((r) => (
              <article className="card routine-card" key={r.id}>
                <h2>
                  <Link to={`/routines/${r.id}`}>{r.name}</Link>
                </h2>
                <div className="meta">
                  {r.exercises.length} exercise{r.exercises.length === 1 ? '' : 's'} ·{' '}
                  {lastLogged[r.id] ? `last logged ${formatDate(lastLogged[r.id])}` : 'never logged'}
                </div>
                <div className="chips spaced">
                  {r.exercises.slice(0, 4).map((e) => (
                    <span className="chip" key={e.id}>
                      {e.name}
                    </span>
                  ))}
                  {r.exercises.length > 4 && <span className="chip outline">+{r.exercises.length - 4}</span>}
                </div>
                <div className="card-actions">
                  <Link className="btn small" to={`/log?routine=${r.id}`}>
                    Log
                  </Link>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => setFormState({ open: true, routine: r })}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn danger" onClick={() => setToDelete(r)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <RoutineFormModal
        open={formState.open}
        routine={formState.routine}
        onClose={() => setFormState((s) => ({ ...s, open: false }))}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete routine?"
        message={`"${toDelete?.name}" will be removed. Your logged workouts and progress history are kept.`}
        confirmLabel="Delete"
        busy={saving}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
