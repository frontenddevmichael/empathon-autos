import { useRef, type ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltAmount?: number
}

export function TiltCard({ children, className, tiltAmount = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    const tiltX = (y - 0.5) * -tiltAmount
    const tiltY = (x - 0.5) * tiltAmount
    el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
