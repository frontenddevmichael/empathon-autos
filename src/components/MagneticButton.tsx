import { useRef, type ReactNode } from 'react'
import styles from './MagneticButton.module.css'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function MagneticButton({ children, strength = 0.15, className = '' }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const handleMouse = (x: number, y: number) => {
    const el = ref.current
    const inner = innerRef.current
    if (!el || !inner) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (x - cx) * strength
    const dy = (y - cy) * strength
    inner.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const handleLeave = () => {
    const inner = innerRef.current
    if (!inner) return
    inner.style.transform = 'translate(0, 0)'
  }

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${className}`}
      onMouseMove={e => handleMouse(e.clientX, e.clientY)}
      onMouseLeave={handleLeave}
    >
      <div ref={innerRef} className={styles.inner}>
        {children}
      </div>
    </div>
  )
}
