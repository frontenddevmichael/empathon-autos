import { useRef, useEffect } from 'react'

/**
 * Returns a ref that tracks whether the component is currently mounted.
 * Use in async useEffect callbacks to avoid state updates on unmounted components.
 * 
 * @example
 * ```tsx
 * const mounted = useMounted()
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (!mounted.current) return
 *     setState(data)
 *   })
 * }, [])
 * ```
 */
export function useMounted() {
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  return mounted
}
