import { useCallback, useRef } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  delay?: number
  index?: number
}

/**
 * Returns a callback ref that sets the element to hidden initially and
 * reveals it (with a staggered, janky delay) when it scrolls into view.
 * Uses a callback ref instead of useInView to avoid the double-effect flash
 * that can occur when an element is already in the viewport on mount.
 */
export function useScrollReveal(options?: ScrollRevealOptions) {
  const obsRef = useRef<IntersectionObserver | null>(null)
  const hasPlayed = useRef(false)

  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return

    const jank = options?.index != null ? (options.index % 7) * 40 + Math.random() * 60 : 0
    const totalDelay = (options?.delay ?? 0) + jank

    el.style.opacity = '0'
    el.style.transform = 'translateY(32px)'
    el.style.transition = `opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${totalDelay}ms, transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${totalDelay}ms`

    if (obsRef.current) obsRef.current.disconnect()
    obsRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasPlayed.current) return
          hasPlayed.current = true
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          obsRef.current?.disconnect()
        }
      },
      { threshold: options?.threshold ?? 0.1 },
    )
    obsRef.current.observe(el)
  }, [options?.threshold, options?.delay, options?.index])

  return ref
}
