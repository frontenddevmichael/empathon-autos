import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/SeoHead'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Section } from '@/components/PageLayout'
import { ScrollReveal } from '@/components/ScrollReveal'
import { getAuctionVehicles } from '@/lib/queries'
import type { AuctionVehicle } from '@/lib/queries'
import styles from './Auctions.module.css'

function AuctionTimer({ closesAt }: { closesAt: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const timeLeft = Math.max(0, new Date(closesAt).getTime() - now)
  const days = Math.floor(timeLeft / 86400000)
  const hours = Math.floor((timeLeft % 86400000) / 3600000)
  const mins = Math.floor((timeLeft % 3600000) / 60000)
  const secs = Math.floor((timeLeft % 60000) / 1000)

  return (
    <span>
      {timeLeft > 0
        ? `${days}d ${hours}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
        : 'Auction ended'}
    </span>
  )
}

export function Auctions() {
  const [vehicles, setVehicles] = useState<AuctionVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getAuctionVehicles()
      .then(setVehicles)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Section>
      <SeoHead title="Live Auctions" description="Bid on premium vehicles in real-time. Live auctions for Toyota, Honda, Mercedes-Benz and more." />
      <div className={styles.header}>
        <p className={styles.headerLabel}>Auction</p>
        <h2>Live Auctions</h2>
        <p>Bid on premium vehicles in real-time.</p>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardImgPlaceholder} />
              <div className={styles.cardBody}>
                <div style={{ height: 16, width: '60%', background: 'var(--border)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 12, width: '40%', background: 'var(--border)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <p style={{ color: 'var(--error)' }}>Failed to load auctions. Please try again later.</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <p className={styles.empty}>No active auctions right now. Check back soon.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {vehicles.map((v, i) => {
            const img = v.media?.find(m => m.is_primary) ?? v.media?.[0]
            return (
              <ScrollReveal key={v.id} delay={i * 80}>
                <Link to={`/auctions/${v.lot?.id}`} className={styles.link}>
                  <Card hoverable className={styles.card}>
                      {img ? (
                      <img src={img.url} alt={`${v.make} ${v.model} ${v.year}`} className={styles.cardImg} />
                    ) : (
                      <div className={styles.cardImgPlaceholder}>No image</div>
                    )}
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <div>
                          <p className={styles.cardTitle}>{v.make} {v.model}</p>
                          <p className={styles.cardMeta}>{v.year} &middot; {v.mileage.toLocaleString()} km</p>
                        </div>
                        <Badge variant="live" />
                      </div>
                      <p className={`${styles.cardBid} tabular-nums`}>₦{v.lot ? (v.lot.current_bid / 1_000_000).toFixed(1) : '0'}M</p>
                      <p className={styles.cardTimer}>{v.lot ? <AuctionTimer closesAt={v.lot.closes_at} /> : ''}</p>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </Section>
  )
}
