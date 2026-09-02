import styles from './Skeleton.module.css'

export function VehicleCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.lineMedium}`} />
        <div className={`${styles.line} ${styles.lineShort}`} />
        <div className={`${styles.line} ${styles.lineShort}`} />
      </div>
    </div>
  )
}
