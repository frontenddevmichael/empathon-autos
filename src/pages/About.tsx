import { Link } from 'react-router-dom'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { Section } from '@/components/PageLayout'
import { SplitHeading } from '@/components/SplitHeading'
import { RippleButton } from '@/components/RippleButton'
import { ParallaxSection } from '@/components/ParallaxSection'
import { HeroSection } from '@/components/HeroSection'
import { Squiggle, HandCircle, HandDots, HandBracket, SteeringWheel, Speedometer, ShieldCheck, Handshake, Sparkle, Compass, ChatBubble } from '@/components/DecoSvgs'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'

interface TeamMember {
  name: string
  role: string
}

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
          { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=90&fit=crop' },
        ]}
        label="About"
        title="Trust . Fit . Drive. Since 2019."
        subtitle="We sell cars in Lagos. Not much more complicated than that. Since 2019 we've been importing, pre-ordering, and putting people behind the wheel of vehicles they actually want."
        deco="car"
      />

      <ParallaxSection><Section style={{ position: 'relative' }}>
        <Speedometer className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.05 }} size={64} />
        <HandBracket className="deco-positioned" position="top-right" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', opacity: 0.3 }} />
        {aboutError && !aboutContent.length && (
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', background: 'rgba(220,38,38,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(220,38,38,0.1)' }}>
            <p style={{ color: 'var(--error, #dc2626)', fontSize: 'var(--text-sm)' }}>Could not load page content. Showing defaults.</p>
          </div>
        )}
        <div className="scroll-reveal responsive-grid-2 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="scroll-reveal-child">
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>What We're About</p>
            <p style={{ fontSize: 'var(--text-lg)', lineHeight: 1.7 }}>
              We bring in solid vehicles from markets around the world — Japan, Dubai, Europe, the US — and help people in Lagos find the right one without the usual car dealer nonsense. No hidden fees, no runaround, just straight talk.
            </p>
          </div>
          <div className="scroll-reveal-child" style={{ ['--reveal-delay' as string]: '100ms' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>Where We're Headed</p>
            <p style={{ fontSize: 'var(--text-lg)', lineHeight: 1.7 }}>
              We want to be the car people in Nigeria actually trust. Not because we say so — because every person who drives off our lot becomes someone who tells their friends about us. That's the only metric that matters.
            </p>
          </div>
        </div>
      </Section></ParallaxSection>

      <ParallaxSection><Section className="scroll-reveal" style={{ background: 'var(--paper-light)', position: 'relative' }}>
        <ShieldCheck className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.04 }} size={48} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.35 }} />
        <SplitHeading as="h2" style={{ marginBottom: 'var(--space-3)' }}>Core Values</SplitHeading>
        <div className="section-divider" />
        <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-2)' }} />
        <div className="responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
          {[
            { title: 'No Nonsense', desc: 'Clear pricing. No bait-and-switch. What you see is what you pay.' },
            { title: 'Your Side, Always', desc: "We're not here to push a sale. We're here to find the right fit." },
            { title: 'Keep Getting Better', desc: 'Every car, every customer, every interaction — we learn and improve.' },
            { title: 'Do It Properly', desc: "From sourcing to handover, we sweat the details so you don't have to." },
          ].map((v, i) => (
            <div key={v.title} className="scroll-reveal-child" style={{ padding: 'var(--space-3)', border: '1px solid rgba(10,10,10,0.06)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', ['--reveal-delay' as string]: `${i * 80}ms` }}>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 6, letterSpacing: '-0.02em' }}>{v.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </Section></ParallaxSection>

      <ParallaxSection><Section className="scroll-reveal" style={{ position: 'relative' }}>
        <SteeringWheel className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.04 }} size={56} />
        <HandCircle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.2 }} size={48} />
        <SplitHeading as="h2" style={{ marginBottom: 'var(--space-3)' }}>Our Services</SplitHeading>
        <div className="section-divider" />
        <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-2)' }} />
        <div className="responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
          {[
            { title: 'Car Sales', desc: 'Quality vehicles sourced from Japan, Dubai, Europe, and the US.' },
            { title: 'Pre-Orders', desc: "Want something specific? We'll hunt it down for you." },
            { title: 'Honest Advice', desc: "Not sure what to buy? We'll help you figure it out, even if it means a smaller commission." },
            { title: 'After-Sales', desc: 'Warranty, maintenance tips, and someone to call when you need help.' },
          ].map((s, i) => (
            <div key={s.title} className="scroll-reveal-child" style={{ padding: 'var(--space-3)', border: '1px solid rgba(10,10,10,0.06)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', ['--reveal-delay' as string]: `${i * 80}ms` }}>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 6, letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </Section></ParallaxSection>

      {leadership.length > 0 && (
        <ParallaxSection><Section className="scroll-reveal" style={{ background: 'var(--paper-warm)', position: 'relative' }}>
          <Handshake className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.04 }} size={56} />
          <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.3 }} />
          <HandBracket className="deco-positioned" position="bottom-right" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-2)', opacity: 0.25 }} />
          <SplitHeading as="h2" style={{ marginBottom: 'var(--space-3)', textAlign: 'center' }}>The Team</SplitHeading>
          <div className="section-divider" />
          <Squiggle style={{ margin: '-4px auto var(--space-2)', display: 'block' }} />
          <div className="responsive-grid-4 stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {leadership.map((person, i) => (
              <div key={person.name} className="scroll-reveal-child" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', border: '1px solid rgba(10,10,10,0.06)', textAlign: 'center', ['--reveal-delay' as string]: `${i * 80}ms` }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--navy-light)', margin: '0 auto var(--space-1-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                  {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{person.name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{person.role}</p>
              </div>
            ))}
          </div>
        </Section></ParallaxSection>
      )}

      {/* ── Get in Touch / Lead CTA ── */}
      <ParallaxSection><Section style={{ position: 'relative', textAlign: 'center' }}>
        <Compass className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.05 }} size={56} />
        <ChatBubble className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.04 }} size={48} />
        <Sparkle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: '15%', opacity: 0.06 }} size={24} />
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>Let&rsquo;s Talk</p>
        <SplitHeading as="h2" style={{ marginBottom: 'var(--space-1)' }}>Ready to Get Started?</SplitHeading>
        <div className="section-divider" />
        <p style={{ color: 'var(--stone)', maxWidth: 420, margin: '0 auto var(--space-3)' }}>
          Whether you&rsquo;re buying your first car or building a fleet, we&rsquo;re here to help. No pressure &mdash; just honest guidance.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact">
            <RippleButton size="md">Send an Enquiry <ArrowRight size={15} /></RippleButton>
          </Link>
          <a
            href="https://wa.me/2348023392388?text=Hi%20Empathon%20Autos!%20I%27d%20like%20to%20know%20more%20about%20your%20services."
            target="_blank" rel="noopener noreferrer"
          >
            <RippleButton variant="secondary" size="md">
              <MessageCircle size={15} style={{ marginRight: 4 }} />
              WhatsApp Us
            </RippleButton>
          </a>
        </div>
      </Section></ParallaxSection>
    </>
  )
}
