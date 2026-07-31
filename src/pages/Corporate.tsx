import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { HeroSection } from '@/components/HeroSection'
import { SplitHeading } from '@/components/SplitHeading'
import { RippleButton } from '@/components/RippleButton'
import { ParallaxSection } from '@/components/ParallaxSection'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { DecoMark } from '@/components/DecoMark'
import { useToast } from '@/context/ToastContext'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import { ShieldCheck } from '@/components/DecoSvgs'

interface Client {
  name: string
  desc: string
}

export function Corporate() {
  const { content: clientContent } = useSiteContent('corporate')
  const realClients = parseJsonContent<Client>(clientContent, 'clients', [
    { name: 'Radisson Blu Hotel', desc: 'Fleet partner since 2021' },
    { name: 'Johnvents Group', desc: 'Corporate account' },
    { name: 'Dangote Industries', desc: 'Executive fleet provider' },
  ])
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', fleetSize: '', message: '', honeypot: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return
    if (!form.name || !form.email || !form.phone) return
    if (!isSupabaseConfigured()) {
      showToast('Quote form is not available right now. Please try again later.', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'corporate-quote',
      name: form.name, email: form.email, phone: form.phone,
      company: form.company || null,
      message: `Fleet size: ${form.fleetSize || 'Not specified'}. ${form.message || ''}`,
      source_page: '/corporate',
    })
    setSaving(false)
    if (error) { showToast('Failed to submit', 'error'); return }
    showToast('Quote request submitted — our corporate sales team will reach out shortly')
    setForm({ name: '', email: '', phone: '', company: '', fleetSize: '', message: '', honeypot: '' })
  }

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1779025313068-b4a11d86bf0d?w=1400&q=90&fit=crop' },
        ]}
        label="Corporate Sales"
        title="Fleet Solutions for Nigeria's Leading Organisations"
        subtitle="Better pricing on bulk orders, a dedicated account manager, and after-sales support that actually shows up."
        deco="dots"
      />

      <ParallaxSection>
      <Section>
        <div className="scroll-reveal responsive-grid-2 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
          <div>
            <SplitHeading as="h2">Corporate Fleet Programme</SplitHeading>
            <div className="section-divider" />
            <p style={{ color: 'var(--stone)', marginTop: 'var(--space-1)' }}>
              Whether you need one car or fifty, we make it straightforward. No wasted time, no middlemen, no fuss.
            </p>
            <ul className="stagger-fade-in" style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
              {[
                { title: 'Better Pricing', desc: 'The more you buy, the better the deal. Simple.' },
                { title: 'One Contact Person', desc: 'No phone tennis. You deal with one person who knows your business.' },
                { title: 'After-Sales That Works', desc: "Servicing, warranty, coordination — we don't disappear after delivery." },
                { title: 'We Source Anywhere', desc: "Japan, Dubai, Europe, US — wherever the right vehicle is, we'll find it." },
              ].map(item => (
                <li key={item.title} style={{ display: 'flex', gap: 'var(--space-1-5)' }}>
                  <DecoMark variant="shield" size={28} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.title}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Request a Corporate Quote</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
              </div>
              <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Phone *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              <Input label="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              <Input label="Fleet Size" type="number" value={form.fleetSize} onChange={e => setForm(f => ({ ...f, fleetSize: e.target.value }))} min={1} />
              <TextArea label="Message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} />
              <RippleButton type="submit" loading={saving}>Submit Quote Request</RippleButton>
            </form>
          </div>
        </div>
      </Section>
      </ParallaxSection>

      {realClients.length > 0 && (
        <ParallaxSection>
        <Section style={{ background: 'var(--paper-light)', position: 'relative' }}>
          <ShieldCheck className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.04 }} size={48} />
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>Trusted By</p>
          <SplitHeading as="h2" style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>Our Corporate Clients</SplitHeading>
          <div className="section-divider" />
          <div className="stagger-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
            {realClients.map(c => (
              <div key={c.name} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', textAlign: 'center', minWidth: 180 }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>
        </ParallaxSection>
      )}
    </>
  )
}
