import { type ReactNode } from 'react'

interface DecoFloatIconProps {
  children: ReactNode
  x?: number
  y?: number
  dur?: number
  delay?: number
}

export function DecoFloatIcon({ children, x = 0, y = -10, dur = 4, delay = 0 }: DecoFloatIconProps) {
  return (
    <span style={{ display: 'inline-flex', animation: `floatIcon ${dur}s ease-in-out ${delay}s infinite` }}>
      {children}
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(${y}px) rotate(${x}deg); }
        }
      `}</style>
    </span>
  )
}
