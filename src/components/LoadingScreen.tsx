import styles from './LoadingScreen.module.css'

/**
 * Route-level Suspense fallback. A skeleton that matches the page structure
 * rather than a branded splash — no logo, no pulse ring.
 */
export function LoadingScreen() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading">
      <div className={styles.hero} />
      <div className={styles.body}>
        <div className={styles.line} data-wide />
        <div className={styles.line} />
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Minimal admin skeleton for sidebar-heavy layouts. */
export function AdminSkeleton() {
  return (
    <div className={styles.admin} aria-busy="true" aria-label="Loading">
      <div className={styles.adminSide}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.line} data-short />
        ))}
      </div>
      <div className={styles.adminMain}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.line} />
        ))}
      </div>
    </div>
  )
}
