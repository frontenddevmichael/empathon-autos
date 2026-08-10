import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Battery, Zap, Gauge, Leaf, Plug, ShieldCheck as ShieldCheckIcon, Wind, PiggyBank, TrendingDown, Clock, Wrench } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useToast } from '@/context/ToastContext'
import { RippleButton } from '@/components/RippleButton'
import { HeroSection } from '@/components/HeroSection'
import { ParallaxSection } from '@/components/ParallaxSection'
import { Sparkle } from '@/components/DecoSvgs'
import styles from './Electric.module.css'

const EV_BRANDS = [
  { name: 'Mercedes-Benz', logo: '/brands/mercedes.svg', models: 8, tagline: 'Luxury Electric Innovation' },
  { name: 'BMW', logo: '/brands/bmw.svg', models: 5, tagline: 'Ultimate Electric Driving Machine' },
  { name: 'Tesla', logo: '/brands/tesla.svg', models: 4, tagline: 'Leading the EV Revolution' },
  { name: 'Audi', logo: '/brands/audi.svg', models: 3, tagline: 'Vorsprung durch Technik' },
  { name: 'Porsche', logo: '/brands/porsche.svg', models: 2, tagline: 'Electric Performance' },
  { name: 'Hyundai', logo: '/brands/hyundai.svg', models: 3, tagline: 'Smart Mobility Solutions' },
]

const EV_MODELS = [
  { name: 'Mercedes-Benz EQS', range: '680 km', power: '516 hp', tag: 'Flagship Electric Saloon', price: '₦85M+', img: 'https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQE', range: '620 km', power: '288 hp', tag: 'Executive Electric Sedan', price: '₦65M+', img: 'https://images.unsplash.com/photo-1708903517532-03bea2418854?w=900&q=80&fit=crop' },
  { name: 'BMW iX', range: '600 km', power: '516 hp', tag: 'Luxury Electric SUV', price: '₦70M+', img: 'https://images.unsplash.com/photo-1568559598349-dbf322d50a48?w=900&q=80&fit=crop' },
  { name: 'Tesla Model S', range: '650 km', power: '670 hp', tag: 'Performance Sedan', price: '₦75M+', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80&fit=crop' },
  { name: 'Mercedes-Benz EQB', range: '440 km', power: '215 hp', tag: 'Electric Family SUV', price: '₦45M+', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900&q=80&fit=crop' },
  { name: 'BMW i4', range: '520 km', power: '335 hp', tag: 'Electric Gran Coupe', price: '₦55M+', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80&fit=crop' },
]

const COST_SAVINGS = [
  { icon: TrendingDown, title: 'Fuel Savings', desc: 'Save up to ₦2M annually on fuel costs compared to petrol vehicles.', amount: '₦2M+/year' },
  { icon: Wrench, title: 'Maintenance Savings', desc: '60% fewer moving parts means 60% less maintenance. No oil changes, fewer brake replacements.', amount: '₦500K+/year' },
  { icon: Clock, title: 'Time Savings', desc: 'Charge overnight at home. No more trips to the petrol station. Wake up to a full battery.', amount: '100+ hrs/year' },
  { icon: PiggyBank, title: 'Total Cost of Ownership', desc: 'Over 5 years, EVs cost 30-40% less to own than equivalent petrol luxury vehicles.', amount: '30-40% less' },
]

const BENEFITS = [
  { icon: Battery, title: 'Long Real-World Range', desc: 'Modern EVs deliver 400–700 km on a single charge — plenty for Lagos and beyond.' },
  { icon: Zap, title: 'Serious Performance', desc: 'Instant torque, whisper-quiet drivetrain, and 0–100 in under 5 seconds on flagship models.' },
  { icon: Leaf, title: 'Zero Emissions', desc: 'No tailpipe emissions. Reduce your carbon footprint while enjoying luxury driving.' },
  { icon: Gauge, title: 'Tech That Leads', desc: 'MBUX hyperscreen, over-the-air updates, and autonomous-ready driving aids.' },
  { icon: Plug, title: 'Charging Made Simple', desc: 'Charge overnight at home or the office. We help you plan the setup.' },
  { icon: ShieldCheckIcon, title: 'Battery Health & Warranty', desc: 'Verified battery health on every unit, with care guidance for years to come.' },
  { icon: Wind, title: 'Quiet, Refined Ride', desc: 'No engine noise, no gearbox lag. Just smooth, near-silent acceleration.' },
  { icon: PiggyBank, title: 'Long-Term Value', desc: 'Fewer moving parts, less maintenance, and strong resale demand in Nigeria.' },
]

export function Electric() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', model: '', notes: '', honeypot: '' })
  const [saving, setSaving] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

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
      type: 'ev-enquiry',
      name: form.name, email: form.email, phone: form.phone,
      message: `EV enquiry — Model: ${form.model || 'Any'}. ${form.notes || ''}`.trim(),
      source_page: '/ev',
    })
    setSaving(false)
    if (error) { showToast('Failed to submit', 'error'); return }
    showToast('EV enquiry submitted — our team will reach out shortly')
    setForm({ name: '', email: '', phone: '', model: '', notes: '', honeypot: '' })
  }

  const filteredModels = selectedBrand
    ? EV_MODELS.filter(m => m.name.includes(selectedBrand))
    : EV_MODELS

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1568559598349-dbf322d50a48?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1639060015191-57b7c025941d?w=1400&q=90&fit=crop' },
        ]}
        label="Electric Vehicles"
        title="GO Electric. GO Green."
        subtitle="Premium electric vehicles imported, prepped, and ready for Nigerian roads. Save money, save time, save the planet."
        deco="circle"
      />

      {/* Brands — first thing users see */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-fade" style={{ position: 'relative' }}>
          <SectionHeader
            label="Our EV Partners"
            title="Premium Electric Brands"
            desc="We partner with the world's leading electric vehicle manufacturers to bring you the best selection of premium EVs."
          />

          <div className={`scroll-reveal stagger-fade-in ${styles.brandsGrid}`}>
            {EV_BRANDS.map((brand) => (
              <button
                key={brand.name}
                onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                className={`${styles.brandCard} ${selectedBrand === brand.name ? styles.brandSelected : ''}`}
              >
                <img src={brand.logo} alt={brand.name} className={styles.brandLogo} loading="lazy" />
                <p className={styles.brandName}>{brand.name}</p>
                <p className={styles.brandTagline}>{brand.tagline}</p>
                <p className={styles.brandCount}>{brand.models} models</p>
              </button>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* Cost Savings */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-scale" style={{ background: 'var(--navy-deep)', color: 'white', position: 'relative' }}>
          <Sparkle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: '18%', opacity: 0.12 }} size={36} />
          <SectionHeader
            label="Cost Savings"
            title="Save Money with Electric"
            desc="Electric vehicles aren't just better for the environment — they're better for your wallet. Here's how much you can save."
            align="center"
            dark
          />

          <div className={`scroll-reveal stagger-fade-in ${styles.savingsGrid}`}>
            {COST_SAVINGS.map((saving) => (
              <div key={saving.title} className={styles.savingCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <div className={styles.savingIcon}>
                    <saving.icon size={22} />
                  </div>
                  <div>
                    <p className={styles.savingTitle}>{saving.title}</p>
                    <p className={styles.savingAmount}>{saving.amount}</p>
                  </div>
                </div>
                <p className={styles.savingDesc}>{saving.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <Link to="/contact">
              <RippleButton size="md" variant="white">
                Calculate Your Savings <ArrowRight size={16} />
              </RippleButton>
            </Link>
          </div>
        </Section>
      </ParallaxSection>

      {/* Models */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-left" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
            <SectionHeader
              label="Available Models"
              title="Explore Our EV Collection"
              desc={selectedBrand
                ? `Showing ${selectedBrand} models. Can't see your exact spec? Ask — we'll track it down.`
                : 'A taste of what we can source. Click a brand above to filter, or ask about any model.'}
            />
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand(null)}
                className={styles.filterChip}
                style={{ marginBottom: 'var(--space-5)', flexShrink: 0 }}
              >
                Clear filter ×
              </button>
            )}
          </div>

          <div className={`scroll-reveal stagger-fade-in ${styles.modelsGrid}`}>
            {filteredModels.map((m) => (
              <div key={m.name} className={styles.modelCard}>
                <img src={m.img} alt={m.name} loading="lazy" className={styles.modelImage} />
                <div className={styles.modelContent}>
                  <p className={styles.modelTag}>{m.tag}</p>
                  <h3 className={styles.modelName}>{m.name}</h3>
                  <div className={styles.modelSpecs}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Battery size={13} /> {m.range}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={13} /> {m.power}</span>
                  </div>
                  <p className={styles.modelPrice}>{m.price}</p>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Link to="/contact">
                      <RippleButton size="sm" variant="secondary">Enquire Now <ArrowRight size={13} /></RippleButton>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* Benefits */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-right" style={{ position: 'relative' }}>
          <SectionHeader
            label="Why Go Electric"
            title="The Future Is Already Here"
            desc="Electric vehicles are no longer the future — they're the smartest choice on the market today. Here's why."
          />
          <div className={`scroll-reveal stagger-fade-in ${styles.benefitsGrid}`}>
            {BENEFITS.map((b) => (
              <div key={b.title} className={styles.benefitCard}>
                <b.icon size={28} className={styles.benefitIcon} />
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* Contact Section */}
      <Section className="scroll-reveal reveal-big" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionHeader
            label="EV Enquiry"
            title="Interested in an EV?"
            desc="Tell us which model you're after and we'll source it — with charging advice included."
            align="center"
          />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
            </div>
            <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Phone *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            <Input label="Model of Interest" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Mercedes-Benz EQS 450" />
            <TextArea label="Questions / Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Budget, colour, timing..." />
            <RippleButton type="submit" loading={saving}>Request EV Enquiry</RippleButton>
          </form>
        </div>
      </Section>
    </>
  )
}
export default Electric
