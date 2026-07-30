import { Fragment, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ChevronDown, Gavel } from 'lucide-react'
import { useAutoCloseLots } from '@/hooks/useAutoCloseLots'

interface LotWithVehicle {
  id: string
  vehicle_id: string
  opening_bid: number
  reserve_price: number
  current_bid: number
  status: string
  closes_at: string
  created_at: string
  vehicles: { make: string; model: string; year: number } | null
}

interface BidWithBidder {
  id: string
  lot_id: string
  bidder_id: string
  amount: number
  placed_at: string
  outcome: string | null
  profiles: { full_name: string | null }[] | null
}

function formatNaira(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function AdminAuctions() {
  const [lots, setLots] = useState<LotWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedLot, setExpandedLot] = useState<string | null>(null)
  const [bids, setBids] = useState<BidWithBidder[]>([])
  const [bidsLoading, setBidsLoading] = useState(false)

  const fetchLots = useCallback(() => {
    setLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('lots')
          .select('*, vehicles:vehicle_id(make, model, year)')
          .order('created_at', { ascending: false })
        if (error) console.error('[AdminAuctions] Failed to load lots:', error.message)
        if (data) setLots(data as unknown as LotWithVehicle[])
      } catch (e) {
        console.error('[AdminAuctions] Unexpected error:', e)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => { fetchLots() }, [fetchLots])

  // Auto-close expired lots every 60s, re-fetch the list afterward
  useAutoCloseLots(fetchLots)

  const fetchBids = useCallback(async (lotId: string) => {
    setBidsLoading(true)
    setBids([])
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*, profiles:bidder_id(full_name)')
        .eq('lot_id', lotId)
        .order('amount', { ascending: false })
        .limit(10)
      if (error) console.error('[AdminAuctions] Failed to load bids:', error.message)
      if (data) setBids(data as unknown as BidWithBidder[])
    } catch (e) {
      console.error('[AdminAuctions] Unexpected error loading bids:', e)
    }
    setBidsLoading(false)
  }, [])

  const toggleExpand = useCallback((lotId: string) => {
    if (expandedLot === lotId) {
      setExpandedLot(null)
      setBids([])
    } else {
      setExpandedLot(lotId)
      fetchBids(lotId)
    }
  }, [expandedLot, fetchBids])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('lots').update({ status }).eq('id', id)
    fetchLots()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    await supabase.from('lots').delete().eq('id', deleteId)
    setSaving(false)
    setDeleteId(null)
    fetchLots()
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'open': return 'var(--success)'
      case 'closing': return 'var(--live)'
      case 'closed': case 'sold': case 'unsold': return 'var(--stone)'
      default: return 'var(--navy)'
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h2>Auctions</h2>
        <Link to="/admin/auctions/new"><Button size="sm">New Lot</Button></Link>
      </div>

      {loading ? <TableSkeleton rows={8} cols={6} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['', 'Vehicle', 'Opening Bid', 'Current Bid', 'Status', 'Closes', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lots.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No lots created yet.</td></tr>
              )}
              {lots.map(l => {
                const isExpanded = expandedLot === l.id
                return (
                  <Fragment key={l.id}>
                    <tr
                      onClick={() => toggleExpand(l.id)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(12,30,58,0.02)' : undefined,
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(12,30,58,0.015)' }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = '' }}
                    >
                      <td style={{ padding: 'var(--space-1) var(--space-2)', width: 32 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 20, height: 20, borderRadius: 'var(--radius-sm)',
                          background: isExpanded ? 'var(--navy)' : 'rgba(12,30,58,0.06)',
                          color: isExpanded ? 'white' : 'var(--stone)',
                          transition: 'all 200ms ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}>
                          <ChevronDown size={12} />
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-1) var(--space-2)', fontWeight: 500 }}>
                        {l.vehicles ? `${l.vehicles.make} ${l.vehicles.model} (${l.vehicles.year})` : '—'}
                      </td>
                      <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>{formatNaira(l.opening_bid)}</td>
                      <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>{formatNaira(l.current_bid)}</td>
                      <td style={{ padding: 'var(--space-1) var(--space-2)' }} onClick={e => e.stopPropagation()}>
                        <select
                          value={l.status}
                          onChange={e => updateStatus(l.id, e.target.value)}
                          style={{ fontSize: 'inherit', padding: '2px 4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: statusColor(l.status), fontWeight: 600, textTransform: 'capitalize' }}
                        >
                          {['scheduled', 'open', 'closing', 'closed', 'sold', 'unsold'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)', whiteSpace: 'nowrap' }}>{new Date(l.closes_at).toLocaleDateString()}</td>
                      <td style={{ padding: 'var(--space-1) var(--space-2)', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                        <Link to={`/admin/auctions/${l.id}/edit`}><Button variant="ghost" size="sm">Edit</Button></Link>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(l.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                          <div style={{
                            background: 'rgba(12,30,58,0.015)',
                            borderTop: '1px solid rgba(12,30,58,0.06)',
                            padding: 'var(--space-2) var(--space-3) var(--space-2) var(--space-3)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-1-5)' }}>
                              <Gavel size={14} style={{ color: 'var(--navy)' }} />
                              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Bid History
                              </span>
                            </div>
                            {bidsLoading ? (
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', padding: 'var(--space-1) 0' }}>Loading bids...</p>
                            ) : bids.length === 0 ? (
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', padding: 'var(--space-1) 0' }}>No bids yet on this lot.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Header row */}
                                <div style={{
                                  display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px',
                                  gap: 'var(--space-2)', padding: '4px var(--space-1)',
                                  fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--stone)',
                                  textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                  <span>Bidder</span>
                                  <span>Amount</span>
                                  <span>Time</span>
                                  <span>Outcome</span>
                                </div>
                                {/* Bid rows */}
                                {bids.map((bid, i) => (
                                  <div
                                    key={bid.id}
                                    style={{
                                      display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px',
                                      gap: 'var(--space-2)', padding: '6px var(--space-1)',
                                      borderRadius: 'var(--radius-sm)',
                                      background: i === 0 ? 'rgba(21,128,61,0.04)' : undefined,
                                      transition: 'background 150ms ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(12,30,58,0.03)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? 'rgba(21,128,61,0.04)' : '' }}
                                  >
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: i === 0 ? 600 : 400, color: 'var(--ink)' }}>
                                      {bid.profiles?.[0]?.full_name || bid.bidder_id.slice(0, 8) + '…'}
                                    </span>
                                    <span className="tabular-nums" style={{
                                      fontSize: 'var(--text-xs)', fontWeight: i === 0 ? 700 : 500,
                                      color: i === 0 ? 'var(--success)' : 'var(--ink)',
                                    }}>
                                      {formatNaira(bid.amount)}
                                    </span>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                                      {timeAgo(bid.placed_at)}
                                    </span>
                                    <span style={{
                                      fontSize: 'var(--text-2xs)', fontWeight: 600, textTransform: 'capitalize',
                                      color: bid.outcome === 'accepted' ? 'var(--success)' : bid.outcome === 'rejected' ? 'var(--error)' : 'var(--stone)',
                                    }}>
                                      {bid.outcome || 'pending'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Lot">
        <p style={{ marginBottom: 'var(--space-2)' }}>Delete this lot and all associated bids?</p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} loading={saving} style={{ background: 'var(--error)', color: 'white' }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

