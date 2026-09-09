import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { formatPrice, formatMileage } from '@/lib/format'
import { getLotDeadline, computeBidIncrement, SEVERITY_META, GRADE_META, firstName } from '@/lib/auction'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AuctionTimer, auctionTimeColor } from '@/components/ui/AuctionTimer'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'
import type { Lot, Bid, LotMedia } from '@/types'
import { Zap, ShoppingCart } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  LOT_NOT_FOUND: 'Auction not found',
  LOT_NOT_OPEN: 'This auction is no longer open for bidding',
  AUCTION_ENDED: 'This auction has ended',
  BELOW_CURRENT: 'Bid must exceed the current bid',
  BELOW_INCREMENT: 'Bid is below the minimum bid increment',
  BELOW_OPENING: 'Bid must exceed the opening bid',
}

function lotTitle(l: Lot): string {
  if (l.title) return l.title
  const own = [l.make, l.model].filter(Boolean).join(' ')
  if (own) return own
  if (l.vehicles) return `${l.vehicles.make} ${l.vehicles.model}`
  return 'Untitled lot'
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
      showToast('Network error — please try again', 'error')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Section>
        <div className="responsive-grid-2" style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 1200, margin: '0 auto' }}>
          <div>
            <div style={{ aspectRatio: '4/3', background: 'var(--paper-warm)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 14, background: 'var(--border)', borderRadius: 6 }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ height: 24, width: '60%', background: 'var(--border)', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 12, width: '40%', background: 'var(--border)', borderRadius: 6, marginBottom: 16 }} />
              <div style={{ height: 48, background: 'var(--navy-light)', borderRadius: 'var(--radius-md)', marginBottom: 16 }} />
              <div style={{ height: 36, background: 'var(--border)', borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>
        </div>
      </Section>
    )
  }

  if (!lot) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h2>Auction not found</h2>
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
  const transmission = lot.transmission || lot.vehicles?.transmission || '—'
  const fuel = lot.fuel_type || lot.vehicles?.fuel_type || '—'
  const colour = lot.colour || lot.vehicles?.colour || '—'
  const vCondition = lot.vehicles?.condition || '—'

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
      <Section style={{ paddingBottom: 0 }}>
        <Link to="/auctions" style={{ fontSize: 'var(--text-sm)', color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-1)' }}>&larr; Back to Auctions</Link>
      </Section>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          role="presentation"
        >
          <img src={lightbox} alt="Full size" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}

      <div className="responsive-grid-2" style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-3) var(--space-4)' }}>
        <div>
          {active ? (
            <img
              src={active.url}
              alt={title}
              onClick={() => setLightbox(active.url)}
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 'var(--radius-lg)', cursor: 'zoom-in' }}
            />
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--paper-warm)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)' }}>No image</div>
          )}

          {sortedByPrimary.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {sortedByPrimary.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  style={{
                    padding: 0, border: i === Math.min(activeImage, sortedByPrimary.length - 1) ? '2px solid var(--navy)' : '1px solid var(--border)',
                    borderRadius: 6, overflow: 'hidden', cursor: 'pointer', background: 'none',
                  }}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={img?.url} alt="" style={{ width: 64, height: 48, objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'var(--space-2)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <tbody>
                {[
                  ['Make', lot.make || lot.vehicles?.make || '—'], ['Model', lot.model || lot.vehicles?.model || '—'],
                  ['Year', year ? String(year) : '—'], ['Mileage', formatMileage(mileage)],
                  ['Transmission', transmission], ['Fuel', fuel], ['Colour', colour], ['Condition', vCondition],
                ].map(([label, val]) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '6px var(--space-1)', color: 'var(--stone)', width: '40%' }}>{label}</td>
                    <td style={{ padding: '6px var(--space-1)', fontWeight: 500, textTransform: 'capitalize' }} className="tabular-nums">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(lot.condition_grade || (lot.faults && lot.faults.length > 0)) && (
            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1-5)' }}>Condition Report</h3>
              {lot.condition_grade && GRADE_META[lot.condition_grade] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-1-5)' }}>
                  <span style={{ display: 'inline-block', minWidth: 28, textAlign: 'center', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: GRADE_META[lot.condition_grade].bg, color: GRADE_META[lot.condition_grade].color, fontWeight: 700 }}>{lot.condition_grade}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{GRADE_META[lot.condition_grade].label}</span>
                </div>
              )}
              {(lot.faults && lot.faults.length > 0) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...lot.faults].sort((a, b) => a.sort_order - b.sort_order).map(f => {
                    const meta = SEVERITY_META[f.severity]
                    return (
                      <div key={f.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0, marginTop: 2, fontSize: 'var(--text-2xs)', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: meta.bg, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meta.label}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{f.title}</p>
                          {f.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginTop: 2 }}>{f.description}</p>}
                          {f.image_url && (
                            <button type="button" onClick={() => setLightbox(f.image_url)} style={{ marginTop: 6, padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', display: 'block' }}>
                              <img src={f.image_url} alt={`Proof: ${f.title}`} style={{ width: 88, height: 62, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>No faults recorded.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
            <Badge variant={isOpen ? 'live' : lot.status === 'sold' ? 'sold' : 'draft'} label={isOpen ? 'Live' : lot.status} />
            <h2 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-1)' }}>{title}</h2>
            <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>{year ? `${year} · ` : ''}{formatMileage(mileage)}</p>

            {lot.status === 'sold' ? (
              <div style={{ margin: 'var(--space-2) 0', padding: 'var(--space-2)', background: 'var(--navy-light)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--navy-muted)' }}>{winner ? `Sold to ${winner}` : 'Sold'}</p>
                <p className="tabular-nums" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--navy)' }}>{formatPrice(lot.current_bid)}</p>
                {lot.sold_at && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Closed {new Date(lot.sold_at).toLocaleDateString()}</p>}
              </div>
            ) : (
              <div style={{ margin: 'var(--space-2) 0', padding: 'var(--space-2)', background: 'var(--navy-light)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--navy-muted)' }}>Current Bid</p>
                <p className="tabular-nums" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--navy)' }}>
                  {formatPrice(lot.current_bid)}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                  Opening bid: {formatPrice(lot.opening_bid)}
                </p>
                {hasReserve && isOpen && (
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: reserveMet ? 'var(--success)' : 'var(--live)', marginTop: 4 }}>
                    {reserveMet ? 'Reserve met' : 'Reserve not met yet'}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Time Remaining</p>
              <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: auctionTimeColor(timeLeft) }}>
                <AuctionTimer closesAt={deadline} />
              </p>
              {isOpen && timeLeft <= 3 * 60_000 && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--live)', marginTop: 4 }}>
                  Ending soon — bids in the last 3 minutes extend the auction by 5.
                </p>
              )}
            </div>

            {/* Buy Now Button - Only shows when current bid is below buy_now_price */}
            {showBuyNow && buyNowPrice && (
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <Button
                  onClick={() => {
                    setBidAmount(buyNowPrice.toString())
                    showToast(`Buy Now price: ${formatPrice(buyNowPrice)} — enter your details below to purchase`)
                  }}
                  style={{ 
                    width: '100%', 
                    background: 'var(--success)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-1)',
                  }}
                >
                  <ShoppingCart size={16} /> Buy Now — {formatPrice(buyNowPrice)}
                </Button>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', textAlign: 'center', marginTop: 4 }}>
                  Skip the bidding — purchase immediately at this price
                </p>
              </div>
            )}

            {isOpen && (
              <form onSubmit={placeBid} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Place a bid</p>
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
                  label={`Your bid (₦) — next bid must be at least ${formatPrice(Math.max(lot.current_bid + nextIncrement, lot.opening_bid))}`}
                  type="text"
                  inputMode="numeric"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value.replace(/[^\d,]/g, ''))}
                  placeholder="e.g. 85,000,000"
                  required
                />
                <Button type="submit" loading={saving}>
                  <Zap size={16} /> Place Bid
                </Button>
              </form>
            )}

            {!isOpen && lot.status !== 'sold' && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', textAlign: 'center', marginTop: 'var(--space-1)' }}>
                This auction is {lot.status}.
              </p>
            )}
          </div>

          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>Bid History ({bids.length})</h3>
            {bids.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>No bids yet. Be the first!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
                {bids.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--text-sm)', padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{formatPrice(b.amount)}</span>
                    <span style={{ color: 'var(--stone)', fontSize: 'var(--text-xs)', textAlign: 'right' }}>
                      {b.bidder_name || 'Anonymous bidder'}
                      <span className="tabular-nums" style={{ display: 'block' }}>{new Date(b.placed_at).toLocaleString()}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
