import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { Plus } from 'lucide-react'

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' }, { value: 'used', label: 'Used' },
  { value: 'certified-pre-owned', label: 'Certified Pre-Owned' },
]
const TRANSMISSION_OPTIONS = [
  { value: 'automatic', label: 'Automatic' }, { value: 'manual', label: 'Manual' },
]
const FUEL_OPTIONS = [
  { value: 'petrol', label: 'Petrol' }, { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' }, { value: 'hybrid', label: 'Hybrid' },
]
const BODY_OPTIONS = [
  { value: 'sedan', label: 'Sedan' }, { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' }, { value: 'coupe', label: 'Coupe' },
  { value: 'pickup', label: 'Pickup' }, { value: 'truck', label: 'Truck' },
]

const emptyVehicle = {
  make: '', model: '', year: new Date().getFullYear(), price: 0,
  mileage: 0, colour: '', condition: 'used' as const,
  transmission: 'automatic' as const, fuel_type: 'petrol' as const,
  body_type: 'sedan' as const, status: 'draft' as const,
}

export function AdminAuctionForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [vehicles, setVehicles] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    vehicle_id: '', opening_bid: '', reserve_price: '', current_bid: '0',
    status: 'scheduled', closes_at: '', opens_at: '',
  })

  // Inline vehicle creation
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [originalVehicleId, setOriginalVehicleId] = useState<string | null>(null)

  const fetchVehicles = useCallback(async () => {
    const { data, error } = await supabase.from('vehicles').select('id, make, model').order('make')
    if (error) {
      console.error('[AdminAuctionForm] Failed to load vehicles:', error.message)
      showToast(`Failed to load vehicles: ${error.message}`, 'error')
    }
    if (data) setVehicles(data.map(v => ({ value: v.id, label: `${v.make} ${v.model}` })))
  }, [showToast])

  useEffect(() => {
    ;(async () => {
      await fetchVehicles()
      if (id) {
        const { data: lot, error: lotError } = await supabase.from('lots').select('*').eq('id', id).single()
        if (lotError) console.error('[AdminAuctionForm] Failed to load lot:', lotError.message)
        if (lot) {
          setForm({
            vehicle_id: lot.vehicle_id, opening_bid: String(lot.opening_bid / 1_000_000),
            reserve_price: String(lot.reserve_price / 1_000_000), current_bid: String(lot.current_bid / 1_000_000),
            status: lot.status, closes_at: lot.closes_at.slice(0, 16), opens_at: lot.opens_at?.slice(0, 16) || '',
          })
          setOriginalVehicleId(lot.vehicle_id)
        }
        setLoading(false)
      }
    })()
  }, [id, fetchVehicles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicle_id || !form.closes_at) { showToast('Vehicle and closing time required', 'error'); return }
    setSaving(true)
    const payload = {
      vehicle_id: form.vehicle_id,
      opening_bid: parseFloat(form.opening_bid || '0') * 1_000_000,
      reserve_price: parseFloat(form.reserve_price || '0') * 1_000_000,
      current_bid: parseFloat(form.current_bid || '0') * 1_000_000,
      status: form.status,
      closes_at: new Date(form.closes_at).toISOString(),
      opens_at: form.opens_at ? new Date(form.opens_at).toISOString() : null,
    }
    if (id) {
      const { error } = await supabase.from('lots').update(payload).eq('id', id)
      if (error) { showToast(`Failed to update lot: ${error.message}`, 'error'); setSaving(false); return }
      // If vehicle changed, reset old vehicle status to 'draft' and mark new one as 'in-auction'
      if (originalVehicleId && originalVehicleId !== form.vehicle_id) {
        await supabase.from('vehicles').update({ status: 'draft' }).eq('id', originalVehicleId)
        await supabase.from('vehicles').update({ status: 'in-auction' }).eq('id', form.vehicle_id)
      }
      showToast('Lot updated')
    } else {
      const { error } = await supabase.from('lots').insert(payload)
      if (error) { showToast(`Failed to create lot: ${error.message}`, 'error'); setSaving(false); return }
      const { error: vehicleError } = await supabase.from('vehicles').update({ status: 'in-auction' }).eq('id', form.vehicle_id)
      if (vehicleError) showToast(`Lot created but vehicle status update failed: ${vehicleError.message}`, 'error')
      else showToast('Lot created')
    }
    setSaving(false)
    navigate('/admin/auctions')
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleForm.make || !vehicleForm.model) { showToast('Make and model required', 'error'); return }
    setSavingVehicle(true)
    const payload = {
      make: vehicleForm.make, model: vehicleForm.model, year: vehicleForm.year,
      price: vehicleForm.price, mileage: vehicleForm.mileage, colour: vehicleForm.colour,
      condition: vehicleForm.condition, transmission: vehicleForm.transmission,
      fuel_type: vehicleForm.fuel_type, body_type: vehicleForm.body_type,
      status: vehicleForm.status, currency: 'NGN',
    }
    const { data, error } = await supabase.from('vehicles').insert(payload).select('id').single()
    setSavingVehicle(false)
    if (error || !data) { showToast(`Failed to create vehicle: ${error?.message || 'Unknown error'}`, 'error'); return }
    showToast('Vehicle created')
    // Refresh vehicle list and auto-select the new one
    await fetchVehicles()
    setForm(f => ({ ...f, vehicle_id: data.id }))
    setShowVehicleModal(false)
    setVehicleForm(emptyVehicle)
  }

  if (loading) return <p style={{ color: 'var(--stone)' }}>Loading...</p>

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>{id ? 'Edit Lot' : 'New Lot'}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
        {/* Vehicle selector with New Vehicle button */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
            <div style={{ flex: 1 }}>
              <Select
                label="Vehicle *"
                value={form.vehicle_id}
                onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                required
                options={vehicles.length === 0
                  ? [{ value: '', label: 'No vehicles available — create one below' }]
                  : [{ value: '', label: 'Select a vehicle...' }, ...vehicles]}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowVehicleModal(true)}
              style={{ height: 36, marginBottom: 1, flexShrink: 0, gap: 4 }}
            >
              <Plus size={14} /> New
            </Button>
          </div>
        </div>
        <Input label="Opening Bid (₦M)" type="number" step="0.1" min="0" value={form.opening_bid} onChange={e => setForm(f => ({ ...f, opening_bid: e.target.value }))} />
        <Input label="Reserve Price (₦M)" type="number" step="0.1" min="0" value={form.reserve_price} onChange={e => setForm(f => ({ ...f, reserve_price: e.target.value }))} />
        {id && <Input label="Current Bid (₦M)" type="number" step="0.1" min="0" value={form.current_bid} onChange={e => setForm(f => ({ ...f, current_bid: e.target.value }))} />}
        <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={[
          { value: 'scheduled', label: 'Scheduled' }, { value: 'open', label: 'Open' },
          { value: 'closing', label: 'Closing' }, { value: 'closed', label: 'Closed' },
          { value: 'sold', label: 'Sold' }, { value: 'unsold', label: 'Unsold' },
        ]} />
        <Input label="Opens At" type="datetime-local" value={form.opens_at} onChange={e => setForm(f => ({ ...f, opens_at: e.target.value }))} />
        <Input label="Closes At *" type="datetime-local" value={form.closes_at} onChange={e => setForm(f => ({ ...f, closes_at: e.target.value }))} required />
        <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/auctions')}>Cancel</Button>
          <Button type="submit" loading={saving}>{id ? 'Save Changes' : 'Create Lot'}</Button>
        </div>
      </form>

      {/* Inline Vehicle Creation Modal */}
      <Modal open={showVehicleModal} onClose={() => setShowVehicleModal(false)} title="Quick Create Vehicle">
        <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', padding: 'var(--space-2) 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
            <Input label="Make *" value={vehicleForm.make} onChange={e => setVehicleForm(f => ({ ...f, make: e.target.value }))} required placeholder="e.g. Toyota" />
            <Input label="Model *" value={vehicleForm.model} onChange={e => setVehicleForm(f => ({ ...f, model: e.target.value }))} required placeholder="e.g. Camry" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-1)' }}>
            <Input label="Year" type="number" value={vehicleForm.year} onChange={e => setVehicleForm(f => ({ ...f, year: +e.target.value }))} min={2000} max={2030} />
            <Input label="Price (₦)" type="number" value={vehicleForm.price} onChange={e => setVehicleForm(f => ({ ...f, price: +e.target.value }))} min={0} />
            <Input label="Mileage (km)" type="number" value={vehicleForm.mileage} onChange={e => setVehicleForm(f => ({ ...f, mileage: +e.target.value }))} min={0} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
            <Input label="Colour" value={vehicleForm.colour} onChange={e => setVehicleForm(f => ({ ...f, colour: e.target.value }))} placeholder="e.g. White" />
            <Select label="Condition" value={vehicleForm.condition} onChange={e => setVehicleForm(f => ({ ...f, condition: e.target.value as typeof vehicleForm.condition }))} options={CONDITION_OPTIONS} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-1)' }}>
            <Select label="Transmission" value={vehicleForm.transmission} onChange={e => setVehicleForm(f => ({ ...f, transmission: e.target.value as typeof vehicleForm.transmission }))} options={TRANSMISSION_OPTIONS} />
            <Select label="Fuel" value={vehicleForm.fuel_type} onChange={e => setVehicleForm(f => ({ ...f, fuel_type: e.target.value as typeof vehicleForm.fuel_type }))} options={FUEL_OPTIONS} />
            <Select label="Body" value={vehicleForm.body_type} onChange={e => setVehicleForm(f => ({ ...f, body_type: e.target.value as typeof vehicleForm.body_type }))} options={BODY_OPTIONS} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
            <Button type="button" variant="ghost" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
            <Button type="submit" loading={savingVehicle}>Create Vehicle</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
