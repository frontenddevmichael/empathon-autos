import type { ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  gap?: string
}

export function Marquee({ children, speed = 30, gap = 'var(--space-3)' }: MarqueeProps) {
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
    }}>
      <div style={{
        display: 'flex',
        gap,
        width: 'max-content',
        animation: `marquee ${speed}s linear infinite`,
      }}>
        {children}
        {children}
      </div>
    </div>
  )
}
