import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { formatPrice, formatMileage } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AuctionTimer, auctionTimeColor } from '@/components/ui/AuctionTimer'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'

interface BidRecord {
  id: string
  amount: number
  placed_at: string
  bidder_id: string | null
  bidder_name?: string | null
}

interface LotDetail {
  id: string
  opening_bid: number
  reserve_price: number
  current_bid: number
  status: string
  closes_at: string
  vehicles: {
    id: string
    make: string
    model: string
    year: number
    mileage: number
    transmission: string
    fuel_type: string
    colour: string
    condition: string
    media?: { url: string; is_primary: boolean }[]
  } | null
}

export function AuctionDetail() {
  const { lotId } = useParams<{ lotId: string }>()
  const { showToast } = useToast()
  const [lot, setLot] = useState<LotDetail | null>(null)
  const [bids, setBids] = useState<BidRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidderName, setBidderName] = useState('')
  const [bidderEmail, setBidderEmail] = useState('')
  const [bidderPhone, setBidderPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!lotId) return
    ;(async () => {
      const { data } = await supabase
        .from('lots')
        .select('*, vehicles:vehicle_id(*, media:vehicle_media(*))')
        .eq('id', lotId)
        .single()
      if (data) setLot(data as unknown as LotDetail)
      setLoading(false)
    })()
    ;(async () => {
      const { data } = await supabase.from('bids').select('*').eq('lot_id', lotId).order('placed_at', { ascending: false }).limit(50)
      if (data) setBids(data)
    })()
  }, [lotId])

  const lotRef = useRef(lot)
  lotRef.current = lot

  useEffect(() => {
    if (!lotId) return
    const channel = supabase.channel(`bids:${lotId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `lot_id=eq.${lotId}` }, (payload: RealtimePostgresChangesPayload<BidRecord>) => {
        const newBid = payload.new as BidRecord
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
    if (!lotId) return
    if (!lot) return

    // Client-side validation before calling Edge Function
    if (lot.status !== 'open' && lot.status !== 'closing') {
      showToast('This auction is no longer open for bidding', 'error')
      return
    }
    const timeLeft = new Date(lot.closes_at).getTime() - Date.now()
    if (timeLeft <= 0) {
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
    const amount = parseFloat(bidAmount) * 1_000_000
    if (!amount || amount <= 0) {
      showToast('Please enter a valid bid amount', 'error')
      return
    }
    if (amount <= lot.current_bid) {
      showToast(`Bid must exceed ${formatPrice(lot.current_bid)}`, 'error')
      return
    }

    setSaving(true)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
      const res = await fetch(`${supabaseUrl}/functions/v1/place-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          lot_id: lotId,
          amount,
          bidder_name: bidderName.trim(),
          bidder_email: bidderEmail.trim(),
          bidder_phone: bidderPhone.trim(),
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        showToast(result.error || 'Failed to place bid', 'error')
      } else {
        showToast('Bid placed successfully')
        setBidAmount('')
      }
    } catch {
      showToast('Network error — please try again', 'error')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Section>
        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: 1200, margin: '0 auto' }}>
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

  if (!lot || !lot.vehicles) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h2>Auction not found</h2>
          <Link to="/auctions"><Button variant="secondary">Back to Auctions</Button></Link>
        </div>
      </Section>
    )
  }

  const v = lot.vehicles
  const img = v.media?.find(m => m.is_primary) ?? v.media?.[0]
  const timeLeft = Math.max(0, new Date(lot.closes_at).getTime() - Date.now())
  const isOpen = lot.status === 'open' || lot.status === 'closing'
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.emphatonautos.com'
  const auctionTitle = `${v.make} ${v.model} Auction | Empathon Autos`
  const auctionDesc = `Bidding on a ${v.make} ${v.model} (${v.year}). Current bid: ${formatPrice(lot.current_bid)}. ${formatMileage(v.mileage)}, ${v.transmission}.`
  const auctionImg = img?.url || '/og-image.jpg'

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

      <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-3) var(--space-4)' }}>
        <div>
          {img ? (
            <img src={img.url} alt={`${v.make} ${v.model}`} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--paper-warm)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)' }}>No image</div>
          )}

          <div style={{ marginTop: 'var(--space-2)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <tbody>
                {[
                  ['Make', v.make], ['Model', v.model], ['Year', String(v.year)],
                  ['Mileage', formatMileage(v.mileage)], ['Transmission', v.transmission],
                  ['Fuel', v.fuel_type], ['Colour', v.colour], ['Condition', v.condition],
                ].map(([label, val]) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '6px var(--space-1)', color: 'var(--stone)', width: '40%' }}>{label}</td>
                    <td style={{ padding: '6px var(--space-1)', fontWeight: 500, textTransform: 'capitalize' }} className="tabular-nums">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
            <Badge variant={lot.status === 'open' ? 'live' : lot.status === 'closing' ? 'live' : 'sold'} />
            <h2 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-1)' }}>{v.make} {v.model}</h2>
            <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>{v.year} &middot; {formatMileage(v.mileage)}</p>

            <div style={{ margin: 'var(--space-2) 0', padding: 'var(--space-2)', background: 'var(--navy-light)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--navy-muted)' }}>Current Bid</p>
              <p className="tabular-nums" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--navy)' }}>
                {formatPrice(lot.current_bid)}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                Opening bid: {formatPrice(lot.opening_bid)}
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Time Remaining</p>
              <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: auctionTimeColor(timeLeft) }}>
                <AuctionTimer closesAt={lot.closes_at} />
              </p>
            </div>

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
                  label={`Your bid (₦M) — min ${formatPrice(lot.current_bid + 100_000)}`}
                  type="number"
                  step="0.1"
                  min={(lot.current_bid + 100_000) / 1_000_000}
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  placeholder="e.g. 5.5"
                  required
                />
                <Button type="submit" loading={saving}>Place Bid</Button>
              </form>
            )}

            {!isOpen && lot.status !== 'sold' && lot.status !== 'unsold' && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', textAlign: 'center' }}>This auction is {lot.status}.</p>
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
