import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000, decimals = 0, className }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!revealed) return
    let start = 0
    const step = target / (duration / 16)
    let frame: number
    const tick = () => {
      start += step
      if (start < target) {
        setCount(start)
        frame = requestAnimationFrame(tick)
      } else {
        setCount(target)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [revealed, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}
