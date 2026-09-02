import styles from './FilterChip.module.css'

interface FilterChipProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function FilterChip({ label, options, value, onChange }: FilterChipProps) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          aria-pressed={value === opt.value}
          className={`${styles.chip} ${value === opt.value ? styles.active : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
