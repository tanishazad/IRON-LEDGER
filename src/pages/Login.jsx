import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useForm } from '../hooks/useForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { validateLogin } from '../utils/validators';
import InputField from '../components/ui/InputField';
import AuthShell, { SocialButtons } from '../components/layout/AuthShell';

const INITIAL = { username: '', password: '' };

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const form = useForm({
    initialValues: INITIAL,
    validate: validateLogin,
    onSubmit: async (values) => {
      await login(values);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    },
  });

  return (
    <AuthShell mode="login">
      <SocialButtons from={from} />
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
          {...form.getFieldProps('username')}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...form.getFieldProps('password')}
        />
        <button type="submit" className="btn block" disabled={form.submitting}>
          {form.submitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}
