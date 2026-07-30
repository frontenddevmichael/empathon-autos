import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { Squiggle, HandDots, Handshake } from '@/components/DecoSvgs'
import { SplitHeading } from '@/components/SplitHeading'
import { RippleButton } from '@/components/RippleButton'
import { ParallaxSection } from '@/components/ParallaxSection'

const contactDetails = [
  { icon: MapPin, label: 'Address', value: '123 Ajao Road, Ikeja, Lagos' },
  { icon: Phone, label: 'Phone', value: '+234 802 339 2388 / +234 810 383 2403' },
  { icon: Mail, label: 'Email', value: 'empathonautos@gmail.com' },
  { icon: Clock, label: 'Hours', value: 'Mon\u2013Sat, 8:00 AM \u2013 6:00 PM' },
]

export function Contact() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', honeypot: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return
    if (!form.name || !form.email || !form.message) return
    if (!isSupabaseConfigured()) {
      showToast('Contact form is not available right now. Please try again later.', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'contact',
      name: form.name, email: form.email, phone: form.phone || null,
      message: form.message, source_page: '/contact',
    })
    setSaving(false)
    if (error) { showToast('Failed to send message. Please try again or call us directly.', 'error'); return }
    showToast('Message sent \u2014 we\'ll respond shortly')
    setForm({ name: '', email: '', phone: '', message: '', honeypot: '' })
  }

  return (
    <>
      <ParallaxSection>
        <Section dark style={{ paddingBottom: 0, minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 'var(--space-1)' }}>Contact</p>
            <SplitHeading as="h1" style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, var(--text-5xl))' }}>Get in Touch</SplitHeading>
            <div className="section-divider" />
            <Squiggle style={{ marginTop: 'var(--space-1)' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, marginTop: 'var(--space-1)' }}>
              Visit our showroom, give us a call, or send a message.
            </p>
          </div>
        </Section>
      </ParallaxSection>

      <Section style={{ position: 'relative' }}>
        <Handshake className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)', opacity: 0.04 }} size={64} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.35 }} />
        <div className="scroll-reveal responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
          <div className="scroll-reveal-child">
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {contactDetails.map(d => (
                <div key={d.label} style={{ display: 'flex', gap: 'var(--space-1-5)', alignItems: 'flex-start', padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
                  <d.icon size={18} style={{ color: 'var(--navy)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 2 }}>{d.label}</p>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/2348023392388"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-2)', padding: 'var(--space-1-5) var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--ink)', fontSize: 'var(--text-sm)', fontWeight: 500, transition: 'background var(--transition-fast)' }}
            >
              <MessageCircle size={18} style={{ color: 'var(--navy)' }} />
              Chat with us on WhatsApp
            </a>
          </div>
          <div className="scroll-reveal-child" style={{ padding: 'var(--space-4)', border: '1px solid rgba(10,10,10,0.06)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', ['--reveal-delay' as string]: '100ms' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
              </div>
              <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <TextArea label="Message *" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} required />
              <RippleButton type="submit" loading={saving}>Send Message</RippleButton>
            </form>
          </div>
        </div>
      </Section>
    </>
  )
}
