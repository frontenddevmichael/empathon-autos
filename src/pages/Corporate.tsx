import { useState } from 'react'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HoneypotField } from '@/components/HoneypotField'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { SeoHead } from '@/components/SeoHead'
import { submitLead } from '@/lib/queries'
import { IconFleet, IconLease, IconMaintenance, IconReporting } from '@/components/deco/BrandMarks'
import styles from './Corporate.module.css'

const services = [
  { Icon: IconFleet, title: 'Fleet Procurement', desc: 'Source vehicles at competitive corporate rates with consistent specifications across your fleet.' },
  { Icon: IconLease, title: 'Leasing Options', desc: 'Flexible operating and finance lease structures designed for corporate budgets and cash flow.' },
  { Icon: IconMaintenance, title: 'Maintenance Plans', desc: 'Scheduled servicing, repairs, and replacement vehicles to minimise downtime.' },
  { Icon: IconReporting, title: 'Corporate Reporting', desc: 'Detailed fleet analytics, cost tracking, and usage reports for your finance team.' },
]

export function Corporate() {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [fleetSize, setFleetSize] = useState('')
  const [notes, setNotes] = useState('')
  const [hp, setHp] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hp) return
    if (!name || !email || !phone || !company) return

    setSending(true)
    const { error } = await submitLead({
      type: 'corporate-quote',
      name,
      email,
      phone,
      company,
      message: `Fleet size: ${fleetSize || 'Not specified'}\n\n${notes}`.trim(),
    })
    setSending(false)

    if (error) {
      showToast('Failed to submit. Please try again.', 'error')
      return
    }

    showToast('Corporate enquiry submitted. Our team will reach out.')
    setName(''); setEmail(''); setPhone(''); setCompany(''); setFleetSize(''); setNotes('')
  }

  return (
    <Section>
      <SeoHead title="Corporate Fleet Solutions" description="Tailored vehicle procurement and fleet management for businesses across Nigeria. Leasing, maintenance, and reporting." />
      <div className={styles.header}>
        <p className={styles.headerLabel}>Corporate</p>
        <h2>Corporate Fleet Solutions</h2>
        <p>Tailored vehicle procurement and fleet management for businesses across Nigeria.</p>
      </div>

      <div className={styles.servicesGrid}>
        {services.map(s => (
          <div key={s.title} className={styles.serviceCard}>
            <s.Icon size={26} />
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>


      <div className={styles.quoteSection}>
        <h3 className={styles.quoteTitle}>Request a Corporate Quote</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <HoneypotField value={hp} onChange={setHp} />
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name *" required />
          <div className={styles.formRow}>
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email *" required />
            <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="Phone *" required />
          </div>
          <div className={styles.formRow}>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name *" required />
            <Input value={fleetSize} onChange={e => setFleetSize(e.target.value)} type="number" placeholder="Fleet size" min={1} />
          </div>
          <TextArea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional requirements..." rows={3} />
          <div className={styles.formSubmit}>
            <Button type="submit" loading={sending}>Submit Enquiry</Button>
          </div>
        </form>
      </div>
    </Section>
  )
}
