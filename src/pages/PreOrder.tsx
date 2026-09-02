import { useState } from 'react'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HoneypotField } from '@/components/HoneypotField'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { SeoHead } from '@/components/SeoHead'
import { submitLead } from '@/lib/queries'
import { IconEnquire, IconSourcing, IconReach } from '@/components/deco/BrandMarks'
import styles from './PreOrder.module.css'

const preOrderSteps = [
  { Icon: IconEnquire, title: 'Tell us what you need', desc: 'Make, model, year, and budget — as specific or open as you like.' },
  { Icon: IconSourcing, title: 'We source it', desc: 'From our network across North America, Europe, the Gulf, and the Far East.' },
  { Icon: IconReach, title: 'We deliver it', desc: 'Full logistics handled, delivered wherever you are in Nigeria.' },
]

export function PreOrder() {
  const { showToast } = useToast()
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [budget, setBudget] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [hp, setHp] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hp) return
    if (!make || !name || !email || !phone) return

    setSending(true)
    const { error } = await submitLead({
      type: 'pre-order',
      name,
      email,
      phone,
      message: `Make: ${make}\nModel: ${model || 'TBD'}\nYear: ${year || 'TBD'}\nBudget: ${budget || 'TBD'}\n\n${notes}`.trim(),
    })
    setSending(false)

    if (error) {
      showToast('Failed to submit pre-order. Please try again.', 'error')
      return
    }

    showToast('Pre-order submitted successfully. We will contact you shortly.')
    setMake(''); setModel(''); setYear(''); setBudget(''); setName(''); setEmail(''); setPhone(''); setNotes('')
  }

  return (
    <Section className={styles.page}>
      <SeoHead title="Pre-Order" description="Configure and pre-order your next vehicle. We source from North America, Europe, the Gulf, and the Far East." />
      <div className={styles.header}>
        <p className={styles.headerLabel}>Pre-Order</p>
        <h2>Configure Your Next Vehicle</h2>
        <p>Tell us what you are looking for and we will source it for you.</p>
      </div>

      <div className={styles.explainerGrid}>
        {preOrderSteps.map(s => (
          <div key={s.title} className={styles.explainerItem}>
            <s.Icon size={24} />
            <p className={styles.explainerTitle}>{s.title}</p>
            <p className={styles.explainerDesc}>{s.desc}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <HoneypotField value={hp} onChange={setHp} />
        <div className={styles.formRow}>
          <Input value={make} onChange={e => setMake(e.target.value)} label="Make *" required />
          <Input value={model} onChange={e => setModel(e.target.value)} label="Model" />
        </div>
        <div className={styles.formRow}>
          <Input value={year} onChange={e => setYear(e.target.value)} type="number" label="Year" min={2000} max={2030} />
          <Input value={budget} onChange={e => setBudget(e.target.value)} label="Budget (₦)" />
        </div>
        <hr className={styles.divider} />
        <Input value={name} onChange={e => setName(e.target.value)} label="Your name *" required />
        <div className={styles.formRow}>
          <Input value={email} onChange={e => setEmail(e.target.value)} type="email" label="Email *" required />
          <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" label="Phone *" required />
        </div>
        <TextArea value={notes} onChange={e => setNotes(e.target.value)} label="Additional notes or requirements..." rows={3} />
        <div className={styles.formSubmit}>
          <Button type="submit" loading={sending}>Submit Pre-Order</Button>
        </div>
      </form>
    </Section>
  )
}
