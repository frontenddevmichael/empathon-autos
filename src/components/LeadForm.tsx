import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HoneypotField } from '@/components/HoneypotField'
import { submitLead } from '@/lib/queries'
import type { LeadType } from '@/types'
import { useToast } from '@/context/ToastContext'

interface LeadFormProps {
  open: boolean
  onClose: () => void
  type: LeadType
  vehicleId?: string
}

export function LeadForm({ open, onClose, type, vehicleId }: LeadFormProps) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hp) return
    if (!name || !email || !phone) return

    setSending(true)
    const { error } = await submitLead({
      type,
      vehicleId,
      name,
      email,
      phone,
      company,
      message,
    })
    setSending(false)

    if (error) {
      showToast('Failed to send your enquiry. Please try again.', 'error')
      return
    }

    showToast('Enquiry sent successfully. We will get back to you shortly.')
    setName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setMessage('')
    onClose()
  }

  const titles: Record<LeadType, string> = {
    enquiry: 'Enquire About This Vehicle',
    'test-drive': 'Book a Test Drive',
    'pre-order': 'Pre-Order a Vehicle',
    'corporate-quote': 'Request Corporate Quote',
    contact: 'Get in Touch',
  }

  return (
    <Modal open={open} onClose={onClose} title={titles[type]}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', position: 'relative' }}>
        <HoneypotField value={hp} onChange={setHp} />
        <div>
          <label htmlFor="lf-name" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Full name *</label>
          <Input id="lf-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
        </div>
        <div>
          <label htmlFor="lf-email" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email address *</label>
          <Input id="lf-email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <label htmlFor="lf-phone" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone number *</label>
          <Input id="lf-phone" value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="0800 000 0000" required />
        </div>
        <div>
          <label htmlFor="lf-company" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Company</label>
          <Input id="lf-company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" />
        </div>
        <div>
          <label htmlFor="lf-message" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Message</label>
          <TextArea id="lf-message" value={message} onChange={e => setMessage(e.target.value)} placeholder={type === 'test-drive' ? 'Preferred date and time for test drive...' : 'Your message (optional)'} rows={3} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-1)', paddingTop: 'var(--space-1)' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={sending}>Send Enquiry</Button>
        </div>
      </form>
    </Modal>
  )
}
