/**
 * ToastContext — app-wide toast notifications.
 * Any component calls `const toast = useToast(); toast.success('Saved')`.
 * The provider owns the queue and renders the viewport once, at the top of the tree.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { uid } from '../utils/helpers';

const ToastContext = createContext(null);
const MAX_VISIBLE = 4;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = uid();
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      show: push,
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error', 5500),
      info: (m) => push(m, 'info'),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type}`}
            role={t.type === 'error' ? 'alert' : 'status'}
          >
            <span>{t.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
