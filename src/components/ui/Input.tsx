import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface FieldProps {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={styles.field}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${error ? styles.error : ''} ${className}`}
          {...props}
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={styles.field}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''} ${className}`}
          {...props}
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    )
  }
)
TextArea.displayName = 'TextArea'

interface SelectOption { value: string; label: string }

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps & { options: SelectOption[] }>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={styles.field}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <select
          ref={ref}
          id={inputId}
          className={`${styles.input} ${styles.select} ${error ? styles.error : ''} ${className}`}
          {...props}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'