import { useCallback, useRef, useState, type ReactNode } from 'react'
import styles from './Ripple.module.css'

interface RippleData {
  x: number
  y: number
  id: number
}

interface RippleProps {
  children: ReactNode
  className?: string
}

export function Ripple({ children, className = '' }: RippleProps) {
  const [ripples, setRipples] = useState<RippleData[]>([])
  const idRef = useRef(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = ++idRef.current
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
  }, [])

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`} onClick={handleClick}>
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className={styles.ripple}
          style={{
            left: r.x,
            top: r.y,
            width: 24,
            height: 24,
          }}
        />
      ))}
    </div>
  )
}
