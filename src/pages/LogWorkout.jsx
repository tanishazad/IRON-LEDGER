import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectRoutines, selectSaving } from '../store/selectors';
import { saveLog } from '../store/workoutsSlice';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { toISODate } from '../utils/helpers';
import { validateSetRow } from '../utils/validators';
import Dropdown from '../components/ui/Dropdown';
import InputField from '../components/ui/InputField';
import { EmptyState } from '../components/ui/Feedback';

const emptySet = () => ({ reps: '', weight: '' });

const buildSets = (routine) =>
  Object.fromEntries(
    routine.exercises.map((ex) => [
      ex.id,
      Array.from({ length: Number(ex.targetSets || 3) }, emptySet),
    ]),
  );

/** The routine picker lives here; the set grid is a child keyed by routine id so it resets on change. */
export default function LogWorkout() {
  useDocumentTitle('Log workout');
  const routines = useSelector(selectRoutines);
  const [params, setParams] = useSearchParams();

  const selectedId = routines.some((r) => r.id === params.get('routine'))
    ? params.get('routine')
    : routines[0]?.id;
  const routine = routines.find((r) => r.id === selectedId);
  const options = useMemo(() => routines.map((r) => ({ value: r.id, label: r.name })), [routines]);

  return (
    <section>
      <h1>Log Workout</h1>
      <div className="sub">Pick a routine and record what actually happened today.</div>

      {!routine ? (
        <EmptyState title="Build a routine first">
          Go to <Link to="/routines">Routines</Link> to create one, then come back here to log it.
        </EmptyState>
      ) : (
        <div className="card">
          <Dropdown
            label="Routine"
            options={options}
            value={selectedId}
            onChange={(id) => setParams({ routine: id }, { replace: true })}
          />
          <SetsForm key={routine.id} routine={routine} />
        </div>
      )}
    </section>
  );
}

function SetsForm({ routine }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const saving = useSelector(selectSaving);
  const [date, setDate] = useState(toISODate());
  const [sets, setSets] = useState(() => buildSets(routine));
  const [showErrors, setShowErrors] = useState(false);

  const updateSet = (exId, i, field, value) =>
    setSets((s) => ({ ...s, [exId]: s[exId].map((row, idx) => (idx === i ? { ...row, [field]: value } : row)) }));
  const addSet = (exId) => setSets((s) => ({ ...s, [exId]: [...s[exId], emptySet()] }));
  const removeSet = (exId, i) =>
    setSets((s) => ({ ...s, [exId]: s[exId].filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setShowErrors(true);

    const anyInvalid = Object.values(sets).some((rows) =>
      rows.some((row) => Object.keys(validateSetRow(row)).length > 0),
    );
    if (anyInvalid) {
      toast.error('Fix the highlighted sets first');
      return;
    }

    const entries = routine.exercises
      .map((ex) => ({
        exerciseName: ex.name,
        sets: sets[ex.id]
          .map((row) => ({ reps: Number(row.reps) || 0, weight: Number(row.weight) || 0 }))
          .filter((s) => s.reps > 0 || s.weight > 0),
      }))
      .filter((en) => en.sets.length > 0);

    if (entries.length === 0) {
      toast.error('Log at least one set');
      return;
    }
    if (!date) {
      toast.error('Pick a date');
      return;
    }

    try {
      await dispatch(
        saveLog({ date, routineId: routine.id, routineName: routine.name, entries }),
      ).unwrap();
      toast.success('Workout logged');
      setSets(buildSets(routine));
      setShowErrors(false);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not save the workout');
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <InputField
        label="Date"
        type="date"
        value={date}
        max={toISODate()}
        onChange={(e) => setDate(e.target.value)}
        className="date-field"
      />

      {routine.exercises.map((ex) => (
        <div className="log-exercise-block" key={ex.id}>
          <h3>
            {ex.name}{' '}
            <span className="target">
              target {ex.targetSets}×{ex.targetReps}
            </span>
          </h3>
          {sets[ex.id].map((row, i) => {
            const errs = showErrors ? validateSetRow(row) : {};
            return (
              <div className="set-input-row" key={i}>
                <div className="idx">#{i + 1}</div>
                <input
                  type="number"
                  min="0"
                  placeholder="Reps"
                  aria-label={`${ex.name} set ${i + 1} reps`}
                  aria-invalid={errs.reps ? 'true' : undefined}
                  value={row.reps}
                  onChange={(e) => updateSet(ex.id, i, 'reps', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Weight (kg)"
                  aria-label={`${ex.name} set ${i + 1} weight in kilograms`}
                  aria-invalid={errs.weight ? 'true' : undefined}
                  value={row.weight}
                  onChange={(e) => updateSet(ex.id, i, 'weight', e.target.value)}
                />
                <button
                  type="button"
                  className="remove-set"
                  title="Remove set"
                  aria-label={`Remove set ${i + 1}`}
                  onClick={() => removeSet(ex.id, i)}
                >
                  ✕
                </button>
              </div>
            );
          })}
          <button type="button" className="btn ghost small" onClick={() => addSet(ex.id)}>
            + Add Set
          </button>
        </div>
      ))}

      <button type="submit" className="btn" disabled={saving} style={{ marginTop: 6 }}>
        {saving ? 'Saving…' : 'Save Entry'}
      </button>
    </form>
  );
}
