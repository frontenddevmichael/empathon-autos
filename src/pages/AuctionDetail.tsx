import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { formatPrice, formatMileage } from '@/lib/format'
import { getLotDeadline, computeBidIncrement, SEVERITY_META, GRADE_META, firstName, lotTitle } from '@/lib/auction'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AuctionTimer } from '@/components/ui/AuctionTimer'
import { SpecTable } from '@/components/ui/SpecTable'
import { Section } from '@/components/layout/Section'
import { useToast } from '@/context/ToastContext'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'
import type { Lot, Bid, LotMedia } from '@/types'
import styles from './AuctionDetail.module.css'

const ERROR_MESSAGES: Record<string, string> = {
  LOT_NOT_FOUND: 'Auction not found',
  LOT_NOT_OPEN: 'This auction is no longer open for bidding',
  AUCTION_ENDED: 'This auction has ended',
  BELOW_CURRENT: 'Bid must exceed the current bid',
  BELOW_INCREMENT: 'Bid is below the minimum bid increment',
  BELOW_OPENING: 'Bid must exceed the opening bid',
}

export function AuctionDetail() {
  const { lotId } = useParams<{ lotId: string }>()
  const { showToast } = useToast()
  const [lot, setLot] = useState<Lot | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidderName, setBidderName] = useState('')
  const [bidderEmail, setBidderEmail] = useState('')
  const [bidderPhone, setBidderPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const fetchAll = useCallback(() => {
    if (!lotId) return
    ;(async () => {
      const { data } = await supabase
        .from('lots')
        .select('*, vehicles:vehicle_id(*, media:vehicle_media(*)), media:lot_media(*), faults:lot_faults(*)')
        .eq('id', lotId)
        .single()
      if (data) setLot(data as unknown as Lot)
      setLoading(false)
    })()
    ;(async () => {
      const { data } = await supabase.from('bids').select('*').eq('lot_id', lotId).order('placed_at', { ascending: false }).limit(50)
      if (data) setBids(data as unknown as Bid[])
    })()
  }, [lotId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Poll for server-side status transitions so the page reflects close without a reload.
  useAutoCloseLots(fetchAll)

  // Escape closes the image lightbox
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  const lotRef = useRef(lot)
  lotRef.current = lot

  useEffect(() => {
    if (!lotId) return
    const channel = supabase.channel(`bids:${lotId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `lot_id=eq.${lotId}` }, (payload: RealtimePostgresChangesPayload<Bid>) => {
        const newBid = payload.new as Bid
        setBids(prev => [newBid, ...prev].slice(0, 50))
        const currentLot = lotRef.current
        if (currentLot && newBid.amount > currentLot.current_bid) {
          setLot(prev => prev ? { ...prev, current_bid: newBid.amount } : prev)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [lotId])

  const placeBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lotId || !lot) return

    if (lot.status !== 'open' && lot.status !== 'closing') {
      showToast('This auction is no longer open for bidding', 'error')
      return
    }
    const deadline = new Date(getLotDeadline(lot)).getTime()
    if (deadline - Date.now() <= 0) {
      showToast('This auction has ended', 'error')
      return
    }
    if (!bidderName.trim() || !bidderEmail.trim()) {
      showToast('Please enter your name and email', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bidderEmail.trim())) {
      showToast('Please enter a valid email address', 'error')
      return
    }
    const amount = parseFloat(bidAmount.replace(/,/g, ''))
    if (!amount || amount <= 0) {
      showToast('Please enter a valid bid amount', 'error')
      return
    }
    if (amount > 9_999_999_999) {
      showToast('Bid amount is too large', 'error')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase.rpc('place_bid', {
        p_lot_id: lotId,
        p_amount: amount,
        p_name: bidderName.trim(),
        p_email: bidderEmail.trim(),
        p_phone: bidderPhone.trim(),
      })
      if (error) {
        showToast(error.message || 'Failed to place bid', 'error')
      } else {
        const result = data as { ok?: boolean; code?: string; current_bid?: number; status?: string; deadline?: string; is_buy_now?: boolean }
        if (result?.ok) {
          if (result.is_buy_now) {
            showToast('Buy Now purchase successful! This lot is now yours.')
          } else {
            showToast('Bid placed successfully')
          }
          setBidAmount('')
          setLot(prev => prev ? {
            ...prev,
            current_bid: result.current_bid ?? prev.current_bid,
            status: (result.status as Lot['status']) ?? prev.status,
            extended_until: result.deadline ?? prev.extended_until,
            current_bidder_name: bidderName.trim(),
            winner_name: result.is_buy_now ? bidderName.trim() : prev.winner_name,
            winner_email: result.is_buy_now ? bidderEmail.trim() : prev.winner_email,
            sold_at: result.is_buy_now ? new Date().toISOString() : prev.sold_at,
          } : prev)
        } else {
          showToast(ERROR_MESSAGES[result?.code || ''] || 'Bid rejected', 'error')
        }
      }
    } catch {
      showToast('Network error. Please try again', 'error')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Section space="sm">
        <div className={styles.layout}>
          <div>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonLines}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonLine} />
              ))}
            </div>
          </div>
          <div className={styles.skeletonPanel}>
            <div className={styles.skeletonBar} style={{ width: '60%', height: 24 }} />
            <div className={styles.skeletonBar} style={{ width: '40%' }} />
            <div className={styles.skeletonPrice} />
            <div className={styles.skeletonCta} />
          </div>
        </div>
      </Section>
    )
  }

  if (!lot) {
    return (
      <Section space="sm">
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Auction not found</h1>
          <p className={styles.emptyText}>This lot may have closed or been removed.</p>
          <Link to="/auctions"><Button variant="secondary">Back to Auctions</Button></Link>
        </div>
      </Section>
    )
  }

  const images: (LotMedia | undefined)[] = lot.media?.length
    ? [...lot.media].sort((a, b) => a.sort_order - b.sort_order)
    : (lot.vehicles?.media as unknown as LotMedia[] | undefined) || []
  const imagesList = images.filter(Boolean)
  const sortedByPrimary = [...imagesList].sort((a, b) => (b?.is_primary ? 1 : 0) - (a?.is_primary ? 1 : 0))
  const active = sortedByPrimary[Math.min(activeImage, sortedByPrimary.length - 1)]

  const title = lotTitle(lot)
  const year = lot.year || lot.vehicles?.year || null
  const mileage = lot.mileage || lot.vehicles?.mileage || 0
  const transmission = lot.transmission || lot.vehicles?.transmission || 'Not stated'
  const fuel = lot.fuel_type || lot.vehicles?.fuel_type || 'Not stated'
  const colour = lot.colour || lot.vehicles?.colour || 'Not stated'
  const vCondition = lot.vehicles?.condition || 'Not stated'

  const deadline = getLotDeadline(lot)
  const timeLeft = Math.max(0, new Date(deadline).getTime() - Date.now())
  const isOpen = lot.status === 'open' || lot.status === 'closing'
  const reserveMet = lot.reserve_price > 0 && lot.current_bid >= lot.reserve_price
  const hasReserve = lot.reserve_price > 0
  const nextIncrement = computeBidIncrement(lot.current_bid, lot.bid_increment)

  // Buy Now logic: show button only if buy_now_price is set AND current bid is below it
  const hasBuyNow = (lot as any).buy_now_price != null && (lot as any).buy_now_price > 0
  const buyNowPrice = (lot as any).buy_now_price as number | null
  const showBuyNow = hasBuyNow && isOpen && buyNowPrice != null && lot.current_bid < buyNowPrice

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.emphatonautos.com'
  const auctionTitle = `${title} Auction | Empathon Autos`
  const auctionDesc = `Bidding on a ${title} (${year || 'year TBD'}). Current bid: ${formatPrice(lot.current_bid)}. ${formatMileage(mileage)}, ${transmission}.`
  const auctionImg = active?.url || '/og-image.jpg'
  const winner = lot.status === 'sold' ? firstName(lot.winner_name) : null

  const specs: [string, string][] = [
    ['Make', lot.make || lot.vehicles?.make || 'Not stated'],
    ['Model', lot.model || lot.vehicles?.model || 'Not stated'],
    ['Year', year ? String(year) : 'Not stated'],
    ['Mileage', formatMileage(mileage)],
    ['Transmission', transmission],
    ['Fuel', fuel],
    ['Colour', colour],
    ['Condition', vCondition],
  ]

  return (
    <>
      <Helmet>
        <title>{auctionTitle}</title>
        <meta name="description" content={auctionDesc} />
        <meta property="og:title" content={auctionTitle} />
        <meta property="og:description" content={auctionDesc} />
        <meta property="og:image" content={auctionImg} />
        <meta property="og:url" content={`${siteUrl}/auctions/${lot.id}`} />
        <link rel="canonical" href={`${siteUrl}/auctions/${lot.id}`} />
      </Helmet>

      {lightbox && (
        <div
          className={styles.lightbox}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image"
        >
          <img src={lightbox} alt="Full size" className={styles.lightboxImage} />
        </div>
      )}

      <Section space="sm">
        <Link to="/auctions" className={styles.back}>&larr; Back to Auctions</Link>

        <div className={styles.layout}>
          {/* ── Gallery + condition report ── */}
          <div>
            <div className={styles.gallery}>
              {active ? (
                <img
                  src={active.url}
                  alt={title}
                  onClick={() => setLightbox(active.url)}
                  className={styles.mainImage}
                />
              ) : (
                <div className={styles.noImage}>No image</div>
              )}

              {sortedByPrimary.length > 1 && (
                <div className={styles.thumbs}>
                  {sortedByPrimary.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`${styles.thumb} ${i === Math.min(activeImage, sortedByPrimary.length - 1) ? styles.thumbActive : ''}`}
                      aria-label={`Image ${i + 1}`}
                      aria-current={i === Math.min(activeImage, sortedByPrimary.length - 1)}
                    >
                      <img src={img?.url} alt="" className={styles.thumbImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.panelSpaced}>
              <SpecTable rows={specs.map(([label, value]) => ({ label, value }))} />
            </div>

            {(lot.condition_grade || (lot.faults && lot.faults.length > 0)) && (
              <div className={`${styles.panel} ${styles.panelSpaced}`}>
                <h2 className={styles.panelTitle}>Condition Report</h2>
                {lot.condition_grade && GRADE_META[lot.condition_grade] && (
                  <div className={styles.gradeRow}>
                    <span className={styles.gradeBadge}>
                      {lot.condition_grade}
                    </span>
                    <span className={styles.gradeLabel}>{GRADE_META[lot.condition_grade].label}</span>
                  </div>
                )}
                {(lot.faults && lot.faults.length > 0) ? (
                  <div className={styles.faults}>
                    {[...lot.faults].sort((a, b) => a.sort_order - b.sort_order).map(f => {
                      return (
                        <div key={f.id} className={styles.fault}>
                          <span className={styles.faultBadge}>{SEVERITY_META[f.severity].label}</span>
                          <div className={styles.faultBody}>
                            <p className={styles.faultTitle}>{f.title}</p>
                            {f.description && <p className={styles.faultDesc}>{f.description}</p>}
                            {f.image_url && (
                              <button type="button" onClick={() => setLightbox(f.image_url)} className={styles.faultProof}>
                                <img src={f.image_url} alt={`Proof: ${f.title}`} className={styles.faultProofImg} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.muted}>No faults recorded.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Bid panel ── */}
          <div>
            <div className={`${styles.panel} ${styles.bidPanel}`}>
              <Badge variant={isOpen ? 'live' : lot.status === 'sold' ? 'sold' : 'draft'} label={isOpen ? 'Live' : lot.status} />
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>{year ? `${year} · ` : ''}{formatMileage(mileage)}</p>

              {lot.status === 'sold' ? (
                <div className={styles.priceBox}>
                  <p className={styles.priceLabel}>{winner ? `Sold to ${winner}` : 'Sold'}</p>
                  <p className={`${styles.priceValue} tabular-nums`}>{formatPrice(lot.current_bid)}</p>
                  {lot.sold_at && <p className={styles.priceNote}>Closed {new Date(lot.sold_at).toLocaleDateString()}</p>}
                </div>
              ) : (
                <div className={styles.priceBox}>
                  <p className={styles.priceLabel}>Current Bid</p>
                  <p className={`${styles.priceValue} tabular-nums`}>{formatPrice(lot.current_bid)}</p>
                  <p className={styles.priceNote}>Opening bid: {formatPrice(lot.opening_bid)}</p>
                  {hasReserve && isOpen && (
                    <p className={`${styles.reserve} ${reserveMet ? styles.reserveMet : styles.reserveNot}`}>
                      {reserveMet ? 'Reserve met' : 'Reserve not met yet'}
                    </p>
                  )}
                </div>
              )}

              <div className={styles.timerBlock}>
                <p className={styles.timerLabel}>Time Remaining</p>
                <p className={styles.timerValue}>
                  <AuctionTimer closesAt={deadline} />
                </p>
                {isOpen && timeLeft <= 3 * 60_000 && (
                  <p className={styles.endingSoon}>Ending soon. A bid in the last 3 minutes extends the auction by 5.</p>
                )}
              </div>

              {showBuyNow && buyNowPrice && (
                <div className={styles.buyNowBlock}>
                  <Button
                    onClick={() => {
                      setBidAmount(buyNowPrice.toString())
                      showToast(`Buy Now price: ${formatPrice(buyNowPrice)}. Enter your details below to purchase.`)
                    }}
                    className={styles.buyNowButton}
                  >
                    Buy now for {formatPrice(buyNowPrice)}
                  </Button>
                  <p className={styles.buyNowNote}>Skip the bidding and buy at this price</p>
                </div>
              )}

              {isOpen && (
                <form onSubmit={placeBid} className={styles.bidForm}>
                  <p className={styles.formTitle}>Place a bid</p>
                  <Input
                    label="Your name"
                    type="text"
                    value={bidderName}
                    onChange={e => setBidderName(e.target.value)}
                    placeholder="e.g. Ada Obi"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={bidderEmail}
                    onChange={e => setBidderEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    value={bidderPhone}
                    onChange={e => setBidderPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                  <Input
                    label={`Your bid (₦). Next bid must be at least ${formatPrice(Math.max(lot.current_bid + nextIncrement, lot.opening_bid))}`}
                    type="text"
                    inputMode="numeric"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value.replace(/[^\d,]/g, ''))}
                    placeholder="e.g. 85,000,000"
                    required
                  />
                  <Button type="submit" loading={saving} size="lg">Place bid</Button>
                </form>
              )}

              {!isOpen && lot.status !== 'sold' && (
                <p className={styles.closedNote}>This auction is {lot.status}.</p>
              )}
            </div>

            <div className={styles.history}>
              <h2 className={styles.historyTitle}>Bid History ({bids.length})</h2>
              {bids.length === 0 ? (
                <p className={styles.muted}>No bids yet. Be the first!</p>
              ) : (
                <div className={styles.historyList}>
                  {bids.map(b => (
                    <div key={b.id} className={styles.historyRow}>
                      <span className={`${styles.historyAmount} tabular-nums`}>{formatPrice(b.amount)}</span>
                      <span className={styles.historyMeta}>
                        {b.bidder_name || 'Anonymous bidder'}
                        <span className={`${styles.historyTime} tabular-nums`}>{new Date(b.placed_at).toLocaleString()}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
