import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Global smooth-scroll driver using Lenis.
 * - Skipped entirely for users who prefer reduced motion.
 * - Exposes the Lenis instance on `window.__lenis` so other components
 *   (e.g. Nav scroll detection) can subscribe without re-initializing.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
    })
    lenisRef.current = lenis
    ;(window as any).__lenis = lenis

    let frame: number
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      ;(window as any).__lenis = undefined
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
