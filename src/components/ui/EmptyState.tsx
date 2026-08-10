import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EmptyCarSearch, EmptyOpenBook, EmptyAuctionGavel } from '@/components/DecoSvgs'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  art?: 'search' | 'book' | 'auction'
  title: string
  message?: string
  action?: ReactNode
  className?: string
}

/**
 * A designed empty state — monoline line art that draws itself on reveal,
 * one clear next action, never a blank page with plain text.
 */
export function EmptyState({ art = 'search', title, message, action, className = '' }: EmptyStateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const Art = art === 'book' ? EmptyOpenBook : art === 'auction' ? EmptyAuctionGavel : EmptyCarSearch

  return (
    <div ref={ref} className={`${styles.root} ${visible ? styles.visible : ''} ${className}`}>
      <div className={styles.art}>
        <Art size={120} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
