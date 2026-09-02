import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { getVehicleOptions, getLots } from '@/lib/queries'

interface Lot {
  id: string
  vehicle_id: string
  opening_bid: number
  reserve_price: number
  current_bid: number
  status: string
  opens_at: string
  closes_at: string
}

export function AdminAuctions() {
  const { showToast } = useToast()
  const [lots, setLots] = useState<Lot[]>([])
  const [vehicles, setVehicles] = useState<{ id: string; make: string; model: string }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [vehicleId, setVehicleId] = useState('')
  const [openingBid, setOpeningBid] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getLots(), getVehicleOptions()])
      .then(([lotsData, vehData]) => {
        setLots(lotsData)
        setVehicles(vehData)
      })
      .catch(() => showToast('Failed to load auctions', 'error'))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || !openingBid || !closesAt) return
    setSaving(true)
    const { error } = await supabase.from('lots').insert({
      vehicle_id: vehicleId,
      opening_bid: +openingBid,
      reserve_price: +reservePrice || +openingBid,
      current_bid: +openingBid,
      status: 'scheduled',
      opens_at: new Date().toISOString(),
      closes_at: new Date(closesAt).toISOString(),
    })
    setSaving(false)
    if (error) { showToast('Failed to create lot', 'error'); return }
    showToast('Auction lot created')
    setShowForm(false)
    setVehicleId(''); setOpeningBid(''); setReservePrice(''); setClosesAt('')
    const { data } = await supabase.from('lots').select('*').order('created_at', { ascending: false })
    if (data) setLots(data)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <h2 style={{ margin: 0 }}>Auctions</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>Create Lot</Button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Auction Lot">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div>
            <label htmlFor="aa-vehicle" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Vehicle *</label>
            <Select
              id="aa-vehicle"
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              options={[
                { value: '', label: 'Select a vehicle...' },
                ...vehicles.map(v => ({ value: v.id, label: `${v.make} ${v.model}` })),
              ]}
              required
            />
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label htmlFor="aa-opening" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Opening Bid (₦) *</label>
              <Input id="aa-opening" value={openingBid} onChange={e => setOpeningBid(e.target.value)} type="number" placeholder="500000" min={0} required />
            </div>
            <div>
              <label htmlFor="aa-reserve" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Reserve Price (₦)</label>
              <Input id="aa-reserve" value={reservePrice} onChange={e => setReservePrice(e.target.value)} type="number" placeholder="600000" min={0} />
            </div>
          </div>
          <div>
            <label htmlFor="aa-closes" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Closing Date *</label>
            <Input id="aa-closes" value={closesAt} onChange={e => setClosesAt(e.target.value)} type="datetime-local" required />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Create Lot</Button>
          </div>
        </form>
      </Modal>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Lot ID', 'Opening Bid', 'Current Bid', 'Reserve', 'Status', 'Closes'].map(h => <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--space-1) var(--space-2)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{l.id.slice(0, 8)}</td>
                <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>₦{l.opening_bid.toLocaleString()}</td>
                <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>₦{l.current_bid.toLocaleString()}</td>
                <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>₦{l.reserve_price.toLocaleString()}</td>
                <td style={{ padding: 'var(--space-1) var(--space-2)', textTransform: 'capitalize' }}>{l.status}</td>
                <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>{new Date(l.closes_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {lots.length === 0 && <tr><td colSpan={6} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No auction lots yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
