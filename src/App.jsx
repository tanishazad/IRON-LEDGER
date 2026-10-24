import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { Spinner } from './components/ui/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ThemeToggle from './components/ui/ThemeToggle';

// Code-splitting: each page below is downloaded only when first visited.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Routines = lazy(() => import('./pages/Routines'));
const RoutineDetail = lazy(() => import('./pages/RoutineDetail'));
const LogWorkout = lazy(() => import('./pages/LogWorkout'));
const Progress = lazy(() => import('./pages/Progress'));
const Explore = lazy(() => import('./pages/Explore'));

/**
 * Route map
 *   /login, /register                public only
 *   /  (protected)  → AppLayout (sidebar + <Outlet/>)
 *        /dashboard
 *        /routines            list
 *        /routines/:routineId detail  (nested + dynamic param)
 *        /log?routine=<id>
 *        /progress
 *        /explore
 *   *                                404
 */
export default function App() {
  return (
    <>
    <ThemeToggle />
    <Suspense fallback={<Spinner label="Loading…" />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="routines">
              <Route index element={<Routines />} />
              <Route path=":routineId" element={<RoutineDetail />} />
            </Route>
            <Route path="log" element={<LogWorkout />} />
            <Route path="progress" element={<Progress />} />
            <Route path="explore" element={<Explore />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </>
  );
}
