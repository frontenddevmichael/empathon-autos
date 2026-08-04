import { useState } from 'react'
import { HeartPulse, Shield, Landmark, Truck, Hotel, Flame, Check, ArrowRight } from 'lucide-react'
import { HeroSection } from '@/components/HeroSection'
import { SplitHeading } from '@/components/SplitHeading'
import { RippleButton } from '@/components/RippleButton'
import { ParallaxSection } from '@/components/ParallaxSection'
import { Section } from '@/components/PageLayout'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import { ShieldCheck } from '@/components/DecoSvgs'
import { LeadForm } from '@/components/LeadForm'

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
    price: 'From ₦18M per unit · volume pricing at 5+ units',
    benefits: ['Temperature-friendly vehicle specs', 'Priority servicing windows', 'Fuel-efficient fleets for daily routes'],
  },
  {
    sector: 'Police / Security / Government',
    icon: Shield,
    vehicles: 'Durable 4x4 SUVs and utility vehicles built for heavy daily use.',
    price: 'From ₦22M per unit · maintenance packages available',
    benefits: ['High-mileage durability', 'Custom fitting & decals support', 'Bundled servicing contracts'],
  },
  {
    sector: 'Banks & Finance',
    icon: Landmark,
    vehicles: 'Executive sedans and SUVs for relationship managers and senior staff.',
    price: 'From ₦25M per unit · branded fleet options',
    benefits: ['Executive-grade comfort', 'Resale-value planning', 'Consistent delivery timelines'],
  },
  {
    sector: 'Logistics & Transport',
    icon: Truck,
    vehicles: 'Vans, pickups, and light trucks matched to your route and load.',
    price: 'From ₦15M per unit · bulk-tier discounts',
    benefits: ['Workhorse reliability', 'Parts & maintenance support', 'Scalable fleet expansion'],
  },
  {
    sector: 'Hospitality',
    icon: Hotel,
    vehicles: 'Luxury SUVs and guest shuttles that keep your brand front-of-mind.',
    price: 'From ₦20M per unit · welcome-pack options',
    benefits: ['Guest-ready presentation', 'Discreet after-sales support', 'White-glove handover'],
  },
  {
    sector: 'Oil & Gas / Energy',
    icon: Flame,
    vehicles: 'Heavy-duty 4x4s and premium SUVs for site and executive use.',
    price: 'From ₦30M per unit · custom specs',
    benefits: ['Rugged off-road capability', 'Hardened spec options', 'Dedicated account manager'],
  },
]

export function Corporate() {
  const { content: clientContent } = useSiteContent('corporate')
  const realClients = parseJsonContent<Client>(clientContent, 'clients', [
    { name: 'Radisson Blu Hotel', desc: 'Fleet partner since 2021', logo: null },
    { name: 'Johnvents Group', desc: 'Corporate account', logo: null },
    { name: 'Dangote Industries', desc: 'Executive fleet provider', logo: null },
  ])
  const [leadSector, setLeadSector] = useState<string | null>(null)

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
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>Fleet Deals by Sector</p>
          <SplitHeading as="h2">Packages Built Around Your Organisation</SplitHeading>
          <div className="section-divider" />
          <p style={{ color: 'var(--stone)', marginTop: 'var(--space-1)', maxWidth: 620, lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
            Whether you need one car or fifty, we make it straightforward. Pick your sector, review the package, and request a tailored quote — we'll take it from there.
          </p>

          <div className="scroll-reveal stagger-fade-in" style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {FLEET_DEALS.map(deal => (
              <div key={deal.sector} style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', transition: 'all 300ms var(--ease-out)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(0,51,102,0.2)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)', marginBottom: 'var(--space-1-5)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--navy-light)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <deal.icon size={22} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', letterSpacing: '-0.02em' }}>{deal.sector}</h3>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', lineHeight: 1.7, marginBottom: 'var(--space-2)' }}>{deal.vehicles}</p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-2)', padding: 'var(--space-1-5)', background: 'var(--paper-warm)', borderRadius: 'var(--radius-md)' }}>{deal.price}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-2-5)', flex: 1 }}>
                  {deal.benefits.map(b => (
                    <li key={b} style={{ display: 'flex', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>
                      <Check size={14} style={{ color: 'var(--navy)', flexShrink: 0, marginTop: 3 }} /> {b}
                    </li>
                  ))}
                </ul>
                <RippleButton size="sm" onClick={() => setLeadSector(deal.sector)}>Request This Package <ArrowRight size={14} /></RippleButton>
              </div>
            ))}
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
          <div className="scroll-reveal stagger-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', alignItems: 'center' }}>
            {realClients.map(c => (
              c.logo ? (
                <div key={c.name} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', textAlign: 'center', minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <img src={c.logo} alt={c.name} loading="lazy" style={{ maxHeight: 40, maxWidth: 140, width: 'auto', height: 'auto', objectFit: 'contain', filter: 'grayscale(1)', opacity: 0.8, transition: 'all 250ms var(--ease-out)' }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.8' }}
                  />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{c.desc}</p>
                </div>
              ) : (
                <div key={c.name} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', textAlign: 'center', minWidth: 180 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{c.desc}</p>
                </div>
              )
            ))}
          </div>
        </Section>
        </ParallaxSection>
      )}

      <LeadForm
        open={leadSector !== null}
        onClose={() => setLeadSector(null)}
        type="corporate-quote"
        initialMessage={leadSector ? `Fleet package enquiry — ${leadSector}` : undefined}
      />
    </>
  )
}
