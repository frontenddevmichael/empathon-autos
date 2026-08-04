import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { LeadType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, TextArea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'

interface LeadFormProps {
  open: boolean
  onClose: () => void
  type?: LeadType
  vehicleId?: string
  initialMessage?: string
}

const typeOptions = [
  { value: 'enquiry', label: 'General Enquiry' },
  { value: 'test-drive', label: 'Test Drive Booking' },
  { value: 'pre-order', label: 'Pre-Order Request' },
  { value: 'corporate-quote', label: 'Corporate Quote' },
  { value: 'contact', label: 'Contact Message' },
]

export function LeadForm({ open, onClose, type = 'enquiry', vehicleId, initialMessage }: LeadFormProps) {
  const { showToast } = useToast()
  const [selectedType, setSelectedType] = useState<LeadType>(type)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [saving, setSaving] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    if (open) {
      setSelectedType(type)
      setForm(f => ({ ...f, message: initialMessage || '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) return
    if (!form.name || !form.email || !form.phone) { showToast('Please fill in required fields', 'error'); return }
    if (!isSupabaseConfigured()) {
      showToast('Enquiry form is not available right now. Please try again later.', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: selectedType, vehicle_id: vehicleId || null,
      name: form.name, email: form.email, phone: form.phone,
      company: form.company || null, message: form.message || null,
      source_page: window.location.pathname,
    })
    setSaving(false)
    if (error) { showToast('Failed to submit enquiry', 'error'); return }
    showToast('Enquiry submitted — we\'ll be in touch shortly')
    onClose()
    setForm({ name: '', email: '', phone: '', company: '', message: '' })
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Enquiry">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <input tabIndex={-1} value={honeypot} onChange={e => setHoneypot(e.target.value)} />
        </div>
        <Select label="Type" value={selectedType} options={typeOptions} onChange={e => setSelectedType(e.target.value as LeadType)} />
        <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Phone *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
        <Input label="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
        <TextArea label="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} />
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Send Enquiry</Button>
        </div>
      </form>
    </Modal>
  )
}