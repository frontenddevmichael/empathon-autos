import { useRef, useEffect, type ReactNode } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
  style?: React.CSSProperties
}

export function ParallaxSection({ children, speed = 0.3, className, style }: ParallaxSectionProps) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return
    let frame: number
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
        // Small fixed-pixel drift (never a percentage of height) so content
        // never clips into or overlaps neighbouring sections.
        const offset = Math.max(-12, Math.min(12, (scrollProgress - 0.5) * speed * 80))
        el.style.transform = `translateY(${offset}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [speed])

  return (
    // Sections carry their own generous vertical padding (var(--section-y)),
    // which absorbs the small drift — content never clips or overlaps neighbours.
    <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div ref={bgRef} className="scroll-parallax" style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}
