import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { HandDots, Handshake } from '@/components/DecoSvgs'
import { RippleButton } from '@/components/RippleButton'
import { HeroSection } from '@/components/HeroSection'
import { config } from '@/lib/config'
import { useRateLimit } from '@/hooks/useRateLimit'

const contactDetails = [
  { icon: MapPin, label: 'Address', value: config.company.address },
  { icon: Phone, label: 'Phone', value: `${config.company.phone1} / ${config.company.phone2}` },
  { icon: Mail, label: 'Email', value: config.company.email },
  { icon: Clock, label: 'Hours', value: config.company.hours },
]

export function Contact() {
  const { showToast } = useToast()
  const { canSubmit } = useRateLimit()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', honeypot: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return
    if (!form.name || !form.email || !form.message) return
    if (!canSubmit()) { showToast('Please wait before submitting again', 'error'); return }
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
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1779025313068-b4a11d86bf0d?w=1400&q=90&fit=crop' },
        ]}
        label="Contact"
        title="Get in Touch"
        subtitle="Have a question, need a quote, or just want to talk cars? We'd love to hear from you."
        deco="dots"
      />

      <Section style={{ position: 'relative' }}>
        <Handshake className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)', opacity: 0.04 }} size={64} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.35 }} />
        <div className="scroll-reveal reveal-fade responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
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
              href={config.whatsapp.link}
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
