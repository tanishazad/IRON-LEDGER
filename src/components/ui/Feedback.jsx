/* Small presentational pieces for loading / error / empty states. */

export function Spinner({ label = 'Loading…', inline = false }) {
  return (
    <div className={`spinner-wrap ${inline ? 'inline' : ''}`} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, children }) {
  return (
    <div className="error-state" role="alert">
      <div className="big">{title}</div>
      {message && <p>{message}</p>}
      <div className="error-actions">
        {onRetry && (
          <button type="button" className="btn" onClick={onRetry}>
            Try again
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <div className="big">{title}</div>
      {children}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="ex-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="ex-card skeleton" key={i}>
          <div className="sk-img" />
          <div className="sk-line" />
          <div className="sk-line short" />
        </div>
      ))}
    </div>
  );
}
