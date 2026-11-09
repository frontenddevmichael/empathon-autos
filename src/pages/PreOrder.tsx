import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageHero } from '@/components/ui/PageHero'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { useMounted } from '@/hooks/useMounted'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import type { Vehicle, VehicleMedia } from '@/types'
import styles from './PreOrder.module.css'

const STEPS_FALLBACK = [
  { title: 'Tell us what you want', desc: 'Make, model, trim, colour, year, budget. The more specific you are, the better we can hunt.' },
  { title: 'Secure it with a deposit', desc: "A refundable deposit locks in your place. We'll give you a timeline and keep you posted." },
  { title: 'We handle everything', desc: "Sourcing, shipping and customs clearance. We've done it hundreds of times, so you just wait for the call." },
  { title: 'Inspect and drive away', desc: 'When it arrives at our Ikeja showroom, come and inspect it. If everything checks out, you drive home.' },
]

type Errors = { name?: string; email?: string; phone?: string; form?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PreOrder() {
  const mounted = useMounted()
  const { content: preOrderContent } = useSiteContent('pre-order')
  const steps = parseJsonContent(preOrderContent, 'steps', STEPS_FALLBACK)
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '', make: '', model: '', notes: '', honeypot: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*, media:vehicle_media(*)')
          .eq('status', 'pre-order')
          .limit(12)
        if (mounted.current) {
          if (error) {
            console.error('[PreOrder] Failed to load pre-order vehicles:', error.message)
          } else if (data) {
            setVehicles(data as unknown as (Vehicle & { media: VehicleMedia[] })[])
          }
        }
      } catch (err) {
        console.error('[PreOrder] Unexpected error loading vehicles:', err)
      }
      if (mounted.current) setLoading(false)
    })()
  }, [mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return

    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Please enter your name.'
    if (!form.email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'That email address doesn\u2019t look right.'
    if (!form.phone.trim()) next.phone = 'Please add a phone number so we can call you.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (!isSupabaseConfigured()) {
      setErrors({ form: 'The form is unavailable right now. Please call or email us instead.' })
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'pre-order',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: `Pre-order request. Make: ${form.make.trim() || 'Any'}, Model: ${form.model.trim() || 'Any'}. ${form.notes.trim()}`.trim(),
      source_page: '/pre-order',
    })
    setSaving(false)
    if (error) { setErrors({ form: 'We couldn\u2019t submit that. Please try again or call us directly.' }); return }
    setSent(true)
  }

  const reset = () => {
    setForm({ name: '', email: '', phone: '', make: '', model: '', notes: '', honeypot: '' })
    setErrors({})
    setSent(false)
  }

  return (
    <>
      <PageHero
        label="Pre-order"
        title="Order the car you actually want"
        subtitle="If it isn't on the lot, we'll source it through our network, anywhere from Lagos to Los Angeles."
        images={[{ url: '/heroimg4.jpg' }, { url: '/heroimg5.jpg' }]}
        overlay="left"
      />

      <Section tone="paper" space="sm">
        <SectionHeader
          label="Pre-order fleet"
          title="Inbound and available to order"
          desc="Already sourced or on the water. Reserve one with a deposit, or ask for something completely different below."
        />

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : vehicles.length > 0 ? (
          <>
            <div className={`scroll-reveal stagger-fade-in ${styles.grid}`}>
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
            <p className={styles.more}>
              <Link to="/inventory?status=pre-order">View all pre-order vehicles</Link>
            </p>
          </>
        ) : (
          <p className={styles.empty}>
            Nothing inbound at the moment. <a href="#request">Tell us what you want below</a> and we'll go looking.
          </p>
        )}
      </Section>

      <Section tone="warm" space="md">
        <SectionHeader
          label="How it works"
          title="From request to keys"
          desc="You tell us what you want. We find it, ship it, clear it, then call you when it's ready."
        />
        <ol className={`scroll-reveal stagger-fade-in ${styles.steps}`}>
          {steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepIndex}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className={styles.stepTitle}>{s.title.replace(/^\d+\.\s*/, '')}</h3>
                <p className={styles.stepText}>{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="paper" space="md">
        <div id="request" className={styles.request}>
          <SectionHeader
            label="Start the search"
            title="Tell us what you want"
            desc="A few details and we'll start looking. No obligation."
          />

          {sent ? (
            <div className={styles.success} role="status">
              <h2 className={styles.successTitle}>Request received.</h2>
              <p className={styles.successBody}>
                We'll start the search and come back to you at {form.email} with options and a timeline.
              </p>
              <Button variant="secondary" size="sm" onClick={reset}>Send another request</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.honeypot} aria-hidden="true">
                <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
              </div>
              <Input
                label="Name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: undefined })) }}
                error={errors.name}
                autoComplete="name"
              />
              <div className={styles.formRow}>
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                  error={errors.email}
                  autoComplete="email"
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
              <div className={styles.formRow}>
                <Input label="Make" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="Any" />
                <Input label="Model" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Any" />
              </div>
              <TextArea
                label="Notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Colour, trim, budget, timing…"
              />
              {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}
              <Button type="submit" loading={saving} className={styles.submit}>Submit request</Button>
            </form>
          )}
        </div>
      </Section>
    </>
  )
}
