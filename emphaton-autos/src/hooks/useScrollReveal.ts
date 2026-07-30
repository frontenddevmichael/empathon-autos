import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Global scroll reveal — observes all `.scroll-reveal` and `.scroll-reveal-child`
 * elements in the DOM and adds `.revealed` when they enter the viewport.
 *
 * Uses a MutationObserver to catch lazy-loaded elements that mount after the
 * initial DOM scan — critical for Suspense/lazy routes.
 *
 * Call once in the root component (App.tsx).
 */
export function useScrollReveal() {
  const { pathname } = useLocation()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mutationRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    // Disconnect any previous observers
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (mutationRef.current) {
      mutationRef.current.disconnect()
      mutationRef.current = null
    }

    const createObserver = () => {
      if (observerRef.current) observerRef.current.disconnect()
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
      )
      observerRef.current = observer
      return observer
    }

    const scanAndObserve = () => {
      const observer = createObserver()
      const targets = document.querySelectorAll('.scroll-reveal:not(.revealed), .scroll-reveal-child:not(.revealed)')
      targets.forEach(el => observer.observe(el))
    }

    // Initial scan after a tiny delay to let the current render commit
    const initialTimer = setTimeout(scanAndObserve, 50)

    // MutationObserver catches lazy-loaded/revealed-after-navigation content
    const mutationObserver = new MutationObserver(() => {
      const targets = document.querySelectorAll('.scroll-reveal:not(.revealed), .scroll-reveal-child:not(.revealed)')
      if (targets.length === 0) return
      // Ensure observer is still alive
      const obs = observerRef.current ?? createObserver()
      targets.forEach(el => obs.observe(el))
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
    mutationRef.current = mutationObserver

    return () => {
      clearTimeout(initialTimer)
      if (observerRef.current) observerRef.current.disconnect()
      if (mutationRef.current) mutationRef.current.disconnect()
    }
  }, [pathname])
}
