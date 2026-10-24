import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';
import { selectRoutines } from '../../store/selectors';
import { updateRoutine } from '../../store/workoutsSlice';
import { useToast } from '../../context/ToastContext';
import { uid } from '../../utils/helpers';
import { fallbackImage } from '../../utils/exerciseImage';

/** Shows one exercise from the API and lets you add it to a saved routine (an UPDATE in CRUD terms). */
export default function ExerciseDetailModal({ exercise, onClose }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const routines = useSelector(selectRoutines);
  const [routineId, setRoutineId] = useState('');
  const [adding, setAdding] = useState(false);

  const options = useMemo(() => routines.map((r) => ({ value: r.id, label: r.name })), [routines]);

  const add = async () => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    if (routine.exercises.some((e) => e.name.toLowerCase() === exercise.name.toLowerCase())) {
      toast.info(`"${exercise.name}" is already in ${routine.name}`);
      return;
    }
    setAdding(true);
    try {
      await dispatch(
        updateRoutine({
          id: routine.id,
          changes: {
            exercises: [
              ...routine.exercises,
              { id: uid(), name: exercise.name, targetSets: 3, targetReps: 10 },
            ],
          },
        }),
      ).unwrap();
      toast.success(`Added to ${routine.name}`);
      onClose();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not update the routine');
      setAdding(false);
    }
  };

  return (
    <Modal open={!!exercise} onClose={onClose} title={exercise?.name ?? ''} size="md">
      {exercise && (
        <>
          <img
            className="ex-detail-img"
            src={exercise.image || fallbackImage(exercise)}
            alt={exercise.name}
            onError={(e) => {
              const fb = fallbackImage(exercise);
              if (!e.currentTarget.src.endsWith(fb)) e.currentTarget.src = fb;
            }}
          />
          <div className="chips spaced">
            {exercise.category && <span className="chip accent">{exercise.category}</span>}
            {exercise.muscles.map((m) => (
              <span className="chip" key={m}>
                {m}
              </span>
            ))}
            {exercise.equipment.map((eq) => (
              <span className="chip outline" key={eq}>
                {eq}
              </span>
            ))}
          </div>
          <p className="ex-desc">
            {exercise.description || 'No description available for this exercise.'}
          </p>

          <div className="add-to-routine">
            <h3 className="subhead">Add to a routine</h3>
            {routines.length === 0 ? (
              <p className="muted small">
                You have no routines yet. <Link to="/routines" onClick={onClose}>Create one</Link> first.
              </p>
            ) : (
              <div className="row end">
                <Dropdown
                  label="Routine"
                  options={options}
                  value={routineId}
                  onChange={setRoutineId}
                  placeholder="Choose a routine"
                />
                <button type="button" className="btn" onClick={add} disabled={!routineId || adding}>
                  {adding ? 'Adding…' : 'Add'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
