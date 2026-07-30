import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { DecoMark } from '@/components/DecoMark'
import { useToast } from '@/context/ToastContext'
import { CarKey, ShieldCheck, HandDots } from '@/components/DecoSvgs'
import { SplitHeading } from '@/components/SplitHeading'
import { RippleButton } from '@/components/RippleButton'
import { ParallaxSection } from '@/components/ParallaxSection'

const steps = [
  { icon: 'shield', title: '1. Tell Us What You Want', desc: 'Make, model, trim, colour, year, budget — the more specific you are, the better we can hunt.' },
  { icon: 'arrow', title: '2. Secure It With a Deposit', desc: 'A refundable deposit locks in your place. We\'ll give you a timeline and keep you posted.' },
  { icon: 'split', title: '3. We Handle Everything', desc: 'Sourcing, shipping, customs clearance — we\'ve done it hundreds of times. You just wait for the call.' },
  { icon: 'shield', title: '4. Inspect & Drive Away', desc: 'When it arrives at our Ikeja showroom, come inspect it. If everything checks out, you drive home.' },
]

export function PreOrder() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', make: '', model: '', notes: '', honeypot: '' })
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
      <ParallaxSection>
        <Section dark style={{ paddingBottom: 0, minHeight: '50vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <CarKey className="deco-positioned" style={{ position: 'absolute', top: '15%', right: '8%', opacity: 0.08 }} size={72} />
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: 'var(--space-1)' }}>Pre-Order</p>
            <SplitHeading as="h1" style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, var(--text-5xl))', letterSpacing: '-0.04em' }}>Order the Vehicle<br />You Really Want</SplitHeading>
            <div className="section-divider" />
            <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480, marginTop: 'var(--space-1)' }}>
              The exact colour, trim, and spec you want — not whatever happens to be on the lot. Tell us what you're looking for and we'll track it down.
            </p>
          </div>
        </Section>
      </ParallaxSection>

      <Section style={{ position: 'relative' }}>
        <ShieldCheck className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', opacity: 0.04 }} size={48} />
        <SplitHeading as="h2">How It Works</SplitHeading>
        <div className="section-divider" />
        <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-4)', maxWidth: 560, lineHeight: 1.8 }}>
          You tell us what you want. We find it, ship it, clear it, and call you when it's ready. Simple.
        </p>
        <div className="scroll-reveal responsive-grid-2 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {steps.map(s => (
            <div key={s.title} style={{ padding: 'var(--space-4)', border: '1px solid rgba(10,10,10,0.06)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', transition: 'all 300ms var(--ease-out)' }}>
              <DecoMark variant={s.icon as any} size={32} />
              <h3 style={{ fontSize: 'var(--text-base)', marginTop: 'var(--space-1-5)', marginBottom: 4, letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section style={{ background: 'var(--paper-light)', position: 'relative' }}>
        <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.25 }} />
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SplitHeading as="h2" style={{ marginBottom: 'var(--space-2)' }}>Tell Us What You Want</SplitHeading>
          <div className="section-divider" />
          <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-3)' }}>Fill in the details and we'll start the search. No obligation, no pressure.</p>
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
