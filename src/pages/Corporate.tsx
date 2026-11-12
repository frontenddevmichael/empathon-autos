import { useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/layout/Section'
import { useSiteContent, parseJsonContent, getTextContent } from '@/hooks/useSiteContent'
import { LeadForm } from '@/components/LeadForm'
import { PageHero } from '@/components/ui/PageHero'
import { Input, TextArea } from '@/components/ui/Input'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import styles from './Corporate.module.css'

interface Client {
  name: string
  desc: string
  logo?: string | null
}

const FLEET_DEALS_FALLBACK = [
  {
    sector: 'Hospital & health',
    vehicles: 'Comfortable SUVs and crossovers for staff transport, rugged pickups for medical supplies.',
    price: 'From ₦18M per unit',
    volumePricing: '5+ units: 8% off · 10+ units: 12% off · 20+ units: custom quote',
    benefits: ['Temperature-friendly vehicle specs', 'Priority servicing windows', 'Fuel-efficient fleets for daily routes', 'Branded vehicle wraps available'],
  },
  {
    sector: 'Police, security & government',
    vehicles: 'Durable 4x4 SUVs and utility vehicles built for heavy daily use.',
    price: 'From ₦22M per unit',
    volumePricing: '5+ units: 10% off · 10+ units: 15% off · 20+ units: custom quote',
    benefits: ['High-mileage durability', 'Custom fitting and decals', 'Bundled servicing contracts', 'Armouring options available'],
  },
  {
    sector: 'Banks & finance',
    vehicles: 'Executive sedans and SUVs for relationship managers and senior staff.',
    price: 'From ₦25M per unit',
    volumePricing: '5+ units: 7% off · 10+ units: 11% off · 20+ units: custom quote',
    benefits: ['Executive-grade comfort', 'Resale-value planning', 'Consistent delivery timelines', 'Lease-to-own options'],
  },
  {
    sector: 'Logistics & transport',
    vehicles: 'Vans, pickups and light trucks matched to your route and load.',
    price: 'From ₦15M per unit',
    volumePricing: '5+ units: 12% off · 10+ units: 18% off · 20+ units: custom quote',
    benefits: ['Workhorse reliability', 'Parts and maintenance support', 'Scalable fleet expansion', 'GPS tracking integration'],
  },
  {
    sector: 'Hospitality',
    vehicles: 'Luxury SUVs and guest shuttles that keep your brand front of mind.',
    price: 'From ₦20M per unit',
    volumePricing: '5+ units: 9% off · 10+ units: 14% off · 20+ units: custom quote',
    benefits: ['Guest-ready presentation', 'Discreet after-sales support', 'White-glove handover', 'Interior customisation options'],
  },
  {
    sector: 'Oil, gas & energy',
    vehicles: 'Heavy-duty 4x4s and premium SUVs for site and executive use.',
    price: 'From ₦30M per unit',
    volumePricing: '5+ units: 8% off · 10+ units: 13% off · 20+ units: custom quote',
    benefits: ['Rugged off-road capability', 'Hardened spec options', 'Dedicated account manager', 'Extended warranty packages'],
  },
  {
    sector: 'Real estate & construction',
    vehicles: 'Pickups, SUVs and commercial vehicles for site managers and executives.',
    price: 'From ₦17M per unit',
    volumePricing: '5+ units: 10% off · 10+ units: 15% off · 20+ units: custom quote',
    benefits: ['Heavy-duty construction', 'Load-carrying capacity', 'Site-ready vehicles', 'Fleet tracking systems'],
  },
  {
    sector: 'Manufacturing & industrial',
    vehicles: 'Commercial vans, pickups and utility vehicles for factory operations.',
    price: 'From ₦16M per unit',
    volumePricing: '5+ units: 11% off · 10+ units: 16% off · 20+ units: custom quote',
    benefits: ['Industrial-grade durability', 'Parts availability', 'Maintenance contracts', 'Bulk fuel-efficient options'],
  },
]

const WHY_CHOOSE_US_FALLBACK = [
  { title: 'Dedicated account manager', desc: 'One point of contact who knows your fleet inside out.' },
  { title: 'Pre-delivery inspection', desc: 'Every vehicle inspected and certified before handover.' },
  { title: 'Support line', desc: 'Emergency breakdown assistance and roadside support.' },
  { title: 'Fleet management portal', desc: 'Track maintenance, fuel usage and vehicle status in one place.' },
]

const VOLUME_TIERS_FALLBACK = [
  { units: '1–4 units', discount: 'Standard pricing' },
  { units: '5–9 units', discount: '8–12% discount' },
  { units: '10–19 units', discount: '12–18% discount' },
  { units: '20+ units', discount: 'Custom quote' },
]

type Errors = { name?: string; email?: string; phone?: string; company?: string; form?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Corporate() {
  const { content: clientContent } = useSiteContent('corporate')
  const realClients = parseJsonContent<Client>(clientContent, 'clients', [
    { name: 'Radisson Blu Hotel', desc: 'Fleet partner since 2021', logo: null },
    { name: 'Johnvents Group', desc: 'Corporate account', logo: null },
    { name: 'Dangote Industries', desc: 'Executive fleet provider', logo: null },
  ])
  const fleetDeals = parseJsonContent(clientContent, 'fleet_deals', FLEET_DEALS_FALLBACK)
  const whyChooseUs = parseJsonContent(clientContent, 'why_choose_us', WHY_CHOOSE_US_FALLBACK)
  const volumeTiers = parseJsonContent(clientContent, 'volume_tiers', VOLUME_TIERS_FALLBACK)
  const heroTitle = getTextContent(clientContent, 'hero_title') || "Fleet solutions for Nigeria's leading organisations"
  const heroSubtitle = getTextContent(clientContent, 'hero_subtitle') || 'Better pricing on bulk orders, one account manager who knows your fleet, and after-sales support that actually shows up.'
  const cmsHero = getTextContent(clientContent, 'hero_image') || '/heroimg2.jpg'
  const heroImages = [cmsHero, '/heroimg3.jpg', '/heroimg4.jpg']
    .filter((url, i, all) => all.indexOf(url) === i)
    .map(url => ({ url }))

  const [leadSector, setLeadSector] = useState<string | null>(null)
  const [expandedSector, setExpandedSector] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', fleetSize: '', notes: '', honeypot: '' })
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
    if (!form.phone.trim()) next.phone = 'Please add a phone number.'
    if (!form.company.trim()) next.company = 'Please tell us which company you represent.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (!isSupabaseConfigured()) {
      setErrors({ form: 'The form is unavailable right now. Please email us instead.' })
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'corporate-quote',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: `Corporate fleet enquiry. Company: ${form.company.trim()}, Fleet size: ${form.fleetSize.trim() || 'not stated'}. ${form.notes.trim()}`.trim(),
      source_page: '/corporate',
    })
    setSaving(false)
    if (error) { setErrors({ form: 'We couldn\u2019t submit that. Please try again.' }); return }
    setSent(true)
  }

  const reset = () => {
    setForm({ name: '', email: '', phone: '', company: '', fleetSize: '', notes: '', honeypot: '' })
    setErrors({})
    setSent(false)
  }

  return (
    <>
      <PageHero
        label="Corporate sales"
        title={heroTitle}
        subtitle={heroSubtitle}
        images={heroImages}
        overlay="left"
      />

      <Section tone="navy" space="sm">
        <div className={styles.tiersHead}>
          <p className={styles.tiersLabel}>Volume pricing</p>
          <h2 className={styles.tiersTitle}>More units, better terms.</h2>
        </div>
        <dl className={styles.tiers}>
          {volumeTiers.map(tier => (
            <div key={tier.units} className={styles.tier}>
              <dt className={styles.tierUnits}>{tier.units}</dt>
              <dd className={styles.tierDiscount}>{tier.discount}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="paper" space="md">
        <SectionHeader
          label="Fleet deals by sector"
          title="Packages built around your organisation"
          desc="One car or fifty. Pick your sector, look over the package, then ask for a quote."
        />

        <div className={styles.sectors}>
          {fleetDeals.map((deal, i) => {
            const isExpanded = expandedSector === deal.sector
            return (
              <div key={deal.sector} className={styles.sector}>
                <button
                  type="button"
                  className={styles.sectorRow}
                  onClick={() => setExpandedSector(isExpanded ? null : deal.sector)}
                  aria-expanded={isExpanded}
                >
                  <span className={styles.sectorIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.sectorName}>{deal.sector}</span>
                  <span className={styles.sectorPrice}>{deal.price}</span>
                  <span className={styles.sectorToggle} aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                </button>

                {isExpanded && (
                  <div className={styles.sectorBody}>
                    <p className={styles.sectorDesc}>{deal.vehicles}</p>
                    <p className={styles.sectorVolume}>{deal.volumePricing}</p>
                    <ul className={styles.benefits}>
                      {deal.benefits.map(b => <li key={b}>{b}</li>)}
                    </ul>
                    <Button size="sm" onClick={() => setLeadSector(deal.sector)}>Request this package</Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section tone="warm" space="sm">
        <SectionHeader
          label="Why fleets stay"
          title="What you get past the discount."
          desc="The pricing gets you in. These are the things that keep a fleet running."
        />
        <div className={styles.why}>
          {whyChooseUs.map(item => (
            <div key={item.title} className={styles.whyItem}>
              <h3 className={styles.whyTitle}>{item.title}</h3>
              <p className={styles.whyDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper" space="md">
        {realClients.length > 0 && (
          <div className={styles.clientsStrip}>
            <p className={styles.clientsLabel}>Trusted by</p>
            <ul className={styles.clients}>
              {realClients.map(c => (
                <li key={c.name} className={styles.client}>
                  <span className={styles.clientName}>{c.name}</span>
                  {c.desc && <span className={styles.clientDesc}>{c.desc}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.quote} id="quote">
          <SectionHeader
            label="Corporate enquiry"
            title="Get a custom quote"
            desc="Tell us about your fleet and we'll prepare a tailored proposal within 24 hours."
          />

          {sent ? (
            <div className={styles.success} role="status">
              <h2 className={styles.successTitle}>Enquiry received.</h2>
              <p className={styles.successBody}>
                Our corporate team will contact {form.name.split(' ')[0] || 'you'} at {form.email} within 24 hours.
              </p>
              <Button variant="secondary" size="sm" onClick={reset}>Send another enquiry</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.honeypot} aria-hidden="true">
                <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
              </div>
              <div className={styles.formRow}>
                <Input
                  label="Name"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: undefined })) }}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Company"
                  value={form.company}
                  onChange={e => { setForm(f => ({ ...f, company: e.target.value })); if (errors.company) setErrors(p => ({ ...p, company: undefined })) }}
                  error={errors.company}
                  autoComplete="organization"
                />
              </div>
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
              <Input
                label="Fleet size (approximate)"
                value={form.fleetSize}
                onChange={e => setForm(f => ({ ...f, fleetSize: e.target.value }))}
                placeholder="e.g. 10–20 vehicles"
              />
              <TextArea
                label="Requirements"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Specific models, budget range, delivery timeline…"
              />
              {errors.form && <p className={styles.formError} role="alert">{errors.form}</p>}
              <Button type="submit" loading={saving} className={styles.submit}>Submit enquiry</Button>
            </form>
          )}
        </div>
      </Section>

      <LeadForm
        open={leadSector !== null}
        onClose={() => setLeadSector(null)}
        type="corporate-quote"
        initialMessage={leadSector ? `Fleet package enquiry: ${leadSector}` : undefined}
      />
    </>
  )
}
