import styles from './LoadingScreen.module.css'

/**
 * Route-level Suspense fallback. It mirrors the shell that is about to appear
 * (hero band, section head, card grid) instead of showing a branded splash.
 * Everything is a static warm block; the only motion is the top progress line.
 */
export function LoadingScreen() {
  return (
    <div className={styles.page} aria-busy="true" role="status" aria-label="Loading page">
      <div className={styles.bar} aria-hidden="true" />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={`${styles.block} ${styles.tag}`} />
          <div className={`${styles.blockWhite} ${styles.heroTitle}`} />
          <div className={`${styles.blockWhite} ${styles.heroTitleShort}`} />
          <div className={`${styles.blockWhite} ${styles.heroSub}`} />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.headLines}>
            <div className={`${styles.block} ${styles.label}`} />
            <div className={`${styles.block} ${styles.title}`} />
          </div>
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.image} />
              <div className={`${styles.block} ${styles.line}`} />
              <div className={`${styles.block} ${styles.lineShort}`} />
            </div>
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
          <div key={i} className={`${styles.block} ${styles.adminLine}`} />
        ))}
      </div>
      <div className={styles.adminMain}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.adminLine}`} />
        ))}
      </div>
    </div>
  )
}
