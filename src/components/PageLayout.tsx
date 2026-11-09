import type { CSSProperties, ReactNode } from 'react'
import { Section as LayoutSection } from './layout/Section'
import styles from './PageLayout.module.css'

interface SectionProps {
  children: ReactNode
  dark?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Legacy section wrapper kept for existing pages.
 * Delegates to the shared Section primitive so tone, spacing and container
 * width stay consistent with newer pages.
 */
export function Section({ children, dark, className = '', style }: SectionProps) {
  return (
    <LayoutSection
      tone={dark ? 'navy' : 'transparent'}
      className={className}
      style={style}
    >
      {children}
    </LayoutSection>
  )
}

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a id="main-content" tabIndex={-1} className={styles.skipAnchor} />
      <div className={styles.main}>{children}</div>
    </>
  )
}
