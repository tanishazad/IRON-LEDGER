import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLogs, selectRoutines, selectStats, selectToday } from '../store/selectors';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate } from '../utils/helpers';
import Barbell from '../components/dashboard/Barbell';
import { EmptyState } from '../components/ui/Feedback';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const stats = useSelector(selectStats);
  const today = useSelector(selectToday);
  const logs = useSelector(selectLogs);
  const routines = useSelector(selectRoutines);

  const recent = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [logs],
  );
  const routineIds = useMemo(() => new Set(routines.map((r) => r.id)), [routines]);

  return (
    <section>
      <h1>Dashboard</h1>
      <div className="sub">
        {new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      <div className="card">
        <h2>Today's Loading</h2>
        <div className="barbell-wrap">
          <Barbell filled={today.setsDone} target={today.target} />
        </div>
        <div className="barbell-caption">
          {today.hasLog ? (
            <>
              <strong>{today.setsDone}</strong> of <strong>{today.target}</strong> sets loaded today —{' '}
              {today.names.join(', ')}
            </>
          ) : (
            <>
              No sets logged yet today. Head to <Link to="/log">Log Workout</Link> to get started.
            </>
          )}
        </div>
      </div>

      <div className="grid">
        <div className="stat">
          <div className="label">Total Workouts</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat">
          <div className="label">Current Streak</div>
          <div className="value accent">{stats.streak}</div>
        </div>
        <div className="stat">
          <div className="label">Routines Built</div>
          <div className="value">{stats.routines}</div>
        </div>
        <div className="stat">
          <div className="label">Logged This Week</div>
          <div className="value">{stats.week}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>Recent Entries</h2>
        {recent.length === 0 ? (
          <EmptyState title="Nothing logged yet">Your workout history will show up here.</EmptyState>
        ) : (
          recent.map((l) => {
            const sets = l.entries.reduce((a, e) => a + e.sets.length, 0);
            const body = (
              <>
                <div className="name">{l.routineName}</div>
                <div className="meta">
                  {formatDate(l.date)} · {sets} sets
                </div>
              </>
            );
            return routineIds.has(l.routineId) ? (
              <Link key={l.id} to={`/routines/${l.routineId}`} className="exercise-row link-row">
                {body}
              </Link>
            ) : (
              <div key={l.id} className="exercise-row">
                {body}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
