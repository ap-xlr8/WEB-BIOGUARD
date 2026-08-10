import { InputHTMLAttributes, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const errorId = `${inputId}-error`;
  const isPassword = props.type === 'password';
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? 'text' : 'password') : props.type;
  const defaultMaxLength = isPassword
    ? 128
    : props.type === 'email'
      ? 254
      : ['text', 'search', 'tel', 'url', undefined].includes(props.type)
        ? 160
        : undefined;

  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          {...props}
          id={inputId}
          type={inputType}
          maxLength={props.maxLength ?? defaultMaxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : props['aria-describedby']}
          className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShow(!show)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <span className={styles.errorText} id={errorId} aria-live="polite">{error || ''}</span>
    </div>
  );
}
