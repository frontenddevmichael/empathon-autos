import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
  className?: string
}

/**
 * A calm empty state: one line, one explanation, one next action.
 * No illustration — the copy and the action carry it.
 */
export function EmptyState({ title, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`${styles.root} ${className}`}>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
