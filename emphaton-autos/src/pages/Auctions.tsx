import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'
import { formatPrice, formatMileage } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AuctionTimer } from '@/components/ui/AuctionTimer'
import { Section } from '@/components/PageLayout'
import { Speedometer, HandCircle } from '@/components/DecoSvgs'
import styles from './Auctions.module.css'

interface AuctionVehicle {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  transmission: string
  fuel_type: string
  media: { url: string; is_primary: boolean }[]
  lot?: { id: string; current_bid: number; opening_bid: number; closes_at: string; status: string }[]
}

export function Auctions() {
  const mounted = useMounted()
  const [vehicles, setVehicles] = useState<AuctionVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchVehicles = useCallback(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    setFetchError(null)
    ;(async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('*, media:vehicle_media(*), lot:lots(*)').eq('status', 'in-auction')
        if (error) {
          console.error('[Auctions] Failed to load auction vehicles:', error.message)
          setFetchError('Could not load auctions. Please try again.')
        }
        if (!mounted.current) return
        if (data) setVehicles(data as unknown as AuctionVehicle[])
      } catch {
        if (mounted.current) setFetchError('Something went wrong. Please try again.')
      }
      if (mounted.current) setLoading(false)
    })()
  }, [])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  // Auto-close expired lots every 60s, re-fetch vehicles afterward
  useAutoCloseLots(fetchVehicles)

  return (
    <Section style={{ position: 'relative' }}>
      <Speedometer className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-2)', opacity: 0.04 }} size={56} />
      <HandCircle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.08 }} size={48} />
      <div className={styles.header}>
        <p className={styles.headerLabel}>Auction</p>
        <h2>Live Auctions</h2>
        <p>Bid on premium vehicles in real-time. Place your bid and drive away with the best deal.</p>
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
          <Button variant="secondary" size="sm" onClick={fetchVehicles}>Try Again</Button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className={styles.empty}>
          <p>No active auctions right now. <Link to="/inventory" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Browse inventory</Link> instead.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {vehicles.map(v => {
            const img = v.media?.find(m => m.is_primary) ?? v.media?.[0]
            return (
              <Link key={v.id} to={`/inventory/${v.id}`} className={styles.link}>
                <Card hoverable style={{ padding: 0 }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--paper-warm)', overflow: 'hidden' }}>
                    {img ? <img src={img.url} alt={`${v.make} ${v.model} ${v.year}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)', fontSize: 'var(--text-sm)' }}>No image</div>}
                  </div>
                  <div style={{ padding: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontWeight: 600 }}>{v.make} {v.model}</p>
                      <Badge variant="live" />
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{v.year} &middot; {formatMileage(v.mileage)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-1)' }}>
                      <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--navy)' }}>
                        {v.lot?.[0] ? formatPrice(v.lot[0].current_bid) : 'Bidding opens soon'}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{v.lot?.[0] ? <AuctionTimer closesAt={v.lot[0].closes_at} /> : ''}</p>
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
