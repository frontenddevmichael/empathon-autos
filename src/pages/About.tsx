import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ArrowRight, Search, ClipboardCheck, Truck, Handshake } from 'lucide-react'
import { RippleButton } from '@/components/RippleButton'
import { config } from '@/lib/config'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import styles from './About.module.css'

interface TeamMember {
  name: string
  role: string
  photo?: string
}

const STATS = [
  { value: 7, suffix: '+', label: 'Years Active' },
  { value: 500, suffix: '+', label: 'Vehicles Delivered' },
  { value: 4, suffix: '', label: 'Countries Sourced' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
]

const PROCESS_STEPS = [
  { icon: Search, title: 'Source', desc: 'We scout Japan, Dubai, Europe, and the US for the best vehicles at the right price.' },
  { icon: ClipboardCheck, title: 'Inspect', desc: 'Every vehicle goes through rigorous inspection before it\'s approved for import.' },
  { icon: Truck, title: 'Import', desc: 'We handle logistics, customs, and documentation — end to end.' },
  { icon: Handshake, title: 'Deliver', desc: 'You get your car with full paperwork, warranty, and a team behind you.' },
]

const WHY_US = [
  {
    heading: 'Global Sourcing, Local Trust',
    desc: 'We have direct relationships with exporters in Japan, Dubai, Europe, and the US. No middlemen, no markups — just honest pricing on quality vehicles.',
    image: '/heroimg2.jpg',
  },
  {
    heading: 'Every Vehicle, Verified',
    desc: 'Before any car reaches our lot, it passes through multi-point inspections. We don\'t cut corners — because our reputation depends on every vehicle we deliver.',
    image: '/heroimg4.jpg',
  },
]

function AnimatedCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1800
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className={styles.statItem}>
      <span className={styles.statValue}>
        {count}{suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

export function About() {
  const { content: aboutContent } = useSiteContent('about')
  const leadership = parseJsonContent<TeamMember>(aboutContent, 'leadership', [
    { name: 'Hassan', role: 'Team Member', photo: '/team/Hassan.jpeg' },
    { name: 'Jimoh', role: 'Team Member', photo: '/team/Jimoh.jpeg' },
    { name: 'Saheed Akintunde', role: 'Team Member', photo: '/team/Saheed Akintunde.jpeg' },
    { name: 'Tolani', role: 'Team Member', photo: '/team/Tolani.jpeg' },
  ])

  const timelineRef = useRef<HTMLDivElement>(null)
  const [timelineProgress, setTimelineProgress] = useState(0)

  useEffect(() => {
    const el = timelineRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const rect = el.getBoundingClientRect()
          const viewH = window.innerHeight
          const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (rect.height + viewH * 0.5)))
          setTimelineProgress(progress)
        }
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 20) }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* ── Section 1: Cinematic Hero ── */}
      <section className={styles.hero}>
        <img
          src="/heroimg.jpg"
          alt=""
          className={styles.heroImage}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Premium Vehicles,<br />Sourced Globally.
          </h1>
          <p className={styles.heroSubtitle}>
            From Tokyo to Lagos — we bring the world's finest vehicles to your driveway. No shortcuts, no surprises.
          </p>
        </div>
      </section>

      {/* ── Section 2: Stats Bar ── */}
      <section className={styles.statsBar}>
        <div className={styles.statsInner}>
          {STATS.map((stat, i) => (
            <div key={stat.label} className={styles.statItem}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
              {i < STATS.length - 1 && <div className={styles.statDivider} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Process Timeline ── */}
      <section className={styles.processSection}>
        <div className={styles.processInner}>
          <p className={styles.sectionLabel}>How It Works</p>
          <h2 className={styles.sectionTitle}>Our Process</h2>

          <div className={styles.timeline} ref={timelineRef}>
            <div className={styles.timelineLine}>
              <div
                className={styles.timelineFill}
                style={{ width: `${timelineProgress * 100}%` }}
              />
            </div>

            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className={styles.timelineStep}
                  data-step={i + 1}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className={styles.timelineDot}>
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineTitle}>{step.title}</h3>
                    <p className={styles.timelineDesc}>{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Parallax Image ── */}
      <section className={styles.parallaxSection}>
        <img
          src="/heroimg3.jpg"
          alt=""
          className={styles.parallaxImage}
          loading="lazy"
        />
        <div className={styles.parallaxOverlay} />
        <blockquote className={styles.parallaxQuote}>
          <p>"We don't just sell cars — we build relationships that last longer than any warranty."</p>
          <cite>— Empathon Autos</cite>
        </blockquote>
      </section>

      {/* ── Section 5: Why Choose Us — Alternating Blocks ── */}
      <section className={styles.whySection}>
        <div className={styles.whyInner}>
          <p className={styles.sectionLabel}>Why Empathon</p>
          <h2 className={styles.sectionTitle}>Built on Trust, Driven by Quality</h2>

          <div className={styles.whyBlocks}>
            {WHY_US.map((block, i) => (
              <div
                key={block.heading}
                className={`${styles.whyBlock} ${i % 2 === 1 ? styles.whyBlockReversed : ''}`}
              >
                <div className={styles.whyText}>
                  <h3 className={styles.whyHeading}>{block.heading}</h3>
                  <p className={styles.whyDesc}>{block.desc}</p>
                </div>
                <div className={styles.whyImageWrap}>
                  <img src={block.image} alt="" className={styles.whyImage} loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Team ── */}
      {leadership.length > 0 && (
        <section className={styles.teamSection}>
          <div className={styles.teamInner}>
            <p className={styles.sectionLabel}>Our People</p>
            <h2 className={styles.sectionTitle}>The Team</h2>

            <div className={styles.teamGrid}>
              {leadership.map((person, i) => (
                <div
                  key={person.name}
                  className={styles.teamMember}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {person.photo ? (
                    <img src={person.photo} alt={person.name} className={styles.teamPhoto} />
                  ) : (
                    <div className={styles.teamInitials}>
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className={styles.teamInfo}>
                    <p className={styles.teamName}>{person.name}</p>
                    <p className={styles.teamRole}>{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 7: CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Find Your Next Car?</h2>
          <p className={styles.ctaSubtitle}>
            Whether you're buying your first car or building a fleet, we're here to help. No pressure — just honest guidance.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/inventory">
              <RippleButton size="md">Browse Inventory <ArrowRight size={15} /></RippleButton>
            </Link>
            <a
              href={config.whatsapp.getDeepLink("Hi Empathon Autos! I'd like to know more.")}
              target="_blank" rel="noopener noreferrer"
            >
              <RippleButton variant="secondary" size="md">
                <MessageCircle size={15} style={{ marginRight: 4 }} />
                WhatsApp Us
              </RippleButton>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
