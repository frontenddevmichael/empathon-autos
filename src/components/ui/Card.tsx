import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  hoverable?: boolean
  className?: string
  children: ReactNode
  as?: 'div' | 'a'
  href?: string
  [key: string]: any
}

export function Card({ hoverable, className = '', children, as: Tag = 'div', href, ...props }: CardProps) {
  const cls = `${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`
  if (Tag === 'a') {
    return <a href={href} className={cls} {...props}>{children}</a>
  }
  return <div className={cls} {...props}>{children}</div>
}
