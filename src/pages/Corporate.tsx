import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { DecoMark } from '@/components/DecoMark'
import { useToast } from '@/context/ToastContext'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import { Handshake, ShieldCheck, CarSilhouette } from '@/components/DecoSvgs'

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
      <Section dark style={{ paddingBottom: 0, minHeight: '50vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Handshake className="deco-positioned" style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.06 }} size={80} />
        <CarSilhouette className="deco-positioned" style={{ position: 'absolute', bottom: '8%', left: '6%', opacity: 0.04 }} size={120} />
        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 'var(--space-1)' }}>Corporate Sales</p>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, var(--text-5xl))' }}>Fleet Solutions for<br />Nigeria's Leading Organisations</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, marginTop: 'var(--space-1)' }}>
            One person handles your account. Better pricing on volume. After-sales support that doesn't vanish after the cheque clears.
          </p>
        </div>
      </Section>

      <Section>
        <div className="scroll-reveal responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
          <div>
            <h2>Corporate Fleet Programme</h2>
            <p style={{ color: 'var(--stone)', marginTop: 'var(--space-1)' }}>
              Whether you need one car or fifty, we make it straightforward. No wasted time, no middlemen, no fuss.
            </p>
            <ul style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
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
              <Button type="submit" loading={saving}>Submit Quote Request</Button>
            </form>
          </div>
        </div>
      </Section>

      {realClients.length > 0 && (
        <Section style={{ background: 'var(--paper-light)', position: 'relative' }}>
          <ShieldCheck className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.04 }} size={48} />
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>Trusted By</p>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>Our Corporate Clients</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
            {realClients.map(c => (
              <div key={c.name} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', textAlign: 'center', minWidth: 180 }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
