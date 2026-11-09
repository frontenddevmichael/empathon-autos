import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import styles from './Electric.module.css'

const EV_BRANDS_FALLBACK = [
  { name: 'Mercedes-Benz', logo: '/brands/mercedes.svg', models: 8, tagline: 'Luxury electric innovation' },
  { name: 'BMW', logo: '/brands/bmw.svg', models: 5, tagline: 'The ultimate electric driving machine' },
  { name: 'Tesla', logo: '/brands/tesla.svg', models: 4, tagline: 'Leading the EV revolution' },
  { name: 'Audi', logo: '/brands/audi.svg', models: 3, tagline: 'Vorsprung durch Technik' },
  { name: 'Porsche', logo: '/brands/porsche.svg', models: 2, tagline: 'Electric performance' },
  { name: 'Hyundai', logo: '/brands/hyundai.svg', models: 3, tagline: 'Smart mobility solutions' },
]

const EV_MODELS_FALLBACK = [
  { name: 'Mercedes-Benz EQS', range: '680 km', power: '516 hp', tag: 'Flagship electric saloon', price: '₦85M+', img: 'https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQE', range: '620 km', power: '288 hp', tag: 'Executive electric sedan', price: '₦65M+', img: 'https://images.unsplash.com/photo-1708903517532-03bea2418854?w=900&q=80&fit=crop' },
  { name: 'BMW iX', range: '600 km', power: '516 hp', tag: 'Luxury electric SUV', price: '₦70M+', img: 'https://images.unsplash.com/photo-1568559598349-dbf322d50a48?w=900&q=80&fit=crop' },
  { name: 'Tesla Model S', range: '650 km', power: '670 hp', tag: 'Performance sedan', price: '₦75M+', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQB', range: '440 km', power: '215 hp', tag: 'Electric family SUV', price: '₦45M+', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900&q=80&fit=crop' },
  { name: 'BMW i4', range: '520 km', power: '335 hp', tag: 'Electric gran coupé', price: '₦55M+', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80&fit=crop' },
]

const COST_SAVINGS_FALLBACK = [
  { title: 'Fuel', desc: 'Compared with a petrol equivalent over a year of Lagos driving.', amount: '₦2M+' },
  { title: 'Maintenance', desc: 'Fewer moving parts, no oil changes and less brake wear.', amount: '₦500K+' },
  { title: 'Time', desc: 'Charge overnight at home instead of queueing at a station.', amount: '100 hrs' },
  { title: 'Five-year cost', desc: 'Total cost of ownership against an equivalent petrol luxury car.', amount: '30–40%' },
]

const BENEFITS_FALLBACK = [
  { title: 'Long real-world range', desc: 'Modern EVs deliver 400–700 km on a single charge — plenty for Lagos and beyond.' },
  { title: 'Serious performance', desc: 'Instant torque, a near-silent drivetrain, and 0–100 in under five seconds on flagship models.' },
  { title: 'Zero emissions', desc: 'No tailpipe emissions at all.' },
  { title: 'Technology that leads', desc: 'Hyperscreens, over-the-air updates and driver assistance that keeps improving.' },
  { title: 'Charging made simple', desc: 'Charge overnight at home or the office. We help you plan the setup.' },
  { title: 'Battery health, verified', desc: 'Every unit ships with a battery health report and care guidance.' },
  { title: 'A quiet, refined ride', desc: 'No engine noise and no gearbox lag — just smooth acceleration.' },
  { title: 'Long-term value', desc: 'Fewer moving parts and strong resale demand in Nigeria.' },
]

type Errors = { name?: string; email?: string; phone?: string; form?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Electric() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', model: '', notes: '', honeypot: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const { content: evContent } = useSiteContent('ev')

  const evBrands = parseJsonContent(evContent, 'ev_brands', EV_BRANDS_FALLBACK)
  const evModels = parseJsonContent(evContent, 'ev_models', EV_MODELS_FALLBACK)
  const costSavings = parseJsonContent(evContent, 'cost_savings', COST_SAVINGS_FALLBACK)
  const benefits = parseJsonContent(evContent, 'benefits', BENEFITS_FALLBACK)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return

    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Please enter your name.'
    if (!form.email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'That email address doesn\u2019t look right.'
    if (!form.phone.trim()) next.phone = 'Please add a phone number.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (!isSupabaseConfigured()) {
      setErrors({ form: 'The form is unavailable right now. Please call or email us instead.' })
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'ev-enquiry',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: `EV enquiry — Model: ${form.model.trim() || 'Any'}. ${form.notes.trim()}`.trim(),
      source_page: '/ev',
    })
    setSaving(false)
    if (error) { setErrors({ form: 'We couldn\u2019t submit that. Please try again.' }); return }
    setSent(true)
  }

  const reset = () => {
    setForm({ name: '', email: '', phone: '', model: '', notes: '', honeypot: '' })
    setErrors({})
    setSent(false)
  }

  const filteredModels = selectedBrand
    ? evModels.filter(m => m.name.includes(selectedBrand))
    : evModels

  return (
    <>
      <Section tone="paper" space="sm">
        <SectionHeader
          as="h1"
          size="lg"
          label="Electric"
          title="Electric, without the compromise."
          desc="Premium EVs imported, inspected and ready for Nigerian roads — with charging advice and battery reports on every unit."
        />
      </Section>

      <Section tone="paper" space="sm">
        <SectionHeader label="Our EV partners" title="Brands we source" />
        <div className={styles.chips}>
          {evBrands.map(brand => (
            <button
              key={brand.name}
              type="button"
              className={`${styles.chip} ${selectedBrand === brand.name ? styles.chipActive : ''}`}
              onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
            >
              {brand.name}
              {selectedBrand === brand.name && <span aria-hidden="true"> ×</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section tone="navy" space="sm">
        <div className={styles.savingsHead}>
          <p className={styles.kicker}>Running costs</p>
          <h2 className={styles.savingsTitle}>What you save by going electric</h2>
        </div>
        <dl className={styles.savings}>
          {costSavings.map(saving => (
            <div key={saving.title} className={styles.saving}>
              <dt className={styles.savingLabel}>{saving.title}</dt>
              <dd className={styles.savingAmount}>{saving.amount}</dd>
              <p className={styles.savingDesc}>{saving.desc}</p>
            </div>
          ))}
        </dl>
        <p className={styles.savingsNote}>
          Estimates for a typical Lagos owner. <Link to="/contact">Ask us to work it out for your usage</Link>.
        </p>
      </Section>

      <Section tone="paper" space="md">
        <SectionHeader
          label="Available models"
          title={selectedBrand ? `${selectedBrand} models` : 'A taste of what we can source'}
          desc={
            selectedBrand
              ? "Can't see your exact spec? Ask — we'll track it down."
              : 'Filter by brand above, or ask about any model.'
          }
        />

        {filteredModels.length === 0 ? (
          <p className={styles.empty}>
            No models listed for {selectedBrand}. <Link to="/contact">Tell us what you're after</Link> and we'll source it.
          </p>
        ) : (
          <div className={`scroll-reveal stagger-fade-in ${styles.models}`}>
            {filteredModels.map(m => (
              <Link to="/contact" key={m.name} className={styles.model}>
                {m.img && (
                  <div className={styles.modelMedia}>
                    <img src={m.img} alt="" loading="lazy" className={styles.modelImage} />
                  </div>
                )}
                <div className={styles.modelBody}>
                  <p className={styles.modelTag}>{m.tag}</p>
                  <h3 className={styles.modelName}>{m.name}</h3>
                  <p className={styles.modelSpecs}>
                    <span>{m.range}</span>
                    <span>{m.power}</span>
                  </p>
                  <p className={styles.modelPrice}>{m.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section tone="warm" space="sm">
        <SectionHeader label="Why electric" title="The case for it" />
        <ul className={styles.benefits}>
          {benefits.map(b => (
            <li key={b.title} className={styles.benefit}>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="paper" space="md">
        <div className={styles.enquiry} id="enquiry">
          <SectionHeader
            label="EV enquiry"
            title="Interested in an EV?"
            desc="Tell us which model you're after and we'll source it — charging advice included."
          />

          {sent ? (
            <div className={styles.success} role="status">
              <h2 className={styles.successTitle}>Enquiry received.</h2>
              <p className={styles.successBody}>
                Our team will reach you at {form.email} shortly with options and next steps.
              </p>
              <Button variant="secondary" size="sm" onClick={reset}>Send another enquiry</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.honeypot} aria-hidden="true">
                <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
              </div>
              <div className={styles.formRow}>
                <Input
                  label="Name"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: undefined })) }}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); if (errors.phone) setErrors(p => ({ ...p, phone: undefined })) }}
                  error={errors.phone}
                  autoComplete="tel"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Model of interest"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                placeholder="e.g. Mercedes-Benz EQS 450"
              />
              <TextArea
                label="Notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Budget, colour, timing…"
              />
              {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}
              <Button type="submit" loading={saving} className={styles.submit}>Request enquiry</Button>
            </form>
          )}
        </div>
      </Section>
    </>
  )
}

export default Electric
