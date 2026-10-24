import { useId, useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../ui/Modal';
import InputField from '../ui/InputField';
import { createRoutine, updateRoutine } from '../../store/workoutsSlice';
import { useToast } from '../../context/ToastContext';
import { useExerciseNames } from '../../hooks/useExerciseNames';
import { validateExerciseDraft, validateRoutineName } from '../../utils/validators';
import { uid } from '../../utils/helpers';

/**
 * Create / edit a routine inside a modal.
 * Pass `routine` to edit it; omit it to create a new one.
 *
 * The form is keyed by the parent (key={routine?.id ?? 'new'}) so it always
 * starts from fresh local state when it is opened for a different routine.
 */
function RoutineForm({ routine, onClose }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const datalistId = useId();
  const suggestions = useExerciseNames();

  const [name, setName] = useState(routine?.name ?? '');
  const [exercises, setExercises] = useState(routine?.exercises ?? []);
  const [draft, setDraft] = useState({ name: '', sets: '3', reps: '10' });
  const [draftErrors, setDraftErrors] = useState({});
  const [nameTouched, setNameTouched] = useState(false);
  const [listError, setListError] = useState('');
  const [saving, setSaving] = useState(false);

  const nameError = nameTouched ? validateRoutineName(name) : '';

  const setDraftField = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const addExercise = () => {
    const errors = validateExerciseDraft(
      draft,
      exercises.map((e) => e.name),
    );
    setDraftErrors(errors);
    if (Object.keys(errors).length) return;
    setExercises((list) => [
      ...list,
      { id: uid(), name: draft.name.trim(), targetSets: Number(draft.sets), targetReps: Number(draft.reps) },
    ]);
    setDraft((d) => ({ ...d, name: '' }));
    setListError('');
  };

  const removeExercise = (id) => setExercises((list) => list.filter((e) => e.id !== id));

  const submit = async (e) => {
    e.preventDefault();
    setNameTouched(true);
    const nErr = validateRoutineName(name);
    if (nErr) return;
    if (exercises.length === 0) {
      setListError('Add at least one exercise');
      return;
    }
    setSaving(true);
    try {
      if (routine) {
        await dispatch(updateRoutine({ id: routine.id, changes: { name, exercises } })).unwrap();
        toast.success('Routine updated');
      } else {
        await dispatch(createRoutine({ name, exercises })).unwrap();
        toast.success('Routine saved');
      }
      onClose();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not save the routine');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <InputField
        label="Routine name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => setNameTouched(true)}
        error={nameError}
        placeholder="e.g. Push Day, Leg Day, Full Body A"
        data-autofocus
      />

      <h3 className="subhead">Exercises</h3>
      {exercises.length === 0 && <p className="muted small">No exercises yet — add the first one below.</p>}
      {exercises.map((ex) => (
        <div className="exercise-row" key={ex.id}>
          <div className="name">{ex.name}</div>
          <div className="meta">
            {ex.targetSets} × {ex.targetReps}
          </div>
          <button type="button" className="btn danger" onClick={() => removeExercise(ex.id)}>
            Remove
          </button>
        </div>
      ))}
      {listError && (
        <div className="field-error" role="alert">
          {listError}
        </div>
      )}

      <div className="row add-row">
        <InputField
          label="Exercise"
          value={draft.name}
          onChange={setDraftField('name')}
          error={draftErrors.name}
          list={datalistId}
          placeholder="e.g. Bench Press"
          autoComplete="off"
        />
        <InputField
          label="Sets"
          type="number"
          min="1"
          value={draft.sets}
          onChange={setDraftField('sets')}
          error={draftErrors.sets}
          className="narrow"
        />
        <InputField
          label="Reps"
          type="number"
          min="1"
          value={draft.reps}
          onChange={setDraftField('reps')}
          error={draftErrors.reps}
          className="narrow"
        />
      </div>
      <datalist id={datalistId}>
        {suggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <button type="button" className="btn ghost small" onClick={addExercise}>
        + Add Exercise
      </button>

      <div className="modal-actions">
        <button type="button" className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : routine ? 'Save Changes' : 'Save Routine'}
        </button>
      </div>
    </form>
  );
}

export default function RoutineFormModal({ open, routine, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={routine ? 'Edit Routine' : 'New Routine'} size="lg">
      <RoutineForm key={routine?.id ?? 'new'} routine={routine} onClose={onClose} />
    </Modal>
  );
}
