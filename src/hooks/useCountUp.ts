import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to the target value with easing.
 * @param target - final value to count up to
 * @param duration - animation duration in ms
 * @param delay - delay before starting in ms
 */
export function useCountUp(target: number, duration = 1500, delay = 0): number {
  const [current, setCurrent] = useState(0)
  const ref = useRef(0)

  useEffect(() => {
    if (target <= 0) return
    const startTime = performance.now() + delay
    let frame: number

    const animate = (now: number) => {
      if (now < startTime) {
        frame = requestAnimationFrame(animate)
        return
      }
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(eased * target)
      if (value !== ref.current) {
        ref.current = value
        setCurrent(value)
      }
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, delay])

  return current
}
