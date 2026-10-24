import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLogs, selectRoutines } from '../store/selectors';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate } from '../utils/helpers';
import Tabs from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/Feedback';
import RoutineFormModal from '../components/routines/RoutineFormModal';

/** Nested + dynamic route: /routines/:routineId */
export default function RoutineDetail() {
  const { routineId } = useParams();
  const routines = useSelector(selectRoutines);
  const logs = useSelector(selectLogs);
  const [editing, setEditing] = useState(false);

  const routine = routines.find((r) => r.id === routineId);
  useDocumentTitle(routine ? routine.name : 'Routine not found');

  const history = useMemo(
    () => logs.filter((l) => l.routineId === routineId).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, routineId],
  );

  if (!routine) {
    return (
      <section>
        <EmptyState title="Routine not found">
          It may have been deleted. <Link to="/routines">Back to routines</Link>
        </EmptyState>
      </section>
    );
  }

  const exercisesTab = (
    <div>
      {routine.exercises.map((e) => (
        <div className="exercise-row" key={e.id}>
          <div className="name">{e.name}</div>
          <div className="meta">
            {e.targetSets} × {e.targetReps}
          </div>
        </div>
      ))}
    </div>
  );

  const historyTab =
    history.length === 0 ? (
      <EmptyState title="Not logged yet">
        <Link to={`/log?routine=${routine.id}`}>Log your first session</Link>
      </EmptyState>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Exercises</th>
            <th>Sets</th>
          </tr>
        </thead>
        <tbody>
          {history.map((l) => (
            <tr key={l.id}>
              <td className="name-col">{formatDate(l.date)}</td>
              <td>{l.entries.length}</td>
              <td>{l.entries.reduce((a, e) => a + e.sets.length, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

  return (
    <section>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/routines">Routines</Link> / <span>{routine.name}</span>
      </nav>
      <div className="page-head">
        <div>
          <h1>{routine.name}</h1>
          <div className="sub">
            {routine.exercises.length} exercises · {history.length} session{history.length === 1 ? '' : 's'} logged
          </div>
        </div>
        <div className="head-actions">
          <button type="button" className="btn ghost" onClick={() => setEditing(true)}>
            Edit
          </button>
          <Link className="btn" to={`/log?routine=${routine.id}`}>
            Log this routine
          </Link>
        </div>
      </div>

      <div className="card">
        <Tabs
          label="Routine sections"
          tabs={[
            { id: 'exercises', label: 'Exercises', content: exercisesTab },
            { id: 'history', label: `History (${history.length})`, content: historyTab },
          ]}
        />
      </div>

      <RoutineFormModal open={editing} routine={routine} onClose={() => setEditing(false)} />
    </section>
  );
}
