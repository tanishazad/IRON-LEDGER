import { useId, useRef, useState } from 'react';

/**
 * Accessible tabs (WAI-ARIA tabs pattern).
 *   tabs = [{ id, label, content }]
 * Left/Right arrows, Home and End move between tabs. Only the active panel is
 * rendered. Works uncontrolled (defaultTab) or controlled (value + onChange).
 */
export default function Tabs({ tabs, defaultTab, value, onChange, label = 'Sections' }) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultTab ?? tabs[0].id);
  const active = value ?? internal;
  const buttons = useRef({});

  const select = (id) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === active);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(tabs[next].id);
    buttons.current[tabs[next].id]?.focus();
  };

  const current = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <div className="tabs">
      <div className="tab-list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => (buttons.current[t.id] = el)}
            type="button"
            role="tab"
            id={`${baseId}-tab-${t.id}`}
            aria-selected={t.id === current.id}
            aria-controls={`${baseId}-panel-${t.id}`}
            tabIndex={t.id === current.id ? 0 : -1}
            className={`tab ${t.id === current.id ? 'active' : ''}`}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`${baseId}-panel-${current.id}`}
        aria-labelledby={`${baseId}-tab-${current.id}`}
      >
        {current.content}
      </div>
    </div>
  );
}
