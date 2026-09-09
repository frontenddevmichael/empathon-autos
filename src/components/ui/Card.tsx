import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  hoverable?: boolean
  className?: string
  style?: React.CSSProperties
}

export function Card({ children, hoverable, className = '', style }: CardProps) {
  return (
    <div className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`} style={style}>
      {children}
    </div>
  )
}