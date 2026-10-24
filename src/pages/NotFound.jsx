import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Catch-all 404 route. */
export default function NotFound() {
  useDocumentTitle('Page not found');
  const { isAuthenticated } = useAuth();
  return (
    <div id="auth-screen">
      <div className="auth-card not-found">
        <div className="code">404</div>
        <div className="auth-brand">Rep not found</div>
        <p className="auth-sub">That page doesn't exist — maybe the link is wrong or it was moved.</p>
        <Link className="btn block" to={isAuthenticated ? '/dashboard' : '/login'}>
          {isAuthenticated ? 'Back to dashboard' : 'Go to login'}
        </Link>
      </div>
      <Footer compact />
    </div>
  );
}
