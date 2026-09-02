import { useRef, useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface TextRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  speed?: number
}

export function TextReveal({ text, as: Tag = 'p', className = '', delay = 0, speed = 50 }: TextRevealProps) {
  const [visible, setVisible] = useState<boolean[]>(new Array(text.length).fill(false))
  const [ref, inView] = useInView({ threshold: 0.1 })
  const triggered = useRef(false)

  useEffect(() => {
    if (!inView || triggered.current) return
    triggered.current = true
    text.split('').forEach((_, i) => {
      const jank = Math.random() * speed * 0.6
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, delay + i * speed * (0.4 + Math.random() * 0.6) + jank)
    })
  }, [inView, text, delay, speed])

  const El = Tag as any
  return (
    <El ref={ref} className={className} style={{ display: 'inline' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline',
            opacity: visible[i] ? 1 : 0,
            filter: visible[i] ? 'blur(0)' : 'blur(4px)',
            transitionProperty: 'opacity, filter',
            transitionDuration: '80ms',
            transitionTimingFunction: 'steps(3, jump-none)',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </El>
  )
}
