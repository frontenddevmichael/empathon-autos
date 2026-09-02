import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id || props.name
  return (
    <div className={styles.field}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={`${styles.input} ${error ? styles.errorInput : ''} ${className}`}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = '', id, ...props }, ref) => {
  const selectId = id || props.name
  return (
    <div className={styles.field}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <select
        ref={ref}
        id={selectId}
        className={`${styles.input} ${styles.select} ${error ? styles.errorInput : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, error, className = '', id, ...props }, ref) => {
  const textareaId = id || props.name
  return (
    <div className={styles.field}>
      {label && <label htmlFor={textareaId} className={styles.label}>{label}</label>}
      <textarea
        ref={ref}
        id={textareaId}
        className={`${styles.input} ${styles.textarea} ${error ? styles.errorInput : ''} ${className}`}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
})
TextArea.displayName = 'TextArea'
