import { useState } from 'react'
import { HeartPulse, Shield, Landmark, Truck, Hotel, Flame, Check, ArrowRight, Users, Car, Phone, Mail, Building, Factory, ChevronDown, ChevronUp } from 'lucide-react'
import { HeroSection } from '@/components/HeroSection'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { RippleButton } from '@/components/RippleButton'
import { Section } from '@/components/PageLayout'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import { LeadForm } from '@/components/LeadForm'
import { Input, TextArea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { ParallaxSection } from '@/components/ParallaxSection'
import { Handshake, Compass, UnderlineFlourish } from '@/components/DecoSvgs'
import styles from './Corporate.module.css'

interface Client {
  name: string
  desc: string
  logo?: string | null
}

const FLEET_DEALS = [
  {
    sector: 'Hospital & Health',
    icon: HeartPulse,
    vehicles: 'Comfortable SUVs & crossovers for staff transport, rugged pickups for medical supplies.',
    price: 'From ₦18M per unit',
    volumePricing: '5+ units: 8% off · 10+ units: 12% off · 20+ units: Custom quote',
    benefits: ['Temperature-friendly vehicle specs', 'Priority servicing windows', 'Fuel-efficient fleets for daily routes', 'Branded vehicle wraps available'],
  },
  {
    sector: 'Police / Security / Government',
    icon: Shield,
    vehicles: 'Durable 4x4 SUVs and utility vehicles built for heavy daily use.',
    price: 'From ₦22M per unit',
    volumePricing: '5+ units: 10% off · 10+ units: 15% off · 20+ units: Custom quote',
    benefits: ['High-mileage durability', 'Custom fitting & decals support', 'Bundled servicing contracts', 'Armouring options available'],
  },
  {
    sector: 'Banks & Finance',
    icon: Landmark,
    vehicles: 'Executive sedans and SUVs for relationship managers and senior staff.',
    price: 'From ₦25M per unit',
    volumePricing: '5+ units: 7% off · 10+ units: 11% off · 20+ units: Custom quote',
    benefits: ['Executive-grade comfort', 'Resale-value planning', 'Consistent delivery timelines', 'Lease-to-own options'],
  },
  {
    sector: 'Logistics & Transport',
    icon: Truck,
    vehicles: 'Vans, pickups, and light trucks matched to your route and load.',
    price: 'From ₦15M per unit',
    volumePricing: '5+ units: 12% off · 10+ units: 18% off · 20+ units: Custom quote',
    benefits: ['Workhorse reliability', 'Parts & maintenance support', 'Scalable fleet expansion', 'GPS tracking integration'],
  },
  {
    sector: 'Hospitality',
    icon: Hotel,
    vehicles: 'Luxury SUVs and guest shuttles that keep your brand front-of-mind.',
    price: 'From ₦20M per unit',
    volumePricing: '5+ units: 9% off · 10+ units: 14% off · 20+ units: Custom quote',
    benefits: ['Guest-ready presentation', 'Discreet after-sales support', 'White-glove handover', 'Interior customization options'],
  },
  {
    sector: 'Oil & Gas / Energy',
    icon: Flame,
    vehicles: 'Heavy-duty 4x4s and premium SUVs for site and executive use.',
    price: 'From ₦30M per unit',
    volumePricing: '5+ units: 8% off · 10+ units: 13% off · 20+ units: Custom quote',
    benefits: ['Rugged off-road capability', 'Hardened spec options', 'Dedicated account manager', 'Extended warranty packages'],
  },
  {
    sector: 'Real Estate & Construction',
    icon: Building,
    vehicles: 'Pickups, SUVs, and commercial vehicles for site managers and executives.',
    price: 'From ₦17M per unit',
    volumePricing: '5+ units: 10% off · 10+ units: 15% off · 20+ units: Custom quote',
    benefits: ['Heavy-duty construction', 'Load-carrying capacity', 'Site-ready vehicles', 'Fleet tracking systems'],
  },
  {
    sector: 'Manufacturing & Industrial',
    icon: Factory,
    vehicles: 'Commercial vans, pickups, and utility vehicles for factory operations.',
    price: 'From ₦16M per unit',
    volumePricing: '5+ units: 11% off · 10+ units: 16% off · 20+ units: Custom quote',
    benefits: ['Industrial-grade durability', 'Parts availability', 'Maintenance contracts', 'Bulk fuel-efficient options'],
  },
]

const WHY_CHOOSE_US = [
  { icon: Users, title: 'Dedicated Account Manager', desc: 'One point of contact who knows your fleet inside out.' },
  { icon: Car, title: 'Pre-Delivery Inspection', desc: 'Every vehicle inspected and certified before handover.' },
  { icon: Phone, title: '24/7 Support Line', desc: 'Emergency breakdown assistance and roadside support.' },
  { icon: Mail, title: 'Fleet Management Portal', desc: 'Track maintenance, fuel usage, and vehicle status in real-time.' },
]

const VOLUME_TIERS = [
  { units: '1-4 units', discount: 'Standard pricing' },
  { units: '5-9 units', discount: '8-12% discount' },
  { units: '10-19 units', discount: '12-18% discount' },
  { units: '20+ units', discount: 'Custom quote', featured: true },
]

export function Corporate() {
  const { content: clientContent } = useSiteContent('corporate')
  const realClients = parseJsonContent<Client>(clientContent, 'clients', [
    { name: 'Radisson Blu Hotel', desc: 'Fleet partner since 2021', logo: null },
    { name: 'Johnvents Group', desc: 'Corporate account', logo: null },
    { name: 'Dangote Industries', desc: 'Executive fleet provider', logo: null },
  ])
  const [leadSector, setLeadSector] = useState<string | null>(null)
  const [expandedSector, setExpandedSector] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', fleetSize: '', notes: '', honeypot: '' })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return
    if (!form.name || !form.email || !form.phone || !form.company) return
    if (!isSupabaseConfigured()) {
      showToast('Form is not available right now. Please try again later.', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      type: 'corporate-quote',
      name: form.name, email: form.email, phone: form.phone,
      message: `Corporate fleet enquiry — Company: ${form.company}, Fleet size: ${form.fleetSize}. ${form.notes || ''}`.trim(),
      source_page: '/corporate',
    })
    setSaving(false)
    if (error) { showToast('Failed to submit', 'error'); return }
    showToast('Enquiry submitted — our corporate team will contact you within 24 hours')
    setForm({ name: '', email: '', phone: '', company: '', fleetSize: '', notes: '', honeypot: '' })
  }

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1779025313068-b4a11d86bf0d?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1774578432996-54e195b3c5b0?w=1400&q=90&fit=crop' },
        ]}
        label="Corporate Sales"
        title="Fleet Solutions for Nigeria's Leading Organisations"
        subtitle="Better pricing on bulk orders, a dedicated account manager, and after-sales support that actually shows up."
        deco="dots"
      />

      {/* Volume Pricing Tiers */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-scale" style={{ background: 'var(--navy-deep)', color: 'white', position: 'relative' }}>
          <Handshake className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.1 }} size={72} />
          <SectionHeader
            label="Volume Pricing"
            title="The More You Buy, The More You Save"
            align="center"
            dark
          />
          <div className={`scroll-reveal stagger-fade-in ${styles.tiersGrid}`}>
            {VOLUME_TIERS.map((tier) => (
              <div key={tier.units} className={`${styles.tier} ${tier.featured ? styles.tierFeatured : ''}`}>
                <p className={styles.tierUnits}>{tier.units}</p>
                <p className={styles.tierDiscount}>{tier.discount}</p>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* Fleet Deals by Sector */}
      <Section className="scroll-reveal reveal-left">
        <SectionHeader
          label="Fleet Deals by Sector"
          title="Packages Built Around Your Organisation"
          desc="Whether you need one car or fifty, we make it straightforward. Pick your sector, review the package, and request a tailored quote — we'll take it from there."
        />

        <div className={`scroll-reveal stagger-fade-in ${styles.sectorsGrid}`}>
          {FLEET_DEALS.map(deal => {
            const isExpanded = expandedSector === deal.sector
            return (
              <div key={deal.sector} className={styles.sectorCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)', marginBottom: 'var(--space-1-5)' }}>
                  <div className={styles.sectorIcon}>
                    <deal.icon size={22} />
                  </div>
                  <h3 className={styles.sectorTitle}>{deal.sector}</h3>
                </div>
                <p className={styles.sectorDesc}>{deal.vehicles}</p>
                <p className={styles.sectorPrice}>{deal.price}</p>
                <p className={styles.sectorVolume}>{deal.volumePricing}</p>

                <button
                  onClick={() => setExpandedSector(isExpanded ? null : deal.sector)}
                  className={styles.sectorToggle}
                >
                  {isExpanded ? 'Show less' : 'Show benefits'}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                  <ul className={styles.benefitList}>
                    {deal.benefits.map(b => (
                      <li key={b} className={styles.benefitItem}>
                        <Check size={14} className={styles.benefitCheck} /> {b}
                      </li>
                    ))}
                  </ul>
                )}

                <RippleButton size="sm" onClick={() => setLeadSector(deal.sector)}>Request This Package <ArrowRight size={14} /></RippleButton>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Why Choose Us */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-right" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
          <SectionHeader label="Why Choose Us" title="More Than Just Vehicles" align="center" />
          <div className={`scroll-reveal stagger-fade-in ${styles.whyGrid}`}>
            {WHY_CHOOSE_US.map((item) => (
              <div key={item.title} className={styles.whyCard}>
                <item.icon size={28} className={styles.whyIcon} />
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* Trusted By */}
      {realClients.length > 0 && (
        <Section className="scroll-reveal reveal-fade" style={{ position: 'relative' }}>
          <Compass className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.06 }} size={64} />
          <SectionHeader label="Trusted By" title="Our Corporate Clients" align="center" />
          <div className={`scroll-reveal stagger-fade-in ${styles.trustGrid}`}>
            {realClients.map(c => (
              c.logo ? (
                <div key={c.name} className={styles.trustLogo}>
                  <img src={c.logo} alt={c.name} loading="lazy" />
                  <span className={styles.trustDesc}>{c.desc}</span>
                </div>
              ) : (
                <div key={c.name} className={styles.trustItem}>
                  <span className={styles.trustName}>{c.name}</span>
                  <span className={styles.trustDesc}>{c.desc}</span>
                </div>
              )
            ))}
          </div>
        </Section>
      )}

      {/* Contact Form */}
      <Section className="scroll-reveal reveal-big" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <SectionHeader
            label="Corporate Enquiry"
            title="Get a Custom Quote"
            desc="Tell us about your fleet needs and we'll prepare a tailored proposal within 24 hours."
            align="center"
            deco={<UnderlineFlourish />}
          />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
            </div>
            <div className="formGrid2">
              <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="formGrid2">
              <Input label="Phone *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              <Input label="Company *" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
            </div>
            <Input label="Fleet Size (approximate)" value={form.fleetSize} onChange={e => setForm(f => ({ ...f, fleetSize: e.target.value }))} placeholder="e.g. 10-20 vehicles" />
            <TextArea label="Additional Requirements" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Specific models, budget range, delivery timeline..." />
            <RippleButton type="submit" loading={saving}>Submit Enquiry <ArrowRight size={16} /></RippleButton>
          </form>
        </div>
      </Section>

      <LeadForm
        open={leadSector !== null}
        onClose={() => setLeadSector(null)}
        type="corporate-quote"
        initialMessage={leadSector ? `Fleet package enquiry — ${leadSector}` : undefined}
      />
    </>
  )
}
