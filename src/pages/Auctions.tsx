import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'
import { formatPrice, formatMileage } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AuctionTimer } from '@/components/ui/AuctionTimer'
import { Section } from '@/components/PageLayout'
import styles from './Auctions.module.css'
import { RippleButton } from '@/components/RippleButton'
import { HeroSection } from '@/components/HeroSection'

interface AuctionLot {
  id: string
  status: string
  current_bid: number
  opening_bid: number
  opens_at?: string | null
  closes_at: string
  vehicles: {
    id: string
    make: string
    model: string
    year: number
    mileage: number
    transmission: string
    fuel_type: string
    media: { url: string; is_primary: boolean }[]
  } | null
}

export function Auctions() {
  const mounted = useMounted()
  const [lots, setLots] = useState<AuctionLot[]>([])
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
          .select('*, vehicles:vehicle_id(*, media:vehicle_media(*))')
          .in('status', ['scheduled', 'open', 'closing'])
          .order('created_at')
        if (error) {
          console.error('[Auctions] Failed to load auction lots:', error.message)
          setFetchError('Could not load auctions. Please try again.')
        }
        if (!mounted.current) return
        if (data) setLots(data as unknown as AuctionLot[])
      } catch {
        if (mounted.current) setFetchError('Something went wrong. Please try again.')
      }
      if (mounted.current) setLoading(false)
    })()
  }, [])

  useEffect(() => { fetchLots() }, [fetchLots])

  // Auto-close expired lots every 60s, re-fetch vehicles afterward
  useAutoCloseLots(fetchLots)

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
      ) : lots.length === 0 ? (
        <div className={styles.empty}>
          <p>No active auctions right now. <Link to="/inventory" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Browse inventory</Link> instead.</p>
        </div>
      ) : (
        <div className={`scroll-reveal ${styles.grid} stagger-fade-in`}>
          {lots.map(lot => {
            const v = lot.vehicles
            if (!v) return null
            const img = v.media?.find(m => m.is_primary) ?? v.media?.[0]
            const isOpen = lot.status === 'open' || lot.status === 'closing'
            const hasBid = lot.current_bid > 0
            return (
              <Link key={lot.id} to={`/auctions/${lot.id}`} className={styles.link}>
                <Card hoverable style={{ padding: 0 }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--paper-warm)', overflow: 'hidden' }}>
                    {img ? <img src={img.url} alt={`${v.make} ${v.model} ${v.year}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)', fontSize: 'var(--text-sm)' }}>No image</div>}
                  </div>
                  <div style={{ padding: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontWeight: 600 }}>{v.make} {v.model}</p>
                      {isOpen ? <Badge variant="live" /> : <Badge variant="draft" label="Scheduled" />}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{v.year} &middot; {formatMileage(v.mileage)}</p>
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
      )}
    </Section>
  )
}
