import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'
import { Section } from '@/components/layout/Section'
import { PageHero } from '@/components/ui/PageHero'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { AuctionLotCard } from '@/components/ui/AuctionLotCard'
import type { Lot } from '@/types'
import styles from './Auctions.module.css'

const LIVE_STATUSES = ['scheduled', 'open', 'closing']
const PAST_STATUSES = ['closed', 'sold', 'unsold']

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
    <>
      <PageHero
        images={[
          { url: '/heroimg.jpg' },
          { url: '/heroimg2.jpg' },
        ]}
        label="Auction"
        title="Live Auctions"
        subtitle="Real-time bidding on premium vehicles. Place your bid, win your drive."
        size="lg"
      />

      <Section space="sm">
        <div className={styles.tabs} role="tablist" aria-label="Auction tabs">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'live'}
            className={`${styles.tab} ${tab === 'live' ? styles.tabActive : ''}`}
            onClick={() => setTab('live')}
          >
            Live &amp; Upcoming<span className={styles.tabCount}>{liveCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'past'}
            className={`${styles.tab} ${tab === 'past' ? styles.tabActive : ''}`}
            onClick={() => setTab('past')}
          >
            Past Auctions<span className={styles.tabCount}>{pastCount}</span>
          </button>
        </div>

        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-label="Loading auctions">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : fetchError ? (
          <div className={styles.empty}>
            <p className={styles.errorText}>{fetchError}</p>
            <Button variant="secondary" size="sm" onClick={fetchLots}>Try Again</Button>
          </div>
        ) : tab === 'live' ? (
          liveLots.length === 0 ? (
            <EmptyState
              title="No Live Auctions Right Now"
              message="We're preparing the next round of lots. While you wait, the full collection is ready to explore."
              action={
                <Link to="/inventory">
                  <Button size="sm" variant="secondary">Browse Inventory</Button>
                </Link>
              }
            />
          ) : (
            <div className={`scroll-reveal ${styles.grid} stagger-fade-in`}>
              {liveLots.map(lot => (
                <AuctionLotCard key={lot.id} lot={lot} variant="live" />
              ))}
            </div>
          )
        ) : (
          pastLots.length === 0 ? (
            <EmptyState
              title="No Past Auctions Yet"
              message="Once the first lot closes, its results — winning bid and final price — will appear here."
              action={
                <Button size="sm" variant="secondary" onClick={() => setTab('live')}>View Live Auctions</Button>
              }
            />
          ) : (
            <div className={`scroll-reveal ${styles.grid} stagger-fade-in`}>
              {pastLots.map(lot => (
                <AuctionLotCard key={lot.id} lot={lot} variant="past" />
              ))}
            </div>
          )
        )}
      </Section>
    </>
  )
}
