import { useCallback, useMemo, useState } from 'react';

/**
 * useForm — a small custom hook for controlled forms.
 *
 *   const form = useForm({ initialValues, validate, onSubmit });
 *   <InputField label="Email" {...form.getFieldProps('email')} />
 *
 * Validation strategy:
 *   - `validate(values)` is a pure function returning { field: message }
 *   - errors are computed on every change, but only SHOWN for fields the user
 *     has already left (touched) — or for every field after a submit attempt
 *   - onSubmit may throw: the message is exposed as `submitError`
 *     (e.g. "That username is already taken")
 */
export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const errors = useMemo(() => validate(values), [validate, values]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    setSubmitError('');
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // reveal every error at once
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (!isValid) {
      const first = Object.keys(errors)[0];
      e.target.elements[first]?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    checked: typeof values[name] === 'boolean' ? values[name] : undefined,
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : '',
  });

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setSubmitError('');
  }, [initialValues]);

  return { values, errors, isValid, submitting, submitError, handleSubmit, getFieldProps, reset };
}
