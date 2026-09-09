import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { LeadType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, TextArea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { useRateLimit } from '@/hooks/useRateLimit'
import { Calendar, Clock } from 'lucide-react'

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

const timeSlots = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
]

export function LeadForm({ open, onClose, type = 'enquiry', vehicleId, initialMessage }: LeadFormProps) {
  const { showToast } = useToast()
  const { canSubmit } = useRateLimit()
  const [selectedType, setSelectedType] = useState<LeadType>(type)
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', company: '', message: '',
    preferredDate: '', preferredTime: ''
  })
  const [saving, setSaving] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    if (open) {
      setSelectedType(type)
      setForm(f => ({ ...f, message: initialMessage || '' }))
    }
  }, [open, type, initialMessage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) return
    if (!form.name || !form.email || !form.phone) { showToast('Please fill in required fields', 'error'); return }
    if (selectedType === 'test-drive' && (!form.preferredDate || !form.preferredTime)) {
      showToast('Please select a date and time for your test drive', 'error'); return
    }
    if (!canSubmit()) { showToast('Please wait before submitting again', 'error'); return }
    if (!isSupabaseConfigured()) {
      showToast('Form is not available right now. Please try again later.', 'error')
      return
    }

    let message = form.message || ''
    if (selectedType === 'test-drive') {
      message = `Test Drive Booking — Date: ${form.preferredDate}, Time: ${form.preferredTime}. ${message}`.trim()
    }

    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: selectedType, vehicle_id: vehicleId || null,
      name: form.name, email: form.email, phone: form.phone,
      company: form.company || null, message: message || null,
      source_page: window.location.pathname,
    })
    setSaving(false)
    if (error) { showToast('Failed to submit enquiry', 'error'); return }
    showToast('Enquiry submitted — we\'ll be in touch shortly')
    onClose()
    setForm({ name: '', email: '', phone: '', company: '', message: '', preferredDate: '', preferredTime: '' })
  }

  const isTestDrive = selectedType === 'test-drive'

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

        {/* Test Drive Time Slot Selection */}
        {isTestDrive && (
          <div style={{ padding: 'var(--space-2)', background: 'var(--paper-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Calendar size={16} /> Select Preferred Date & Time
            </p>
            <div className="testDriveFields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1-5)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4, display: 'block' }}>Date *</label>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    background: 'var(--surface)',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4, display: 'block' }}>Time *</label>
                <select
                  value={form.preferredTime}
                  onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    background: 'var(--surface)',
                  }}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginTop: 'var(--space-1)' }}>
              <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Test drives available Mon–Sat, 9:00 AM – 5:00 PM
            </p>
          </div>
        )}

        <TextArea label="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} />
        
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>
            {isTestDrive ? 'Book Test Drive' : 'Send Enquiry'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
