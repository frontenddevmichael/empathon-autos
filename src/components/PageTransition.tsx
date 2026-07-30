import { type ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div
      className={`page-transition ${className}`}
      style={{
        animation: 'scaleInUp 500ms var(--ease-out) forwards',
        transformOrigin: 'center top',
      }}
    >
      {children}
    </div>
  )
}
