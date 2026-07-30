import styles from './Skeleton.module.css'

export function VehicleCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={styles.line} />
        <div className={`${styles.line} ${styles.lineShort}`} />
        <div className={`${styles.line} ${styles.lineMedium}`} />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={styles.line} style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  )
}