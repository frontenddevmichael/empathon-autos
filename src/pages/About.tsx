import { Link } from 'react-router-dom'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { Section } from '@/components/PageLayout'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { RippleButton } from '@/components/RippleButton'
import { ParallaxSection } from '@/components/ParallaxSection'
import { HeroSection } from '@/components/HeroSection'
import { Speedometer, ShieldCheck } from '@/components/DecoSvgs'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import { config } from '@/lib/config'
import styles from './About.module.css'

interface TeamMember {
  name: string
  role: string
}

const VALUES = [
  { title: 'Straight With You', desc: 'Clear pricing, honest advice, and no surprises. What we promise is what you get.' },
  { title: 'Your Side, Always', desc: "We're not here to push a sale. We're here to find the right fit." },
  { title: 'Keep Getting Better', desc: 'Every car, every customer, every interaction — we learn and improve.' },
  { title: 'Do It Properly', desc: "From sourcing to handover, we sweat the details so you don't have to." },
]

const SERVICES = [
  { title: 'Car Sales', desc: 'Quality vehicles sourced from Japan, Dubai, Europe, and the US.' },
  { title: 'Pre-Orders', desc: "Want something specific? We'll hunt it down for you." },
  { title: 'Honest Advice', desc: "Not sure what to buy? We'll help you figure it out, even if it means a smaller commission." },
  { title: 'After-Sales', desc: 'Warranty, maintenance tips, and someone to call when you need help.' },
]

export function About() {
  const { content: aboutContent, error: aboutError } = useSiteContent('about')
  const leadership = parseJsonContent<TeamMember>(aboutContent, 'leadership', [
    { name: 'Chinwe Okafor', role: 'Managing Director' },
    { name: 'Tunde Balogun', role: 'Head of Operations' },
    { name: 'Amara Obi', role: 'Finance Director' },
    { name: 'Femi Adeleke', role: 'Sales & Marketing Lead' },
  ])
  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1774578432996-54e195b3c5b0?w=1400&q=90&fit=crop' },
        ]}
        label="About"
        title="Trust . Fit . Drive. Since 2019."
        subtitle="We sell cars in Lagos. Not much more complicated than that. Since 2019 we've been importing, pre-ordering, and putting people behind the wheel of vehicles they actually want."
        deco="car"
      />

      {/* Intro — who we are, where we're headed */}
      <ParallaxSection>
        <Section className="scroll-reveal" style={{ position: 'relative' }}>
          {aboutError && !aboutContent.length && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', background: 'rgba(220,38,38,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(220,38,38,0.1)' }}>
              <p style={{ color: 'var(--error, #dc2626)', fontSize: 'var(--text-sm)' }}>Could not load page content. Showing defaults.</p>
            </div>
          )}
          <div className="responsive-grid-2 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="scroll-reveal-child">
              <p className={styles.introLabel}>What We're About</p>
              <p className={styles.introText}>
                We bring in solid vehicles from markets around the world — Japan, Dubai, Europe, the US — and help people in Lagos find the right one without the usual dealer runaround. No hidden fees, no shortcuts, just straight talk.
              </p>
            </div>
            <div className="scroll-reveal-child" style={{ ['--reveal-delay' as string]: '100ms' }}>
              <p className={styles.introLabel}>Where We're Headed</p>
              <p className={styles.introText}>
                We want to be the car people in Nigeria actually trust. Not because we say so — because every person who drives off our lot becomes someone who tells their friends about us. That's the only metric that matters.
              </p>
            </div>
          </div>
        </Section>
      </ParallaxSection>

      {/* Core Values */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-left" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
          <Speedometer className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.08 }} size={72} />
          <SectionHeader label="Our Principles" title="Core Values" />
          <div className="responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {VALUES.map((v, i) => (
              <div key={v.title} className={`${styles.card} scroll-reveal-child`} style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}>
                <h3 className={styles.cardTitle}>{v.title}</h3>
                <p className={styles.cardText}>{v.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* Our Services */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-right" style={{ position: 'relative' }}>
          <ShieldCheck className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', opacity: 0.08 }} size={56} />
          <SectionHeader label="What We Do" title="Our Services" />
          <div className="responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {SERVICES.map((s, i) => (
              <div key={s.title} className={`${styles.card} scroll-reveal-child`} style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardText}>{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </ParallaxSection>

      {/* The Team */}
      {leadership.length > 0 && (
        <ParallaxSection>
          <Section className="scroll-reveal reveal-scale" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
            <SectionHeader label="Leadership" title="The Team" align="center" />
            <div className="responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
              {leadership.map((person, i) => (
                <div key={person.name} className={`${styles.teamCard} scroll-reveal-child`} style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}>
                  <div className={styles.initials}>{person.name.split(' ').map(n => n[0]).join('')}</div>
                  <p className={styles.teamName}>{person.name}</p>
                  <p className={styles.teamRole}>{person.role}</p>
                </div>
              ))}
            </div>
          </Section>
        </ParallaxSection>
      )}

      {/* Get in Touch / Lead CTA */}
      <ParallaxSection>
        <Section className="scroll-reveal reveal-big" style={{ position: 'relative', textAlign: 'center' }}>
          <SectionHeader
            label="Let's Talk"
            title="Ready to Get Started?"
            desc="Whether you're buying your first car or building a fleet, we're here to help. No pressure — just honest guidance."
            align="center"
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact">
              <RippleButton size="md">Send an Enquiry <ArrowRight size={15} /></RippleButton>
            </Link>
            <a
              href={config.whatsapp.getDeepLink("Hi Empathon Autos! I'd like to know more about your services.")}
              target="_blank" rel="noopener noreferrer"
            >
              <RippleButton variant="secondary" size="md">
                <MessageCircle size={15} style={{ marginRight: 4 }} />
                WhatsApp Us
              </RippleButton>
            </a>
          </div>
        </Section>
      </ParallaxSection>
    </>
  )
}
