import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useToast } from '@/context/ToastContext'
import { RippleButton } from '@/components/RippleButton'
import { HeroSection } from '@/components/HeroSection'
import { CarKey, RoadDraw } from '@/components/DecoSvgs'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia } from '@/types'
import styles from './PreOrder.module.css'

const steps = [
  { title: '1. Tell Us What You Want', desc: 'Make, model, trim, colour, year, budget — the more specific you are, the better we can hunt.' },
  { title: '2. Secure It With a Deposit', desc: "A refundable deposit locks in your place. We'll give you a timeline and keep you posted." },
  { title: '3. We Handle Everything', desc: "Sourcing, shipping, customs clearance — we've done it hundreds of times. You just wait for the call." },
  { title: '4. Inspect & Drive Away', desc: 'When it arrives at our Ikeja showroom, come inspect it. If everything checks out, you drive home.' },
]

export function PreOrder() {
  const { showToast } = useToast()
  const mounted = useMounted()
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '', make: '', model: '', notes: '', honeypot: '' })
  const [saving, setSaving] = useState(false)

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
    if (!form.name || !form.email || !form.phone) return
    if (!isSupabaseConfigured()) {
      showToast('Form is not available right now. Please try again later.', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'pre-order',
      name: form.name, email: form.email, phone: form.phone,
      message: `Pre-order request — Make: ${form.make || 'Any'}, Model: ${form.model || 'Any'}. ${form.notes || ''}`.trim(),
      source_page: '/pre-order',
    })
    setSaving(false)
    if (error) { showToast('Failed to submit', 'error'); return }
    showToast('Pre-order request submitted — we\'ll be in touch with next steps')
    setForm({ name: '', email: '', phone: '', make: '', model: '', notes: '', honeypot: '' })
  }

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1774578432996-54e195b3c5b0?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1779025313068-b4a11d86bf0d?w=1400&q=90&fit=crop' },
        ]}
        label="Pre-Order"
        title="Order the Vehicle You Really Want"
        subtitle="Can't find that exact spec on the lot? Tell us what you want and we'll track it down through our global network."
        deco="circle"
      />

      {/* Pre-Order Fleet */}
      <Section className="scroll-reveal reveal-right" style={{ position: 'relative' }}>
        <SectionHeader
          label="Pre-Order Fleet"
          title="Inbound & Available to Order"
          desc="These vehicles are already sourced or inbound. Reserve one with a deposit, or tell us about something completely different below."
        />

        {loading ? (
          <div className="stagger-fade-in" style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : vehicles.length > 0 ? (
          <>
            <div className="scroll-reveal stagger-fade-in" style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <Link to="/inventory?status=pre-order">
                <RippleButton variant="secondary">View All Pre-Order Vehicles <ArrowRight size={14} /></RippleButton>
              </Link>
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>
            No pre-order vehicles right now — <Link to="#request">tell us what you want below</Link> and we'll find it.
          </p>
        )}
      </Section>

      {/* How It Works */}
      <Section className="scroll-reveal reveal-scale" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
        <CarKey className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', opacity: 0.08 }} size={64} />
        <SectionHeader
          label="How It Works"
          title="Four Simple Steps"
          desc="You tell us what you want. We find it, ship it, clear it, and call you when it's ready. Simple."
        />
        {/* Hand-drawn road — the journey from request to delivery, draws on reveal */}
        <RoadDraw className="deco-positioned" style={{ margin: 'var(--space-1) auto var(--space-4)', maxWidth: 620 }} />
        <div className={`scroll-reveal stagger-fade-in ${styles.stepsGrid}`}>
          {steps.map((s, i) => (
            <div key={s.title} className={styles.stepCard}>
              <span className={styles.stepIndex}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Request Form */}
      <Section className="scroll-reveal reveal-big" style={{ position: 'relative' }}>
        <div id="request" style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionHeader
            label="Start the Search"
            title="Tell Us What You Want"
            desc="Fill in the details and we'll start the search. No obligation, no pressure."
            align="center"
          />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
            </div>
            <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Phone *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1-5)' }}>
              <Input label="Preferred Make" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} />
              <Input label="Preferred Model" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
            </div>
            <TextArea label="Additional Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Colour, trim level, budget, timing..." />
            <RippleButton type="submit" loading={saving}>Submit Pre-Order Request</RippleButton>
          </form>
        </div>
      </Section>
    </>
  )
}
