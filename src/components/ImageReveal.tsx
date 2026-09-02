import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import styles from './ImageReveal.module.css'

interface ImageRevealProps {
  src: string
  alt?: string
  className?: string
  delay?: number
}

export function ImageReveal({ src, alt = '', className = '', delay = 0 }: ImageRevealProps) {
  const [ref, inView] = useInView({ threshold: 0.1 })
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setRevealed(true), delay)
    return () => clearTimeout(t)
  }, [inView, delay])

  return (
    <div ref={ref} className={`${styles.wrapper} ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${styles.clip} ${revealed ? styles.revealed : ''}`}
        loading="lazy"
      />
    </div>
  )
}
