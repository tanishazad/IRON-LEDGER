import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { fetchWorkouts } from '../../store/workoutsSlice';
import { selectWorkoutError, selectWorkoutStatus } from '../../store/selectors';
import Footer from './Footer';
import { ErrorState, Spinner } from '../ui/Feedback';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/routines', label: 'Routines' },
  { to: '/log', label: 'Log Workout' },
  { to: '/progress', label: 'Progress' },
  { to: '/explore', label: 'Explore' },
];

/**
 * Shared page structure for every signed-in screen:
 * sidebar navigation + <Outlet/> where the matched child route renders.
 * It also kicks off the initial workouts fetch once per session.
 */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const status = useSelector(selectWorkoutStatus);
  const error = useSelector(selectWorkoutError);

  useEffect(() => {
    dispatch(fetchWorkouts());
  }, [dispatch]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          Iron<span>Ledger</span>
        </div>
        <div className="tagline">Log it. Lift it. Track it.</div>
        <div className="user-pill">
          <span>
            Signed in as <b>{user.displayName}</b>
          </span>
          <button type="button" onClick={logout}>
            Log Out
          </button>
        </div>
        <nav aria-label="Main">
          {NAV.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            >
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="content">
      <main id="main">
        {status === 'idle' || status === 'loading' ? (
          <Spinner label="Loading your training log…" />
        ) : status === 'failed' ? (
          <ErrorState
            title="Couldn't load your data"
            message={error}
            onRetry={() => dispatch(fetchWorkouts())}
          />
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
      </div>
    </div>
  );
}
