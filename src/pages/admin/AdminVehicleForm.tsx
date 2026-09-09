import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Vehicle, VehicleMedia, VehicleStatus, Transmission, FuelType, VehicleCondition, BodyType } from '@/types'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { useToast } from '@/context/ToastContext'
import { Star, Trash2 } from 'lucide-react'

const TRANSMISSION_OPTIONS = [
  { value: 'automatic', label: 'Automatic' }, { value: 'manual', label: 'Manual' },
  { value: 'semi-automatic', label: 'Semi-Automatic' },
]
const FUEL_OPTIONS = [
  { value: 'petrol', label: 'Petrol' }, { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' }, { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
]
const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' }, { value: 'used', label: 'Used' },
  { value: 'certified-pre-owned', label: 'Certified Pre-Owned' },
]
const BODY_OPTIONS = [
  { value: 'sedan', label: 'Sedan' }, { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' }, { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' }, { value: 'pickup', label: 'Pickup' },
  { value: 'wagon', label: 'Wagon' }, { value: 'van', label: 'Van' }, { value: 'truck', label: 'Truck' },
]
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' }, { value: 'walk-in', label: 'Walk-in (In Stock)' },
  { value: 'pre-order', label: 'Pre-Order' }, { value: 'in-auction', label: 'In Auction' },
  { value: 'sold', label: 'Sold' },
]

const emptyForm = {
  make: '', model: '', trim: '', year: new Date().getFullYear(), price: 0,
  mileage: 0, colour: '', currency: 'NGN', is_featured: false, is_corporate_only: false,
  description: '', features: [] as string[], transmission: 'automatic' as Transmission,
  fuel_type: 'petrol' as FuelType, condition: 'used' as VehicleCondition,
  body_type: 'sedan' as BodyType, status: 'draft' as VehicleStatus | 'draft',
}

export function AdminVehicleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isEdit = !!id
  const [form, setForm] = useState(emptyForm)
  const [featureInput, setFeatureInput] = useState('')
  const [uploadedMedia, setUploadedMedia] = useState<VehicleMedia[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const { data } = await supabase.from('vehicles').select('*, media:vehicle_media(*)').eq('id', id).single()
        if (data) {
          const v = data as unknown as Vehicle & { media: VehicleMedia[] }
          setForm({
            make: v.make, model: v.model, trim: v.trim || '', year: v.year,
            price: v.price, mileage: v.mileage, colour: v.colour, currency: v.currency,
            is_featured: v.is_featured, is_corporate_only: v.is_corporate_only,
            description: v.description ?? '', features: v.features,
            transmission: v.transmission, fuel_type: v.fuel_type, condition: v.condition,
            body_type: v.body_type, status: v.status,
          })
          if (v.media) setUploadedMedia(v.media)
        }
      } catch { showToast('Failed to load vehicle', 'error') }
    })()
  }, [id, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form, features: form.features.filter(Boolean),
      price: form.price || 0, mileage: form.mileage || 0,
      description: form.description || null, trim: form.trim || null,
    }

    if (isEdit) {
      const { error } = await supabase.from('vehicles').update(payload).eq('id', id!)
      setSaving(false)
      if (error) { showToast('Failed to update vehicle', 'error'); return }
      showToast('Vehicle updated')
      navigate('/admin/vehicles')
    } else {
      // Create vehicle first, then redirect to edit mode so media can be uploaded
      const { data, error } = await supabase.from('vehicles').insert(payload).select('id').single()
      setSaving(false)
      if (error || !data) { showToast('Failed to create vehicle', 'error'); return }
      showToast('Vehicle created — now add images')
      navigate(`/admin/vehicles/${data.id}/edit`)
    }
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }))
    setFeatureInput('')
  }

  const removeFeature = (i: number) => {
    setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))
  }

  const setPrimary = async (media: VehicleMedia) => {
    if (!media.id) { showToast('Please save the vehicle first, then set the show image', 'error'); return }
    const { error: clearErr } = await supabase.from('vehicle_media')
      .update({ is_primary: false })
      .eq('vehicle_id', id!)
      .eq('type', 'image')
    if (clearErr) { showToast('Failed to update media', 'error'); return }
    const { error: setErr } = await supabase.from('vehicle_media')
      .update({ is_primary: true })
      .eq('id', media.id)
    if (setErr) { showToast('Failed to set show image', 'error'); return }
    setUploadedMedia(prev => prev.map(m => ({ ...m, is_primary: m.id === media.id })))
    showToast('Show image updated')
  }

  const removeMedia = async (mediaId: string) => {
    if (!mediaId) return
    const { error } = await supabase.from('vehicle_media').delete().eq('id', mediaId)
    if (error) { showToast('Failed to remove media', 'error'); return }
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId))
    showToast('Media removed')
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <Input label="Make" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} required />
          <Input label="Model" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required />
          <Input label="Trim" value={form.trim} onChange={e => setForm(f => ({ ...f, trim: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <Input label="Year" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} min={2000} max={2030} required />
          <Input label="Price (₦)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} min={0} />
          <Input label="Mileage (km)" type="number" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: +e.target.value }))} min={0} />
          <Input label="Colour" value={form.colour} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr' }}>
          <Select label="Transmission" value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value as Transmission }))} options={TRANSMISSION_OPTIONS} />
          <Select label="Fuel Type" value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value as FuelType }))} options={FUEL_OPTIONS} />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr' }}>
          <Select label="Condition" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as VehicleCondition }))} options={CONDITION_OPTIONS} />
          <Select label="Body Type" value={form.body_type} onChange={e => setForm(f => ({ ...f, body_type: e.target.value as BodyType }))} options={BODY_OPTIONS} />
        </div>
        <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as VehicleStatus }))} options={STATUS_OPTIONS} />
        <TextArea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
        <div>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Features</label>
          <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
            {form.features.map((f, i) => (
              <span key={i} style={{ padding: '2px var(--space-1)', borderRadius: 'var(--radius-sm)', background: 'var(--navy-light)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {f}
                <button type="button" aria-label="Remove feature" onClick={() => removeFeature(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>&times;</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add feature" style={{ flex: 1 }} />
            <Button type="button" variant="secondary" size="sm" onClick={addFeature}>Add</Button>
          </div>
        </div>
        {isEdit && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Media</p>
            {uploadedMedia.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-1-5)', flexWrap: 'wrap', marginBottom: 'var(--space-1-5)' }}>
                {uploadedMedia.map((m, i) => (
                  <div key={m.id || i} style={{ width: 120 }}>
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: m.is_primary ? '2px solid var(--navy)' : '1px solid var(--border)' }}>
                      {m.type === 'video' ? (
                        <video src={m.url} style={{ width: '100%', height: 84, objectFit: 'cover' }} muted />
                      ) : (
                        <img src={m.url} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', display: 'block' }} />
                      )}
                      {m.is_primary && (
                        <span style={{ position: 'absolute', top: 4, left: 4, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 'var(--radius-full)', background: 'var(--navy)', color: '#fff', fontSize: 'var(--text-2xs)', fontWeight: 700 }}>
                          <Star size={9} fill="currentColor" /> Show Image
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'space-between' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        style={{ fontSize: 'var(--text-2xs)', padding: '2px 6px', height: 'auto', flex: 1 }}
                        onClick={() => setPrimary(m)}
                        disabled={m.is_primary}
                        title={m.is_primary ? 'This is the show image' : 'Set as the show image (renders first on cards)'}
                      >
                        {m.is_primary ? 'Show Image' : 'Set as Show Image'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        style={{ fontSize: 'var(--text-2xs)', padding: '2px 6px', height: 'auto', color: 'var(--error)', flexShrink: 0 }}
                        onClick={() => removeMedia(m.id)}
                        aria-label="Remove media"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <MediaUploader vehicleId={id} onUploaded={m => setUploadedMedia(p => [...p, m as unknown as VehicleMedia])} multiple />
          </div>
        )}
        {!isEdit && (
          <div style={{ padding: 'var(--space-2)', background: 'var(--navy-light)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>
            💡 Save the vehicle first, then add images on the edit page.
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-0-5)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-0-5)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={form.is_corporate_only} onChange={e => setForm(f => ({ ...f, is_corporate_only: e.target.checked }))} /> Corporate Only
          </label>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/vehicles')}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Update Vehicle' : 'Create Vehicle'}</Button>
        </div>
      </form>
    </div>
  )
}
