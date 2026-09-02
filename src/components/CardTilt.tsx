import { useRef, type ReactNode } from 'react'

interface CardTiltProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  resetDuration?: number
}

export function CardTilt({ children, className = '', maxTilt = 6, resetDuration = 400 }: CardTiltProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouse = (x: number, y: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (x - cx) / (rect.width / 2)
    const dy = (y - cy) / (rect.height / 2)
    const tiltX = -dy * maxTilt
    const tiltY = dx * maxTilt
    el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    el.style.transition = 'transform 60ms linear'
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)'
    el.style.transition = `transform ${resetDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={e => handleMouse(e.clientX, e.clientY)}
      onMouseLeave={handleLeave}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
