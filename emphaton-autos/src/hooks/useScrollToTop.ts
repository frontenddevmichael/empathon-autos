import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the top of the page on every route change.
 * Uses requestAnimationFrame so the scroll happens after React has committed
 * the new page's DOM — critical for lazy-loaded routes.
 */
export function useScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => cancelAnimationFrame(raf)
  }, [pathname])
}
