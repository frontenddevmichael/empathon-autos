import { useEffect, useState, useRef } from 'react'

/**
 * A thin colored bar at the top of the page that fills as the user scrolls.
 * Renders inside a portal at the document level for accurate positioning.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const onScroll = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
        setProgress(pct)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  if (progress === 0) return null

  return ( 
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress * 100}%`,
        height: 2,
        background: 'var(--gold)',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'width 100ms linear',
        boxShadow: '0 0 8px rgba(208,208,208,0.6)',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  )
}
