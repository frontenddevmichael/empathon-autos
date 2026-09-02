import { useEffect, useRef } from 'react'

export function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect()
        const viewportMid = window.innerHeight / 2
        const elMid = rect.top + rect.height / 2
        const dist = (elMid - viewportMid) / window.innerHeight
        const offset = dist * speed * 40
        el!.style.transform = `translateY(${offset.toFixed(1)}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame.current) }
  }, [speed])

  return ref
}
