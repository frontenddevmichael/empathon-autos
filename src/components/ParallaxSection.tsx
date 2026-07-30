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
        const offset = Math.max(-20, Math.min(20, (scrollProgress - 0.5) * speed * 100))
        el.style.transform = `translateY(${offset}%)`
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
    <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div ref={bgRef} className="scroll-parallax" style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}
