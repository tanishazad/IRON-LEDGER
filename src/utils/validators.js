/* Validation strategy:
 *   - every validator is a PURE function: values in, { field: message } out
 *   - an empty object means "valid"
 *   - useForm decides WHEN to show messages (after blur / on submit)
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export function validateUsername(value) {
  const v = value.trim();
  if (!v) return 'Username is required';
  if (v.length < 3) return 'Username must be at least 3 characters';
  if (v.length > 20) return 'Username must be 20 characters or fewer';
  if (!USERNAME_RE.test(v)) return 'Use only letters, numbers and underscores';
  return '';
}

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value))
    return 'Include at least one letter and one number';
  return '';
}

/** 0–4 score plus a label, for the strength meter on the register form. */
export function passwordStrength(value) {
  if (!value) return { score: 0, label: '' };
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value) || value.length >= 12) score++;
  return { score, label: ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'][score] };
}

export function validateRegister(values) {
  const errors = {};
  const username = validateUsername(values.username);
  if (username) errors.username = username;
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const password = validatePassword(values.password);
  if (password) errors.password = password;
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Passwords do not match';
  if (!values.terms) errors.terms = 'You need to accept the demo terms to continue';
  return errors;
}

export function validateLogin(values) {
  const errors = {};
  if (!values.username.trim()) errors.username = 'Username is required';
  if (!values.password) errors.password = 'Password is required';
  return errors;
}

export function validateRoutineName(value) {
  const v = value.trim();
  if (!v) return 'Give the routine a name';
  if (v.length < 2) return 'Name must be at least 2 characters';
  if (v.length > 40) return 'Name must be 40 characters or fewer';
  return '';
}

export function validateExerciseDraft({ name, sets, reps }, existingNames = []) {
  const errors = {};
  const n = name.trim();
  if (!n) errors.name = 'Name the exercise first';
  else if (existingNames.some((e) => e.toLowerCase() === n.toLowerCase()))
    errors.name = 'That exercise is already in this routine';
  const s = Number(sets);
  if (!Number.isInteger(s) || s < 1 || s > 20) errors.sets = '1–20 sets';
  const r = Number(reps);
  if (!Number.isInteger(r) || r < 1 || r > 100) errors.reps = '1–100 reps';
  return errors;
}

/** Validates one logged set row. Blank rows are allowed (they are simply skipped on save). */
export function validateSetRow({ reps, weight }) {
  const errors = {};
  if (reps !== '' && (Number(reps) < 0 || !Number.isFinite(Number(reps)))) errors.reps = 'Invalid';
  if (weight !== '' && (Number(weight) < 0 || !Number.isFinite(Number(weight))))
    errors.weight = 'Invalid';
  return errors;
}
