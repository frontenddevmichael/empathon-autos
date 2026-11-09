import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/layout/Section'
import { PageHero } from '@/components/ui/PageHero'
import { config } from '@/lib/config'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useSiteContent, getTextContent } from '@/hooks/useSiteContent'
import { resolveHeroImage } from '@/lib/heroImage'
import styles from './Contact.module.css'

type Errors = { name?: string; email?: string; message?: string; form?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Contact() {
  const { canSubmit } = useRateLimit()
  const { content: contactContent } = useSiteContent('contact')
  // CMS: page key "contact", title "hero_image".
  const heroImage = resolveHeroImage('contact', getTextContent(contactContent, 'hero_image'), '/hero-contact.jpg')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', honeypot: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return

    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Please enter your name.'
    if (!form.email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'That email address doesn\u2019t look right.'
    if (!form.message.trim()) next.message = 'Please tell us a little about your enquiry.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (!canSubmit()) { setErrors({ form: 'Please wait a moment before sending again.' }); return }
    if (!isSupabaseConfigured()) {
      setErrors({ form: 'The form is unavailable right now. Please call or email us instead.' })
      return
    }

    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'contact',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      message: form.message.trim(),
      source_page: '/contact',
    })
    setSaving(false)
    if (error) { setErrors({ form: 'We couldn\u2019t send that. Please try again or call us directly.' }); return }
    setSent(true)
  }

  const reset = () => {
    setForm({ name: '', email: '', phone: '', message: '', honeypot: '' })
    setErrors({})
    setSent(false)
  }

  return (
    <>
      <PageHero
        label="Contact"
        title="Let's talk"
        subtitle="A question, a quote, a car you have your eye on. Send it over and we'll answer within a working day."
        images={[{ url: heroImage }]}
        overlay="left"
      />

      <Section tone="paper" space="sm">
        <div className={styles.layout}>
          <div className={styles.details}>
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>Visit</dt>
                <dd>{config.company.address}</dd>
              </div>
              <div className={styles.row}>
                <dt>Call</dt>
                <dd>
                  <a href={`tel:${config.company.phone1.replace(/\s/g, '')}`}>{config.company.phone1}</a>
                  {config.company.phone2 && <a href={`tel:${config.company.phone2.replace(/\s/g, '')}`}>{config.company.phone2}</a>}
                </dd>
              </div>
              <div className={styles.row}>
                <dt>Email</dt>
                <dd><a href={`mailto:${config.company.email}`}>{config.company.email}</a></dd>
              </div>
              <div className={styles.row}>
                <dt>Hours</dt>
                <dd>{config.company.hours}</dd>
              </div>
            </dl>

            <a
              href={config.whatsapp.getDeepLink("Hi Empathon Autos! I'd like to get in touch.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsapp}
            >
              Message us on WhatsApp
            </a>

          </div>

          <div className={styles.formColumn}>
            {sent ? (
              <div className={styles.success} role="status">
                <h2 className={styles.successTitle}>Message sent.</h2>
                <p className={styles.successBody}>
                  Thanks {form.name.split(' ')[0] || 'for reaching out'}. We'll reply to {form.email} within a working day.
                </p>
                <Button variant="secondary" size="sm" onClick={reset}>Send another</Button>
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
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                  error={errors.email}
                  autoComplete="email"
                />
                <Input
                  label="Phone (optional)"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  autoComplete="tel"
                />
                <TextArea
                  label="Message"
                  value={form.message}
                  onChange={e => { setForm(f => ({ ...f, message: e.target.value })); if (errors.message) setErrors(p => ({ ...p, message: undefined })) }}
                  error={errors.message}
                  rows={5}
                />

                {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}

                <Button type="submit" loading={saving} className={styles.submit}>Send message</Button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
