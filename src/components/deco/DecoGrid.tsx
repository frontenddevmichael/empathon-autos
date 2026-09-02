import styles from './DecoGrid.module.css'

export function DecoGrid({ size = 40 }: { size?: number }) {
  return (
    <div className={styles.grid} aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotGrid" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
            <circle cx={size / 2} cy={size / 2} r="1.5" fill="var(--stone)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>
    </div>
  )
}
