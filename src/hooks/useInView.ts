import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  threshold?: number
  /** Re-trigger every time the element scrolls in and out, instead of one-shot */
  repeat?: boolean
}

/** One IntersectionObserver hook to power all scroll-reveal components.
 *  Returns a ref and whether the element is (or has been) in view. */
export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.1, repeat } = options
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (!repeat) obs.disconnect()
        } else if (repeat) {
          setInView(false)
        }
      },
      { threshold },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, repeat])

  return [ref, inView] as const
}
