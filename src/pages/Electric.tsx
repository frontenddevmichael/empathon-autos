import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Battery, Zap, Gauge, Leaf } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { RippleButton } from '@/components/RippleButton'
import { SplitHeading } from '@/components/SplitHeading'
import { HeroSection } from '@/components/HeroSection'
import { ParallaxSection } from '@/components/ParallaxSection'
import { HandDots, HandCircle, Speedometer, ShieldCheck } from '@/components/DecoSvgs'

const EV_MODELS = [
  { name: 'Mercedes-Benz EQS', range: '680 km', power: '516 hp', tag: 'Flagship Electric Saloon', img: 'https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQE', range: '620 km', power: '288 hp', tag: 'Executive Electric Sedan', img: 'https://images.unsplash.com/photo-1708903517532-03bea2418854?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQB', range: '440 km', power: '215 hp', tag: 'Electric Family SUV', img: 'https://images.unsplash.com/photo-1568559598349-dbf322d50a48?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQS SUV', range: '600 km', power: '536 hp', tag: 'Electric Luxury SUV', img: 'https://images.unsplash.com/photo-1668248835473-c2f28c752663?w=900&q=80&fit=crop' },
]

const BENEFITS = [
  { icon: Battery, title: 'Long Real-World Range', desc: 'Modern EQs deliver 400–700 km on a single charge — plenty for Lagos and beyond.' },
  { icon: Zap, title: 'Serious Performance', desc: 'Instant torque, silent drivetrain, and 0–100 in under 5 seconds on flagship models.' },
  { icon: Leaf, title: 'Lower Running Costs', desc: 'No fuel bills. Charging costs a fraction, and fewer moving parts means fewer repairs.' },
  { icon: Gauge, title: 'Tech That Leads', desc: 'MBUX hyperscreen, over-the-air updates, and autonomous-ready driving aids.' },
]

export function Electric() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', model: '', notes: '', honeypot: '' })
  const [saving, setSaving] = useState(false)

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
      type: 'ev-enquiry',
      name: form.name, email: form.email, phone: form.phone,
      message: `EV enquiry — Model: ${form.model || 'Any'}. ${form.notes || ''}`.trim(),
      source_page: '/ev',
    })
    setSaving(false)
    if (error) { showToast('Failed to submit', 'error'); return }
    showToast('EV enquiry submitted — our team will reach out shortly')
    setForm({ name: '', email: '', phone: '', model: '', notes: '', honeypot: '' })
  }

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1568559598349-dbf322d50a48?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1639060015191-57b7c025941d?w=1400&q=90&fit=crop' },
        ]}
        label="Electric Vehicles"
        title="Go Electric. Go Silent."
        subtitle="Premium electric vehicles — Mercedes-Benz EQ series and more — imported, prepped, and ready for Nigerian roads."
        deco="circle"
      />

      <ParallaxSection>
        <Section style={{ position: 'relative' }}>
          <Speedometer className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.05 }} size={64} />
          <HandCircle className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.15 }} size={56} />
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>Why Go Electric</p>
          <SplitHeading as="h2">The Future Is Already Here</SplitHeading>
          <div className="section-divider" />
          <p style={{ color: 'var(--stone)', maxWidth: 560, lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
            Electric vehicles are no longer the future — they're the smartest choice on the market today. We source only the cleanest, most reliable EVs from trusted partners and handle everything from import to charging setup.
          </p>
          <div className="scroll-reveal responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {BENEFITS.map((b) => (
              <div key={b.title} style={{ padding: 'var(--space-4)', border: '1px solid rgba(10,10,10,0.06)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', transition: 'all 300ms var(--ease-out)' }}>
                <b.icon size={24} style={{ color: 'var(--navy)', marginBottom: 'var(--space-1-5)' }} />
                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 6, letterSpacing: '-0.02em' }}>{b.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      <ParallaxSection>
        <Section style={{ background: 'var(--paper-light)', position: 'relative' }}>
          <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.3 }} />
          <ShieldCheck className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.05 }} size={52} />
          <SplitHeading as="h2" style={{ marginBottom: 'var(--space-2)' }}>Available EV Models</SplitHeading>
          <div className="section-divider" />
          <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-4)', maxWidth: 560, lineHeight: 1.8 }}>
            A taste of what we can source. Can't see your exact spec? Ask — we'll track it down.
          </p>
          <div className="scroll-reveal responsive-grid-2 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {EV_MODELS.map((m) => (
              <div key={m.name} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(10,10,10,0.06)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(10,10,10,0.03)', transition: 'transform 350ms var(--ease-out), box-shadow 350ms var(--ease-out)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(10,10,10,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: 4 }}>{m.tag}</p>
                  <h3 style={{ fontSize: 'var(--text-xl)', letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>{m.name}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Battery size={13} /> {m.range}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={13} /> {m.power}</span>
                  </div>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Link to="/contact"><RippleButton size="sm" variant="secondary">Enquire About This Model <ArrowRight size={13} /></RippleButton></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      <Section style={{ position: 'relative' }}>
        <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.3 }} />
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SplitHeading as="h2" style={{ marginBottom: 'var(--space-2)', textAlign: 'center' }}>Interested in an EV?</SplitHeading>
          <div className="section-divider" />
          <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>Tell us which model you're after and we'll source it — with charging advice included.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
            </div>
            <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Phone *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            <Input label="Model of Interest" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Mercedes-Benz EQS 450" />
            <TextArea label="Questions / Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Budget, colour, timing..." />
            <RippleButton type="submit" loading={saving}>Request EV Enquiry</RippleButton>
          </form>
        </div>
      </Section>
    </>
  )
}
export default Electric
