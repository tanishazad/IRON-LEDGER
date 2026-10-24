import { useEffect, useId, useRef, useState } from 'react';

/**
 * Custom dropdown (listbox pattern) — a styled replacement for <select>.
 *   options = [{ value, label }]
 * Keyboard: Enter/Space/ArrowDown open · ArrowUp/Down move · Home/End · Enter selects · Esc closes.
 * Clicking outside closes it (document listener + a ref to the wrapper).
 */
export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) {
  const id = useId();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  // close when the user clicks anywhere outside
  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  };

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // don't also close a surrounding modal
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[activeIndex]) choose(options[activeIndex]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={`dropdown ${className}`} ref={wrapRef}>
      {label && (
        <span className="dropdown-label" id={`${id}-label`}>
          {label}
        </span>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="dropdown-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label ${id}-btn` : undefined}
        id={`${id}-btn`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? '' : 'placeholder'}>{selected ? selected.label : placeholder}</span>
        <span className="caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul
          className="dropdown-menu"
          role="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-activedescendant={`${id}-opt-${activeIndex}`}
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={opt.value === value}
              className={`dropdown-item ${i === activeIndex ? 'active' : ''} ${
                opt.value === value ? 'selected' : ''
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
