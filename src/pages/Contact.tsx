import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowRight, Send } from 'lucide-react'
import { Input, TextArea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { RippleButton } from '@/components/RippleButton'
import { config } from '@/lib/config'
import { useRateLimit } from '@/hooks/useRateLimit'
import styles from './Contact.module.css'

const contactDetails = [
  { icon: MapPin, label: 'Visit Us', value: config.company.address },
  { icon: Phone, label: 'Call Us', value: `${config.company.phone1} / ${config.company.phone2}` },
  { icon: Mail, label: 'Email Us', value: config.company.email },
  { icon: Clock, label: 'Working Hours', value: config.company.hours },
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
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <img
          src="/heroimg5.jpg"
          alt=""
          className={styles.heroImage}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>
            <span className={styles.heroLabelLine} />
            Contact
          </p>
          <h1 className={styles.heroTitle}>Let's Talk</h1>
          <p className={styles.heroSubtitle}>
            Have a question, need a quote, or just want to talk cars? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className={styles.mainSection}>
        <div className={styles.mainInner}>
          <div className={styles.layout}>
            {/* Left — Details */}
            <div className={styles.detailsColumn}>
              <div className={styles.detailsGrid}>
                {contactDetails.map((d, i) => (
                  <div
                    key={d.label}
                    className={styles.detailCard}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className={styles.detailIconWrap}>
                      <d.icon size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className={styles.detailLabel}>{d.label}</p>
                      <p className={styles.detailValue}>{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={config.whatsapp.getDeepLink("Hi Empathon Autos! I'd like to get in touch.")}
                target="_blank" rel="noopener noreferrer"
                className={styles.whatsappButton}
              >
                <MessageCircle size={18} />
                Chat with us on WhatsApp
                <ArrowRight size={16} className={styles.whatsappArrow} />
              </a>
            </div>

            {/* Right — Form */}
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Send a Message</h3>
              <p className={styles.formSubtitle}>We'll get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                  <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
                </div>

                <div className={styles.formRow}>
                  <Input
                    label="Full Name *"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Email *"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <Input
                  label="Phone (optional)"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />

                <TextArea
                  label="Message *"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5}
                  required
                />

                <RippleButton type="submit" loading={saving} className={styles.submitButton}>
                  <Send size={16} />
                  Send Message
                </RippleButton>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Contact Bar ── */}
      <section className={styles.quickBar}>
        <div className={styles.quickBarInner}>
          <a href={`tel:${config.company.phone1.replace(/\s/g, '')}`} className={styles.quickAction}>
            <Phone size={20} strokeWidth={1.5} />
            <div>
              <p className={styles.quickLabel}>Call Now</p>
              <p className={styles.quickValue}>{config.company.phone1}</p>
            </div>
          </a>

          <div className={styles.quickDivider} />

          <a href={config.whatsapp.link} target="_blank" rel="noopener noreferrer" className={styles.quickAction}>
            <MessageCircle size={20} strokeWidth={1.5} />
            <div>
              <p className={styles.quickLabel}>WhatsApp</p>
              <p className={styles.quickValue}>Chat instantly</p>
            </div>
          </a>

          <div className={styles.quickDivider} />

          <a href={`https://maps.google.com/?q=${encodeURIComponent(config.company.address)}`} target="_blank" rel="noopener noreferrer" className={styles.quickAction}>
            <MapPin size={20} strokeWidth={1.5} />
            <div>
              <p className={styles.quickLabel}>Visit Us</p>
              <p className={styles.quickValue}>{config.company.address}</p>
            </div>
          </a>
        </div>
      </section>
    </>
  )
}
