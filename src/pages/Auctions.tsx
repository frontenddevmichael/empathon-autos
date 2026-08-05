import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'
import { formatPrice, formatMileage } from '@/lib/format'
import { firstName } from '@/lib/auction'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AuctionTimer } from '@/components/ui/AuctionTimer'
import { Section } from '@/components/PageLayout'
import styles from './Auctions.module.css'
import { RippleButton } from '@/components/RippleButton'
import { HeroSection } from '@/components/HeroSection'
import type { Lot } from '@/types'

const LIVE_STATUSES = ['scheduled', 'open', 'closing']
const PAST_STATUSES = ['closed', 'sold', 'unsold']

function lotTitle(l: Lot): string {
  if (l.title) return l.title
  const own = [l.make, l.model].filter(Boolean).join(' ')
  if (own) return own
  if (l.vehicles) return `${l.vehicles.make} ${l.vehicles.model}`
  return 'Untitled lot'
}

function lotYear(l: Lot): number | string | null {
  if (l.year) return l.year
  return l.vehicles?.year || null
}

function lotMileage(l: Lot): number {
  return l.mileage || l.vehicles?.mileage || 0
}

function primaryImage(l: Lot): string | undefined {
  return l.media?.find(m => m.is_primary)?.url ?? l.media?.[0]?.url ?? l.vehicles?.media?.find(m => m.is_primary)?.url ?? l.vehicles?.media?.[0]?.url
}

export function Auctions() {
  const mounted = useMounted()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: 'live' | 'past' = searchParams.get('tab') === 'past' ? 'past' : 'live'
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchLots = useCallback(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    setFetchError(null)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('lots')
          .select('*, vehicles:vehicle_id(*, media:vehicle_media(*)), media:lot_media(*), faults:lot_faults(*)')
          .order('created_at')
        if (error) {
          console.error('[Auctions] Failed to load auction lots:', error.message)
          setFetchError('Could not load auctions. Please try again.')
        }
        if (!mounted.current) return
        if (data) setLots(data as unknown as Lot[])
      } catch {
        if (mounted.current) setFetchError('Something went wrong. Please try again.')
      }
      if (mounted.current) setLoading(false)
    })()
  }, [])

  useEffect(() => { fetchLots() }, [fetchLots])

  // Poll for server-side status transitions (opened/closed by cron), re-fetch afterward.
  useAutoCloseLots(fetchLots)

  const liveLots = lots.filter(l => LIVE_STATUSES.includes(l.status))
  const pastLots = [...lots.filter(l => PAST_STATUSES.includes(l.status))].sort((a, b) => new Date(b.closes_at).getTime() - new Date(a.closes_at).getTime())

  const setTab = (next: 'live' | 'past') => {
    setSearchParams(next === 'past' ? { tab: 'past' } : {}, { replace: true })
  }

  const liveCount = liveLots.length
  const pastCount = pastLots.length

  return (
    <Section style={{ position: 'relative' }}>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1774578432996-54e195b3c5b0?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
        ]}
        label="Auction"
        title="Live Auctions"
        subtitle="Real-time bidding on premium vehicles. Place your bid, win your drive."
        deco="circle"
      />
      <div className="section-divider" />

      <div className={styles.tabs} role="tablist" aria-label="Auction tabs">
        <button
          role="tab"
          aria-selected={tab === 'live'}
          className={`${styles.tab} ${tab === 'live' ? styles.tabActive : ''}`}
          onClick={() => setTab('live')}
        >
          Live &amp; Upcoming<span className={styles.tabCount}>{liveCount}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'past'}
          className={`${styles.tab} ${tab === 'past' ? styles.tabActive : ''}`}
          onClick={() => setTab('past')}
        >
          Past Auctions<span className={styles.tabCount}>{pastCount}</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '4/3', background: 'var(--border)', borderRadius: 'var(--radius-lg)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : fetchError ? (
        <div className={styles.empty}>
          <p style={{ color: 'var(--error)', marginBottom: 'var(--space-2)' }}>{fetchError}</p>
          <RippleButton variant="secondary" size="sm" onClick={fetchLots}>Try Again</RippleButton>
        </div>
      ) : tab === 'live' ? (
        liveLots.length === 0 ? (
          <div className={styles.empty}>
            <p>No active auctions right now. <Link to="/inventory" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Browse inventory</Link> instead.</p>
          </div>
        ) : (
          <div className={`scroll-reveal ${styles.grid} stagger-fade-in`}>
            {liveLots.map(lot => {
              const img = primaryImage(lot)
              const isOpen = lot.status === 'open' || lot.status === 'closing'
              const hasBid = lot.current_bid > 0
              const title = lotTitle(lot)
              const year = lotYear(lot)
              return (
                <Link key={lot.id} to={`/auctions/${lot.id}`} className={styles.link}>
                  <Card hoverable style={{ padding: 0 }}>
                    <div style={{ aspectRatio: '4/3', background: 'var(--paper-warm)', overflow: 'hidden' }}>
                      {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)', fontSize: 'var(--text-sm)' }}>No image</div>}
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontWeight: 600 }}>{title}</p>
                        {isOpen ? <Badge variant="live" /> : <Badge variant="draft" label="Scheduled" />}
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{year ? `${year} · ` : ''}{formatMileage(lotMileage(lot))}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-1)' }}>
                        <div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{hasBid ? 'Current bid' : 'Opening bid'}</p>
                          <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--navy)' }}>
                            {formatPrice(hasBid ? lot.current_bid : lot.opening_bid)}
                          </p>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{isOpen ? <AuctionTimer closesAt={lot.closes_at} /> : 'Bidding opens soon'}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )
      ) : (
        pastLots.length === 0 ? (
          <div className={styles.empty}>
            <p>No past auctions yet. Check back after the first lot closes.</p>
          </div>
        ) : (
          <div className={`scroll-reveal ${styles.grid} stagger-fade-in`}>
            {pastLots.map(lot => {
              const img = primaryImage(lot)
              const title = lotTitle(lot)
              const year = lotYear(lot)
              const winner = lot.status === 'sold' ? firstName(lot.winner_name) : null
              return (
                <Link key={lot.id} to={`/auctions/${lot.id}`} className={styles.link}>
                  <Card hoverable style={{ padding: 0 }}>
                    <div style={{ aspectRatio: '4/3', background: 'var(--paper-warm)', overflow: 'hidden' }}>
                      {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: lot.status !== 'sold' ? 'grayscale(0.4)' : undefined }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)', fontSize: 'var(--text-sm)' }}>No image</div>}
                    </div>
                    <div style={{ padding: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontWeight: 600 }}>{title}</p>
                        {lot.status === 'sold' ? <Badge variant="sold" /> : <Badge variant="draft" label={lot.status === 'closed' ? 'Closed' : 'Unsold'} />}
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{year ? `${year} · ` : ''}{new Date(lot.closes_at).toLocaleDateString()}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-1)' }}>
                        <div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                            {lot.status === 'sold' ? (winner ? `Won by ${winner}` : 'Sold') : lot.current_bid > 0 ? 'Reserve not met' : 'No winning bid'}
                          </p>
                          <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: lot.status === 'sold' ? 'var(--navy)' : 'var(--stone)' }}>
                            {lot.status === 'sold' ? formatPrice(lot.current_bid) : '—'}
                          </p>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>View details</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )
      )}
    </Section>
  )
}
