import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { config } from '@/lib/config'
import styles from './KYCRegistration.module.css'

type Errors = { fullName?: string; email?: string; phone?: string; idNumber?: string; consent?: string; form?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ID_OPTIONS = [
  { value: 'nin', label: 'National ID (NIN)' },
  { value: 'vin', label: "Voter's card (VIN)" },
  { value: 'passport', label: 'International passport' },
  { value: 'drivers', label: "Driver's licence" },
]

const WHY = [
  'Bid in live auctions',
  'Personalised vehicle recommendations',
  'Priority access to new stock',
  'A record of your bids and status',
]

export function KYCRegistration() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    occupation: '',
    address: '',
    idType: 'nin',
    idNumber: '',
    howHeard: '',
    consent: false,
    honeypot: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key as keyof Errors]) setErrors(p => ({ ...p, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return

    const next: Errors = {}
    if (!form.fullName.trim()) next.fullName = 'Please enter your full name.'
    if (!form.email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'That email address doesn\u2019t look right.'
    if (!form.phone.trim()) next.phone = 'Please add a phone number.'
    if (!form.idNumber.trim()) next.idNumber = 'Please enter your ID number.'
    if (!form.consent) next.consent = 'Please agree to the terms to continue.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (!isSupabaseConfigured()) {
      setErrors({ form: 'Registration is unavailable right now. Please try again later.' })
      return
    }

    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'enquiry',
      name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || null,
      message: `KYC Registration — Occupation: ${form.occupation.trim() || 'N/A'}, Address: ${form.address.trim() || 'N/A'}, ID Type: ${form.idType}, ID Number: ${form.idNumber.trim()}, How heard: ${form.howHeard.trim() || 'N/A'}`,
      source_page: '/register',
    })
    setSaving(false)

    if (error) { setErrors({ form: 'Registration failed. Please try again.' }); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Section tone="paper" space="lg">
        <div className={styles.done}>
          <h1 className={styles.doneTitle}>You're registered.</h1>
          <p className={styles.doneText}>
            Thank you for registering with {config.company.name}. Our team will review your details and reach out shortly.
          </p>
          <div className={styles.doneActions}>
            <Link to="/auctions"><Button>Browse auctions</Button></Link>
            <Link to="/" className={styles.textLink}>Back to home</Link>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <>
      <Section tone="paper" space="sm">
        <SectionHeader
          as="h1"
          size="lg"
          label="Registration"
          title="Register to bid"
          desc="Complete your KYC details to take part in auctions and receive personalised offers."
        />
      </Section>

      <Section tone="paper" space="sm">
        <div className={styles.layout}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.honeypot} aria-hidden="true">
              <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
            </div>

            <fieldset className={styles.group}>
              <legend className={styles.legend}>Personal</legend>
              <Input
                label="Full name"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                error={errors.fullName}
                autoComplete="name"
              />
              <div className={styles.row}>
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  error={errors.phone}
                  autoComplete="tel"
                />
              </div>
              <div className={styles.row}>
                <Input
                  label="Company (optional)"
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                  autoComplete="organization"
                />
                <Input
                  label="Occupation (optional)"
                  value={form.occupation}
                  onChange={e => set('occupation', e.target.value)}
                  placeholder="e.g. Business owner"
                />
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend className={styles.legend}>Identification</legend>
              <div className={styles.row}>
                <Select
                  label="ID type"
                  options={ID_OPTIONS}
                  value={form.idType}
                  onChange={e => set('idType', e.target.value)}
                />
                <Input
                  label="ID number"
                  value={form.idNumber}
                  onChange={e => set('idNumber', e.target.value)}
                  error={errors.idNumber}
                />
              </div>
              <TextArea
                label="Address (optional)"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                rows={2}
                autoComplete="street-address"
              />
            </fieldset>

            <fieldset className={styles.group}>
              <legend className={styles.legend}>Last details</legend>
              <Input
                label="How did you hear about us? (optional)"
                value={form.howHeard}
                onChange={e => set('howHeard', e.target.value)}
                placeholder="e.g. Google, social media, referral"
              />

              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => set('consent', e.target.checked)}
                />
                <span>
                  I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>, and consent to {config.company.name} processing my
                  data for auction participation and service delivery.
                </span>
              </label>
              {errors.consent && <p className={styles.error} role="alert">{errors.consent}</p>}
            </fieldset>

            {errors.form && <p className={styles.error} role="alert">{errors.form}</p>}

            <Button type="submit" loading={saving} className={styles.submit}>Complete registration</Button>
          </form>

          <aside className={styles.aside}>
            <p className={styles.asideLabel}>Why register</p>
            <ul className={styles.why}>
              {WHY.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className={styles.asideText}>
              Questions about what we ask for? <Link to="/contact">Talk to us</Link> before you submit.
            </p>
          </aside>
        </div>
      </Section>
    </>
  )
}
