import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { config } from '@/lib/config'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HoneypotField } from '@/components/HoneypotField'
import { SeoHead } from '@/components/SeoHead'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { submitLead } from '@/lib/queries'
import styles from './Contact.module.css'

const details = [
  { icon: MapPin, label: 'Address', value: config.address },
  { icon: Phone, label: 'Phone', value: `${config.phonePrimary} / ${config.phoneSecondary}` },
  { icon: Mail, label: 'Email', value: config.email },
  { icon: Clock, label: 'Hours', value: config.businessHours },
]

export function Contact() {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hp) return
    if (!name || !email || !message) return

    setSending(true)
    const { error } = await submitLead({
      type: 'contact',
      name,
      email,
      phone,
      message,
    })
    setSending(false)

    if (error) {
      showToast('Failed to send message. Please try again.', 'error')
      return
    }

    showToast('Message sent successfully. We will respond within 24 hours.')
    setName(''); setEmail(''); setPhone(''); setMessage('')
  }

  return (
    <Section>
      <SeoHead title="Contact Us" description="Get in touch with Empathon Autos. Visit us in Ikeja, Lagos or call +234 802 339 2388." />
      <div className={styles.header}>
        <p className={styles.headerLabel}>Contact</p>
        <h2>Get in Touch</h2>
        <p>We would love to hear from you. Reach out with any questions.</p>
      </div>

      <div className={styles.layout}>
        <div>
          <div className={styles.details}>
            {details.map(d => (
              <div key={d.label} className={styles.detailItem}>
                <d.icon size={18} className={styles.detailIcon} />
                <div>
                  <p className={styles.detailLabel}>{d.label}</p>
                  <p className={styles.detailValue}>{d.value}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginTop: 'var(--space-1)' }}>
            Visit or call us during business hours for immediate assistance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <HoneypotField value={hp} onChange={setHp} />
          <div>
            <label htmlFor="c-name" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Your name *</label>
            <Input id="c-name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
          </div>
          <div className={styles.formRow}>
            <div>
              <label htmlFor="c-email" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email *</label>
              <Input id="c-email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="c-phone" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label>
              <Input id="c-phone" value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="0800 000 0000" />
            </div>
          </div>
          <div>
            <label htmlFor="c-message" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Message *</label>
            <TextArea id="c-message" value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" rows={4} required />
          </div>
          <div className={styles.formSubmit}>
            <Button type="submit" loading={sending}>Send Message</Button>
          </div>
        </form>
      </div>
    </Section>
  )
}
