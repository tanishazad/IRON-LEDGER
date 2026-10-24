import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useForm } from '../hooks/useForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { passwordStrength, validateRegister } from '../utils/validators';
import InputField from '../components/ui/InputField';
import AuthShell, { SocialButtons } from '../components/layout/AuthShell';

const INITIAL = { username: '', email: '', password: '', confirmPassword: '', terms: false };

/**
 * Registration form: controlled inputs, field-level validation (shown on blur),
 * a password-strength meter, a confirm-password cross-field check, and a
 * server-style error ("username taken") surfaced from onSubmit.
 */
export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: INITIAL,
    validate: validateRegister,
    onSubmit: async (values) => {
      await register(values);
      toast.success('Account created — welcome!');
      navigate('/dashboard', { replace: true });
    },
  });

  const strength = passwordStrength(form.values.password);
  const termsProps = form.getFieldProps('terms');

  return (
    <AuthShell mode="signup">
      <SocialButtons from="/dashboard" />
      <form onSubmit={form.handleSubmit} noValidate>
        {form.submitError && (
          <div className="auth-error" role="alert">
            {form.submitError}
          </div>
        )}
        <InputField
          label="Username"
          autoComplete="username"
          placeholder="e.g. ironmike"
          hint="3–20 characters: letters, numbers, underscores"
          {...form.getFieldProps('username')}
        />
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.getFieldProps('email')}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number"
          {...form.getFieldProps('password')}
        >
          {form.values.password && (
            <div className="strength" aria-live="polite">
              <div className="strength-bar">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= strength.score ? `on s${strength.score}` : ''} />
                ))}
              </div>
              <span className="strength-label">{strength.label}</span>
            </div>
          )}
        </InputField>
        <InputField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...form.getFieldProps('confirmPassword')}
        />

        <div className={`check ${termsProps.error ? 'invalid' : ''}`}>
          <label className="check-label">
            <input
              type="checkbox"
              name="terms"
              checked={termsProps.checked}
              onChange={termsProps.onChange}
              onBlur={termsProps.onBlur}
              aria-invalid={termsProps.error ? 'true' : undefined}
            />
            <span>I understand this is a front-end demo — my data stays in this browser.</span>
          </label>
          {termsProps.error && (
            <div className="field-error" role="alert">
              {termsProps.error}
            </div>
          )}
        </div>

        <button type="submit" className="btn block" disabled={form.submitting}>
          {form.submitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
