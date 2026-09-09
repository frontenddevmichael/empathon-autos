import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { useToast } from '@/context/ToastContext'
import { Plus, Trash2, Upload, Star, X } from 'lucide-react'
import { SEVERITY_META, GRADE_META } from '@/lib/auction'
import type { ConditionGrade, FaultSeverity } from '@/types'

const TRANSMISSION_OPTIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'semi-automatic', label: 'Semi-Automatic' },
]
const FUEL_OPTIONS = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
]
const BODY_OPTIONS = [
  { value: 'sedan', label: 'Sedan' }, { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' }, { value: 'coupe', label: 'Coupe' },
  { value: 'pickup', label: 'Pickup' }, { value: 'truck', label: 'Truck' },
  { value: 'wagon', label: 'Wagon' }, { value: 'van', label: 'Van' },
  { value: 'convertible', label: 'Convertible' },
]

/** Max full-naira value NUMERIC(12,2) can hold (9,999,999,999.99). */
const MAX_LOT_AMOUNT = 9_999_999_999.99

/** Parse a ₦M input into full naira; returns null if invalid or would overflow. */
function toFullNaira(milValue: string): number | null {
  const n = parseFloat(milValue)
  if (isNaN(n)) return null
  const full = n * 1_000_000
  if (full > MAX_LOT_AMOUNT) return null
  return full
}

interface LoadedLot {
  vehicle_id: string | null
  title: string | null
  make: string | null
  model: string | null
  trim: string | null
  year: number | null
  mileage: number | null
  transmission: string
  fuel_type: string
  colour: string | null
  body_type: string
  description: string | null
  condition_grade: string | null
  opening_bid: number
  reserve_price: number
  buy_now_price: number | null
  bid_increment: number
  current_bid: number
  status: string
  closes_at: string
  opens_at: string | null
}

interface MediaDraft {
  id?: string
  url: string
  is_primary: boolean
  type: 'image' | 'video'
}

interface FaultDraft {
  id?: string
  title: string
  description: string
  severity: FaultSeverity
  image_url: string
}

function FaultImageField({ value, onUpload, onRemove }: { value: string; onUpload: (url: string) => void; onRemove: () => void }) {
  const { showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const path = `faults/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
    const { error } = await supabase.storage.from('lot-media').upload(path, file)
    if (error) { showToast(`Upload failed: ${error.message}`, 'error'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('lot-media').getPublicUrl(path)
    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {value ? (
        <>
          <img src={value} alt="Fault proof" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} style={{ color: 'var(--error)' }}>Remove</Button>
        </>
      ) : (
        <>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
          <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
            <Upload size={13} /> Proof image
          </Button>
        </>
      )}
    </div>
  )
}

export function AdminAuctionForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [vehicles, setVehicles] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    vehicle_id: '', title: '', make: '', model: '', trim: '', year: new Date().getFullYear(),
    mileage: 0, transmission: 'automatic', fuel_type: 'petrol', colour: '', body_type: 'sedan', description: '',
    condition_grade: 'B' as ConditionGrade,
    opening_bid: '', reserve_price: '', buy_now_price: '', bid_increment: '', current_bid: '0',
    status: 'scheduled', closes_at: '', opens_at: '',
  })
  const [media, setMedia] = useState<MediaDraft[]>([])
  const [faults, setFaults] = useState<FaultDraft[]>([])
  const [originalVehicleId, setOriginalVehicleId] = useState<string | null>(null)

  const set = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }))

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
        const [lotRes, mediaRes, faultsRes] = await Promise.all([
          supabase.from('lots').select('*').eq('id', id).single(),
          supabase.from('lot_media').select('*').eq('lot_id', id).order('sort_order'),
          supabase.from('lot_faults').select('*').eq('lot_id', id).order('sort_order'),
        ])
        if (lotRes.error) console.error('[AdminAuctionForm] Failed to load lot:', lotRes.error.message)
        const lot = lotRes.data as LoadedLot | null
        if (lot) {
          setForm({
            vehicle_id: lot.vehicle_id || '', title: lot.title || '',
            make: lot.make || '', model: lot.model || '', trim: lot.trim || '', year: lot.year || new Date().getFullYear(), mileage: lot.mileage || 0,
            transmission: lot.transmission, fuel_type: lot.fuel_type, colour: lot.colour || '', body_type: lot.body_type,
            description: lot.description || '', condition_grade: (lot.condition_grade || 'B') as ConditionGrade,
            opening_bid: String(lot.opening_bid / 1_000_000),
            reserve_price: String(lot.reserve_price / 1_000_000),
            buy_now_price: lot.buy_now_price ? String(lot.buy_now_price / 1_000_000) : '',
            bid_increment: lot.bid_increment > 0 ? String(lot.bid_increment / 1_000_000) : '',
            current_bid: String(lot.current_bid / 1_000_000),
            status: lot.status, closes_at: lot.closes_at.slice(0, 16), opens_at: lot.opens_at?.slice(0, 16) || '',
          })
          setOriginalVehicleId(lot.vehicle_id)
        }
        if (mediaRes.error) console.error('[AdminAuctionForm] Failed to load media:', mediaRes.error.message)
        if (mediaRes.data) setMedia(mediaRes.data.map((m: { id: string; url: string; is_primary: boolean; type: 'image' | 'video' }) => ({ id: m.id, url: m.url, is_primary: m.is_primary, type: m.type })))
        if (faultsRes.error) console.error('[AdminAuctionForm] Failed to load faults:', faultsRes.error.message)
        if (faultsRes.data) setFaults(faultsRes.data.map((f: { id: string; title: string; description: string | null; severity: FaultSeverity; image_url: string | null }) => ({ id: f.id, title: f.title, description: f.description || '', severity: f.severity, image_url: f.image_url || '' })))
        setLoading(false)
      }
    })()
  }, [id, fetchVehicles])

  const handleVehicleSelect = async (vehicleId: string) => {
    set({ vehicle_id: vehicleId })
    if (!vehicleId) return
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single()
    if (error) { showToast(`Failed to load vehicle: ${error.message}`, 'error'); return }
    if (data) {
      set({
        title: form.title.trim() || '', make: data.make, model: data.model, trim: data.trim || '',
        year: data.year, mileage: data.mileage, transmission: data.transmission,
        fuel_type: data.fuel_type, colour: data.colour || '', body_type: data.body_type,
        description: data.description || '',
      })
    }
  }

  const toSafeISO = (val: string): string | null => {
    if (!val) return null
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return null
      return d.toISOString()
    } catch { return null }
  }

  const setPrimary = (index: number) => setMedia(prev => prev.map((m, i) => ({ ...m, is_primary: i === index })))
  const removeMedia = (index: number) => setMedia(prev => prev.filter((_, i) => i !== index))

  const addFault = () => setFaults(prev => [...prev, { title: '', description: '', severity: 'minor', image_url: '' }])
  const updateFault = (index: number, patch: Partial<FaultDraft>) => setFaults(prev => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  const removeFault = (index: number) => setFaults(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const closesAt = toSafeISO(form.closes_at)
    if (!closesAt) { showToast('Valid closing date/time is required', 'error'); return }
    const linked = !!form.vehicle_id
    if (!linked && (!form.make.trim() || !form.model.trim())) {
      showToast('Provide a make and model, or link an inventory vehicle', 'error')
      return
    }
    const openingBid = toFullNaira(form.opening_bid)
    const reservePrice = toFullNaira(form.reserve_price)
    const currentBid = toFullNaira(form.current_bid)
    const bidIncrement = form.bid_increment.trim() === '' ? 0 : toFullNaira(form.bid_increment)
    const buyNowPrice = form.buy_now_price.trim() === '' ? null : toFullNaira(form.buy_now_price)
    if (openingBid === null || reservePrice === null || currentBid === null || bidIncrement === null) {
      showToast('Amount too large — enter values in ₦ millions (e.g. 85 = ₦85M, max ~₦9,999M)', 'error')
      return
    }

    setSaving(true)
    const title = form.title.trim() || [form.make.trim(), form.model.trim()].filter(Boolean).join(' ')

    const payload = {
      vehicle_id: form.vehicle_id || null,
      title: title || null,
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      trim: form.trim,
      year: form.year || null,
      mileage: form.mileage,
      transmission: form.transmission,
      fuel_type: form.fuel_type,
      colour: form.colour,
      body_type: form.body_type,
      description: form.description,
      condition_grade: form.condition_grade,
      bid_increment: bidIncrement,
      opening_bid: openingBid,
      reserve_price: reservePrice,
      buy_now_price: buyNowPrice,
      status: form.status,
      closes_at: closesAt,
      opens_at: toSafeISO(form.opens_at),
    }

    let lotId = id
    if (id) {
      const editPayload = { ...payload, current_bid: currentBid }
      const { error } = await supabase.from('lots').update(editPayload).eq('id', id)
      if (error) { showToast(`Failed to update lot: ${error.message}`, 'error'); setSaving(false); return }
      if (originalVehicleId && originalVehicleId !== form.vehicle_id) {
        if (originalVehicleId) await supabase.from('vehicles').update({ status: 'draft' }).eq('id', originalVehicleId)
        if (form.vehicle_id) await supabase.from('vehicles').update({ status: 'in-auction' }).eq('id', form.vehicle_id)
      }
    } else {
      const { data, error } = await supabase.from('lots').insert(payload).select('id').single()
      if (error) { showToast(`Failed to create lot: ${error.message}`, 'error'); setSaving(false); return }
      lotId = data?.id
      if (form.vehicle_id) await supabase.from('vehicles').update({ status: 'in-auction' }).eq('id', form.vehicle_id)
    }

    if (lotId) {
      await supabase.from('lot_media').delete().eq('lot_id', lotId)
      await supabase.from('lot_faults').delete().eq('lot_id', lotId)

      let mediaRows = media.map((m, i) => ({ lot_id: lotId, url: m.url, type: m.type, sort_order: i, is_primary: m.is_primary }))
      if (mediaRows.length > 0 && !mediaRows.some(r => r.is_primary)) mediaRows = mediaRows.map((r, i) => ({ ...r, is_primary: i === 0 }))
      if (mediaRows.length > 0) {
        const { error } = await supabase.from('lot_media').insert(mediaRows)
        if (error) showToast(`Media save failed: ${error.message}`, 'error')
      }

      const faultRows = faults.map((f, i) => ({ lot_id: lotId, title: f.title, description: f.description, severity: f.severity, image_url: f.image_url || null, sort_order: i }))
      if (faultRows.length > 0) {
        const { error } = await supabase.from('lot_faults').insert(faultRows)
        if (error) showToast(`Faults save failed: ${error.message}`, 'error')
      }
    }

    setSaving(false)
    showToast(id ? 'Lot updated' : 'Lot created')
    navigate('/admin/auctions')
  }

  if (loading) return <p style={{ color: 'var(--stone)' }}>Loading...</p>

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>{id ? 'Edit Lot' : 'New Lot'}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Vehicle link */}
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Vehicle link <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(optional — standalone lots don't need an inventory vehicle)</span></p>
          <Select
            label="Link to inventory vehicle"
            value={form.vehicle_id}
            onChange={e => handleVehicleSelect(e.target.value)}
            options={[{ value: '', label: 'None — standalone lot' }, ...vehicles]}
          />
        </div>

        {/* Listing / specs */}
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Listing details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
            <Input label="Title" value={form.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. 2023 Mercedes EQS 450+" />
            <Input label="Make" value={form.make} onChange={e => set({ make: e.target.value })} placeholder="e.g. Mercedes-Benz" />
            <Input label="Model" value={form.model} onChange={e => set({ model: e.target.value })} placeholder="e.g. EQS 450" />
            <Input label="Trim" value={form.trim} onChange={e => set({ trim: e.target.value })} placeholder="e.g. AMG Line" />
            <Input label="Year" type="number" value={form.year} onChange={e => set({ year: +e.target.value })} min={1980} max={2035} />
            <Input label="Mileage (km)" type="number" value={form.mileage} onChange={e => set({ mileage: +e.target.value })} min={0} />
            <Input label="Colour" value={form.colour} onChange={e => set({ colour: e.target.value })} placeholder="e.g. Obsidian Black" />
            <Select label="Body" value={form.body_type} onChange={e => set({ body_type: e.target.value })} options={BODY_OPTIONS} />
            <Select label="Transmission" value={form.transmission} onChange={e => set({ transmission: e.target.value })} options={TRANSMISSION_OPTIONS} />
            <Select label="Fuel" value={form.fuel_type} onChange={e => set({ fuel_type: e.target.value })} options={FUEL_OPTIONS} />
          </div>
          <div style={{ marginTop: 'var(--space-1)' }}>
            <TextArea label="Description" value={form.description} onChange={e => set({ description: e.target.value })} rows={3} placeholder="Condition notes, provenance, extras..." />
          </div>
        </div>

        {/* Condition */}
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Condition report</p>
          <div style={{ marginBottom: 'var(--space-1)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4 }}>Overall grade</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.keys(GRADE_META) as ConditionGrade[]).map(g => {
                const active = form.condition_grade === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set({ condition_grade: g })}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-md)', border: `2px solid ${active ? GRADE_META[g].color : 'var(--border)'}`,
                      background: active ? GRADE_META[g].bg : 'var(--surface)', color: active ? GRADE_META[g].color : 'var(--stone)',
                      fontWeight: 700, cursor: 'pointer', fontSize: 'var(--text-sm)',
                    }}
                    aria-pressed={active}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 'var(--space-2) 0 var(--space-1)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Faults <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(colour-coded severity)</span></p>
            <Button type="button" variant="secondary" size="sm" onClick={addFault}><Plus size={14} /> Add fault</Button>
          </div>

          {faults.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>No faults recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faults.map((f, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Input label="Fault" value={f.title} onChange={e => updateFault(i, { title: e.target.value })} placeholder="e.g. Front bumper scratch" required />
                      <div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4 }}>Severity</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(Object.keys(SEVERITY_META) as FaultSeverity[]).map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateFault(i, { severity: s })}
                              style={{
                                padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: `2px solid ${f.severity === s ? SEVERITY_META[s].color : 'var(--border)'}`,
                                background: f.severity === s ? SEVERITY_META[s].bg : 'var(--surface)',
                                color: f.severity === s ? SEVERITY_META[s].color : 'var(--stone)',
                                fontWeight: 600, cursor: 'pointer', fontSize: 'var(--text-2xs)',
                              }}
                              aria-pressed={f.severity === s}
                            >
                              {SEVERITY_META[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFault(i)} style={{ color: 'var(--error)', marginTop: 20 }}><Trash2 size={14} /></Button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                    <Input label="Details" value={f.description} onChange={e => updateFault(i, { description: e.target.value })} placeholder="e.g. 4cm scuff on passenger side" />
                    <FaultImageField value={f.image_url} onUpload={url => updateFault(i, { image_url: url })} onRemove={() => updateFault(i, { image_url: '' })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Images <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(add as many as you like — star the primary)</span></p>
          {media.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 'var(--space-1-5)' }}>
              {media.map((m, i) => (
                <div key={`${m.url}-${i}`} style={{ position: 'relative', border: m.is_primary ? '2px solid var(--navy)' : '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <img src={m.url} alt="Lot media" style={{ width: '100%', height: 84, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 4, left: 4, display: 'flex', gap: 4 }}>
                    <button type="button" onClick={() => setPrimary(i)} title="Set as primary" aria-label="Set as primary" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', background: m.is_primary ? 'var(--navy)' : 'rgba(255,255,255,0.85)', color: m.is_primary ? 'white' : 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={13} fill={m.is_primary ? 'currentColor' : 'none'} />
                    </button>
                    <button type="button" onClick={() => removeMedia(i)} title="Remove" aria-label="Remove" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.85)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={13} />
                    </button>
                  </div>
                  {m.is_primary && <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--navy)', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: '4px 0 0 0' }}>Primary</span>}
                </div>
              ))}
            </div>
          )}
          <MediaUploader bucket="lot-media" folder={id || 'lot-media'} multiple onUploaded={(m) => setMedia(prev => [...prev, { url: m.url, is_primary: prev.length === 0, type: m.type }])} />
        </div>

        {/* Bidding */}
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Bidding</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
            <Input label="Opening Bid (₦M)" type="number" step="0.1" min="0" value={form.opening_bid} onChange={e => set({ opening_bid: e.target.value })} placeholder="e.g. 85 = ₦85,000,000" required />
            <Input label="Reserve Price (₦M)" type="number" step="0.1" min="0" value={form.reserve_price} onChange={e => set({ reserve_price: e.target.value })} placeholder="e.g. 95 = ₦95,000,000" />
            <Input label="Buy Now Price (₦M)" type="number" step="0.1" min="0" value={form.buy_now_price} onChange={e => set({ buy_now_price: e.target.value })} placeholder="Optional — e.g. 120 = ₦120,000,000" />
            <Input label="Min Bid Increment (₦M)" type="number" step="0.1" min="0" value={form.bid_increment} onChange={e => set({ bid_increment: e.target.value })} placeholder="blank = auto (max ₦500k, 5% of bid)" />
            {id && <Input label="Current Bid (₦M)" type="number" step="0.1" min="0" value={form.current_bid} onChange={e => set({ current_bid: e.target.value })} placeholder="e.g. 90 = ₦90,000,000" />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
            <Input label="Opens At" type="datetime-local" value={form.opens_at} onChange={e => set({ opens_at: e.target.value })} />
            <Input label="Closes At *" type="datetime-local" value={form.closes_at} onChange={e => set({ closes_at: e.target.value })} required />
            <Select label="Status" value={form.status} onChange={e => set({ status: e.target.value })} options={[
              { value: 'scheduled', label: 'Scheduled' }, { value: 'open', label: 'Open' },
              { value: 'closing', label: 'Closing' }, { value: 'closed', label: 'Closed' },
              { value: 'sold', label: 'Sold' }, { value: 'unsold', label: 'Unsold' },
            ]} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/auctions')}>Cancel</Button>
          <Button type="submit" loading={saving}>{id ? 'Save Changes' : 'Create Lot'}</Button>
        </div>
      </form>
    </div>
  )
}
