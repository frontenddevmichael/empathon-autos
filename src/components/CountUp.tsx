import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface CountUpProps {
  end: number
  suffix?: string
  duration?: number
  delay?: number
  className?: string
}

export function CountUp({ end, suffix = '', duration = 1200, delay = 0, className = '' }: CountUpProps) {
  const [val, setVal] = useState(0)
  const [ref, inView] = useInView({ threshold: 0.1 })
  const triggered = useRef(false)

  useEffect(() => {
    if (!inView || triggered.current) return
    triggered.current = true
    const start = performance.now() + delay
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.floor(eased * end))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration, delay])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {val.toLocaleString()}{suffix}
    </span>
  )
}
