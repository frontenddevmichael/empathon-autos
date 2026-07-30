import { useEffect, useState } from 'react'

interface AuctionTimerProps {
  closesAt: string
  className?: string
  style?: React.CSSProperties
}

export function AuctionTimer({ closesAt, className = '', style }: AuctionTimerProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeLeft = Math.max(0, new Date(closesAt).getTime() - now)

  if (timeLeft <= 0) {
    return <span className={className} style={style}>Auction ended</span>
  }

  const days = Math.floor(timeLeft / 86_400_000)
  const hours = Math.floor((timeLeft % 86_400_000) / 3_600_000)
  const mins = Math.floor((timeLeft % 3_600_000) / 60_000)
  const secs = Math.floor((timeLeft % 60_000) / 1000)

  return (
    <span className={`tabular-nums ${className}`} style={style}>
      {days > 0 && `${days}d `}
      {hours}h {String(mins).padStart(2, '0')}m {String(secs).padStart(2, '0')}s
    </span>
  )
}

/**
 * Compute urgency color based on time remaining.
 * Red if < 1 hour, default otherwise.
 */
export function auctionTimeColor(timeLeftMs: number, fallback = 'var(--ink)'): string {
  return timeLeftMs < 3_600_000 ? 'var(--live)' : fallback
}
