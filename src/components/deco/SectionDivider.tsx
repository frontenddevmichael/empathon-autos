import styles from './SectionDivider.module.css'

interface SectionDividerProps {
  variant?: 'wave' | 'slope' | 'curve'
  color?: string
}

export function SectionDivider({ variant = 'wave', color = 'var(--bg)' }: SectionDividerProps) {
  if (variant === 'slope') {
    return (
      <div className={styles.divider}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill={color}>
          <path d="M0 80 L1440 0 L1440 80 Z" />
        </svg>
      </div>
    )
  }
  if (variant === 'curve') {
    return (
      <div className={styles.divider}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" fill={color}>
          <path d="M0 60 Q 360 0, 720 60 T 1440 60 L1440 100 L0 100 Z" />
        </svg>
      </div>
    )
  }
  return (
    <div className={styles.divider}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill={color}>
        <path d="M0 40 Q 360 0, 720 40 T 1440 40 L1440 60 L0 60 Z" />
      </svg>
    </div>
  )
}
