import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLogs, selectLoggedExerciseNames } from '../store/selectors';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate } from '../utils/helpers';
import Dropdown from '../components/ui/Dropdown';
import Tabs from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/Feedback';
import ProgressChart from '../components/progress/ProgressChart';

export default function Progress() {
  useDocumentTitle('Progress');
  const logs = useSelector(selectLogs);
  const names = useSelector(selectLoggedExerciseNames);
  const [chosen, setChosen] = useState('');

  const exercise = names.includes(chosen) ? chosen : names[0];
  const options = useMemo(() => names.map((n) => ({ value: n, label: n })), [names]);

  const points = useMemo(() => {
    if (!exercise) return [];
    return logs
      .filter((l) => l.entries.some((e) => e.exerciseName === exercise))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((l) => {
        const entry = l.entries.find((e) => e.exerciseName === exercise);
        return {
          date: l.date,
          topWeight: Math.max(...entry.sets.map((s) => s.weight)),
          totalVolume: entry.sets.reduce((a, s) => a + s.reps * s.weight, 0),
        };
      });
  }, [logs, exercise]);

  return (
    <section>
      <h1>Progress</h1>
      <div className="sub">Top set weight over time, by exercise.</div>

      {!exercise ? (
        <EmptyState title="No progress data yet">
          Log a few workouts to see trends here. <Link to="/log">Log a workout</Link>
        </EmptyState>
      ) : (
        <div className="card">
          <Dropdown label="Exercise" options={options} value={exercise} onChange={setChosen} />
          <Tabs
            label="Progress views"
            tabs={[
              { id: 'chart', label: 'Chart', content: <ProgressChart points={points} /> },
              {
                id: 'table',
                label: 'Table',
                content: (
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Top Set (kg)</th>
                        <th>Total Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...points].reverse().map((p) => (
                        <tr key={p.date}>
                          <td className="name-col">{formatDate(p.date)}</td>
                          <td>{p.topWeight}</td>
                          <td>{p.totalVolume}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ),
              },
            ]}
          />
        </div>
      )}
    </section>
  );
}
