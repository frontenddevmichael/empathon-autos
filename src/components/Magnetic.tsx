import { useRef, useCallback, type ReactNode, type CSSProperties } from 'react'

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
  style?: CSSProperties
}

/**
 * Magnetic wrapper — the child translates toward the cursor on hover
 * (desktop / fine pointer only), then eases back to center on leave.
 */
export function Magnetic({ children, strength = 0.35, className = '', style }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef({ x: 0, y: 0 })

  const apply = useCallback(() => {
    if (!ref.current) return
    const t = targetRef.current
    const cur = ref.current.style.transform
    const match = /translate3d\(([-\d.]+)px, ([-\d.]+)px, 0\)/.exec(cur || '')
    const cx = match ? parseFloat(match[1]) : 0
    const cy = match ? parseFloat(match[2]) : 0
    const nx = cx + (t.x - cx) * 0.2
    const ny = cy + (t.y - cy) * 0.2
    ref.current.style.transform = `translate3d(${nx.toFixed(2)}px, ${ny.toFixed(2)}px, 0)`
    if (Math.abs(t.x - nx) > 0.1 || Math.abs(t.y - ny) > 0.1) {
      rafRef.current = requestAnimationFrame(apply)
    } else {
      rafRef.current = null
    }
  }, [])

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el || (e.nativeEvent as PointerEvent).pointerType === 'touch') return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    targetRef.current = { x: relX * strength, y: relY * strength }
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(apply)
    }
  }, [strength, apply])

  const handleLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 }
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(apply)
    }
  }, [apply])

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: 'inline-block', willChange: 'transform', ...style }}
    >
      {children}
    </div>
  )
}
