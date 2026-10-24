import { useId, useState } from 'react';

/**
 * Reusable form field: label + input/textarea + hint + error message.
 * Wires up the accessibility attributes (htmlFor, aria-invalid, aria-describedby)
 * so every form in the app gets them for free.
 *
 * Works with useForm's getFieldProps(): <InputField label="Email" {...form.getFieldProps('email')} />
 */
export default function InputField({
  label,
  error,
  hint,
  type = 'text',
  as = 'input',
  className = '',
  children,
  ...rest
}) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const Tag = as;

  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ');

  return (
    <div className={`field ${error ? 'invalid' : ''} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={isPassword ? 'input-with-action' : undefined}>
        <Tag
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="input-action"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {children}
      {hint && !error && (
        <div className="field-hint" id={`${id}-hint`}>
          {hint}
        </div>
      )}
      {error && (
        <div className="field-error" id={`${id}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
