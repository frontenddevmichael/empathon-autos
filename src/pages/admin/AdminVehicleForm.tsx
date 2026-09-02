import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Vehicle, VehicleMedia, VehicleStatus, Transmission, FuelType, VehicleCondition, BodyType } from '@/types'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { useToast } from '@/context/ToastContext'
import {
  TRANSMISSION_OPTIONS, FUEL_OPTIONS, CONDITION_OPTIONS,
  BODY_OPTIONS, STATUS_OPTIONS,
} from '@/lib/constants'

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
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const { data } = await supabase.from('vehicles').select('*, media:vehicle_media(*)').eq('id', id).single()
        if (data) {
          const v = data as Vehicle & { media: VehicleMedia[] }
          setForm({
            make: v.make, model: v.model, trim: v.trim || '', year: v.year,
            price: v.price, mileage: v.mileage, colour: v.colour, currency: v.currency,
            is_featured: v.is_featured, is_corporate_only: v.is_corporate_only,
            description: v.description ?? '', features: v.features,
            transmission: v.transmission, fuel_type: v.fuel_type, condition: v.condition,
            body_type: v.body_type, status: v.status,
          })
        }
      } catch (e) { showToast('Failed to load vehicle', 'error') }
    })()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      features: form.features.filter(Boolean),
      price: form.price || 0,
      mileage: form.mileage || 0,
      description: form.description || null,
      trim: form.trim || null,
    }
    const q = isEdit
      ? supabase.from('vehicles').update(payload).eq('id', id!)
      : supabase.from('vehicles').insert(payload)
    const { error } = await q
    setSaving(false)
    if (error) { showToast(`Failed to ${isEdit ? 'update' : 'create'} vehicle`, 'error'); return }
    showToast(`Vehicle ${isEdit ? 'updated' : 'created'}`)
    navigate('/admin/vehicles')
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }))
    setFeatureInput('')
  }

  const removeFeature = (i: number) => {
    setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <Input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} label="Make *" required />
          <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} label="Model *" required />
          <Input value={form.trim} onChange={e => setForm(f => ({ ...f, trim: e.target.value }))} label="Trim" />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} type="number" label="Year" min={2000} max={2030} required />
          <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} type="number" label="Price (₦)" min={0} />
          <Input value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: +e.target.value }))} type="number" label="Mileage (km)" min={0} />
          <Input value={form.colour} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} label="Colour" />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr' }}>
          <Select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value as Transmission }))} options={TRANSMISSION_OPTIONS} label="Transmission" />
          <Select value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value as FuelType }))} options={FUEL_OPTIONS} label="Fuel Type" />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: '1fr 1fr' }}>
          <Select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as VehicleCondition }))} options={CONDITION_OPTIONS} label="Condition" />
          <Select value={form.body_type} onChange={e => setForm(f => ({ ...f, body_type: e.target.value as BodyType }))} options={BODY_OPTIONS} label="Body Type" />
        </div>
        <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as VehicleStatus }))} options={STATUS_OPTIONS} label="Status" />
        <TextArea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} label="Description" rows={3} />
        <div>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Features</label>
          <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
            {form.features.map((f, i) => (
              <span key={i} style={{ padding: '2px var(--space-1)', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {f}
                <button type="button" aria-label="Remove feature" onClick={() => removeFeature(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>&times;</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} label="Add feature" style={{ flex: 1 }} />
            <Button type="button" variant="secondary" size="sm" onClick={addFeature}>Add</Button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-0-5)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-0-5)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={form.is_corporate_only} onChange={e => setForm(f => ({ ...f, is_corporate_only: e.target.checked }))} /> Corporate Only
          </label>
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Media</p>
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
            {uploadedMedia.map((m, i) => (
              <img key={i} src={m.url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
          {id ? (
            <MediaUploader vehicleId={id} onUploaded={m => setUploadedMedia(p => [...p, m])} />
          ) : (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Save the vehicle first, then upload images.</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/vehicles')}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Update Vehicle' : 'Create Vehicle'}</Button>
        </div>
      </form>
    </div>
  )
}
