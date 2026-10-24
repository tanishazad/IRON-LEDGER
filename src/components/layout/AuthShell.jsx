import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from './Footer';
import { useToast } from '../../context/ToastContext';

/** Shared card + tabs for the Login and Register pages (each is its own route). */
export default function AuthShell({ mode, children }) {
  return (
    <div id="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          Iron<span>Ledger</span>
        </div>
        <div className="auth-sub">
          {mode === 'login' ? 'Sign in to load your training log' : 'Create an account to start logging'}
        </div>
        <div className="auth-tabs" role="tablist" aria-label="Sign in or create an account">
          <Link
            to="/login"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          >
            Log In
          </Link>
          <Link
            to="/register"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
          >
            Sign Up
          </Link>
        </div>
        {children}
        <div className="auth-note">
          This is a front-end demo: accounts are stored in <b>your browser's localStorage</b>, and
          Google/Facebook are <b>simulated</b> — no real OAuth call is made. A production version would
          need a backend to verify tokens from the providers' real sign-in APIs.
        </div>
      </div>
      <Footer compact />
    </div>
  );
}

export function SocialButtons({ from }) {
  const { socialLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const go = async (provider) => {
    await socialLogin(provider);
    toast.success(`Signed in with ${provider === 'google' ? 'Google' : 'Facebook'} (simulated)`);
    navigate(from, { replace: true });
  };

  return (
    <>
      <div className="social-btns">
        <button type="button" className="social-btn google" onClick={() => go('google')}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          Continue with Google
        </button>
        <button type="button" className="social-btn facebook" onClick={() => go('facebook')}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#1877F2" d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.31V9h2.29V7.02c0-2.26 1.35-3.51 3.41-3.51.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9z" />
          </svg>
          Continue with Facebook
        </button>
      </div>
      <div className="auth-divider">or use email</div>
    </>
  );
}
