import { useRef } from 'react';

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/**
 * Native date input with a visible calendar control that opens the browser date picker.
 */
export default function DateFieldWithCalendar({
  id,
  label,
  value,
  onChange,
  className = '',
}) {
  const inputRef = useRef(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === 'function') {
        el.showPicker();
        return;
      }
    } catch {
      /* showPicker can throw if not user-activated in some browsers */
    }
    el.focus();
    el.click();
  };

  return (
    <div className={`field date-field-with-calendar ${className}`.trim()}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <div className="date-input-with-trigger">
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          onChange={onChange}
          className="date-input-native"
        />
        <button
          type="button"
          className="date-calendar-trigger"
          onClick={openPicker}
          aria-label="Open calendar to choose date"
          title="Choose date"
        >
          <CalendarIcon />
        </button>
      </div>
    </div>
  );
}
