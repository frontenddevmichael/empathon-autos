import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia, Testimonial } from '@/types'
import { useSiteContent, parseJsonContent, getTextContent } from '@/hooks/useSiteContent'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Section } from '@/components/layout/Section'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { AnimatedCounter } from '@/components/AnimatedCounter'

import styles from './Home.module.css'

interface Stat {
  label: string
  target: number
  suffix?: string
}

/**
 * The buying journey, in four steps. Every claim here is one the client already
 * makes in their own copy — nothing about timelines or guarantees is invented.
 */
const PROCESS = [
  {
    n: '01',
    title: 'Choose your route',
    body: 'Walk into the showroom in Ikeja and drive away in something we already have, or tell us the exact car you want and we will pre-order it.',
  },
  {
    n: '02',
    title: 'We source it',
    body: 'Our network runs through Japan, Dubai, Europe and North America. If the car you want is out there, we can find it.',
  },
  {
    n: '03',
    title: 'Inspect and clear',
    body: 'Every vehicle is inspected before it ships, then cleared and documented on arrival in Lagos.',
  },
  {
    n: '04',
    title: 'Take the keys',
    body: 'Collect it from the showroom at 123 Ajao Road, off Awolowo Way, or have it delivered. Paperwork done, no surprises.',
  },
]

export function Home() {
  const mounted = useMounted()
  const { content: homeContent } = useSiteContent('home')
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialsLoaded, setTestimonialsLoaded] = useState(false)

  const heroImage = getTextContent(homeContent, 'hero_image') || '/heroimg3.jpg'

  // Stats and testimonials render only from real rows. No invented numbers,
  // no fallback quotes: an empty table means an absent section, not fake proof.
  const stats = parseJsonContent<Stat>(homeContent, 'stats', [])
  const publishedTestimonials = testimonialsLoaded ? testimonials : []

  const loadVehicles = () => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setFetchError(null)
    setLoading(true)
    ;(async () => {
      try {
        const column = '*, media:vehicle_media(*)'
        const featured = await supabase
          .from('vehicles')
          .select(column)
          .eq('is_featured', true)
          .neq('status', 'sold')
          .limit(6)
        if (!mounted.current) return
        if (featured.error) {
          console.error('[Home] Failed to load featured vehicles:', featured.error.message)
          setFetchError('Could not load vehicles. Please try again.')
        } else {
          // Nothing is flagged as featured yet, so fall back to the newest stock
          // rather than showing an empty collection on the home page.
          let rows = (featured.data ?? []) as unknown as (Vehicle & { media: VehicleMedia[] })[]
          if (rows.length === 0) {
            const latest = await supabase
              .from('vehicles')
              .select(column)
              .neq('status', 'sold')
              .order('created_at', { ascending: false })
              .limit(6)
            if (!mounted.current) return
            rows = (latest.data ?? []) as unknown as (Vehicle & { media: VehicleMedia[] })[]
          }
          setVehicles(rows)
        }
      } catch (err) {
        if (!mounted.current) return
        console.error('[Home] Unexpected error loading vehicles:', err)
        setFetchError('Something went wrong. Please try again.')
      }
      if (mounted.current) setLoading(false)
    })()
  }

  useEffect(() => { loadVehicles() }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) { setTestimonialsLoaded(true); return }
    ;(async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(3)
      if (mounted.current) {
        if (data) setTestimonials(data)
        setTestimonialsLoaded(true)
      }
    })()
  }, [])

  // Sticky process: the step whose middle crosses the viewport centre wins
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const nodes = stepRefs.current.filter((n): n is HTMLDivElement => n !== null)
    if (nodes.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveStep(Number((entry.target as HTMLElement).dataset.step))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const text = (key: string, fallback: string) => getTextContent(homeContent, key) || fallback

  return (
    <>
      {/* HERO — one photograph, one headline, two actions */}
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src={heroImage}
          alt=""
          aria-hidden="true"
          width={1376}
          height={768}
          fetchPriority="high"
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroTag}>Lagos &middot; Since 2019</p>
          <h1 className={styles.heroTitle}>Your next drive<br />starts here.</h1>
          <p className={styles.heroSub}>
            Premium vehicles from four continents, inspected, explained and delivered.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/inventory"><Button size="lg" variant="white">Browse Inventory</Button></Link>
            <Link to="/contact"><Button size="lg" variant="ghostLight">Book a Test Drive</Button></Link>
          </div>
        </div>
      </section>

      {/* NUMBERS — client-entered CMS figures, shown only when they exist */}
      {stats.length > 0 && (
        <Section className={`scroll-reveal ${styles.statsSection}`} tone="paper" space="sm">
          <p className={styles.statsLabel}>By the numbers</p>
          <dl className={styles.stats}>
            {stats.map(stat => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>
                  <AnimatedCounter target={stat.target} suffix={stat.suffix ?? ''} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* HOW IT WORKS — the one pinned scroll moment on the site */}
      <Section className="scroll-reveal" tone="navy" space="lg" id="how-it-works">
        <div className={styles.how}>
          <div className={styles.howAside}>
            <SectionHeader
              dark
              label={text('how_to_buy_label', 'How to Buy')}
              title={<>From four continents<br />to your driveway.</>}
            />
            <ol className={styles.stepList} aria-hidden="true">
              {PROCESS.map((step, i) => (
                <li key={step.n} className={i === activeStep ? styles.stepActive : styles.stepIdle}>
                  <span className={styles.stepNum}>{step.n}</span>
                  <span>{step.title}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.panels}>
            {PROCESS.map((step, i) => (
              <div
                key={step.n}
                ref={el => { stepRefs.current[i] = el }}
                data-step={i}
                className={`${styles.panel} ${i === activeStep ? styles.panelActive : ''}`}
              >
                <p className={styles.panelNum}>{step.n}</p>
                <h3 className={styles.panelTitle}>{step.title}</h3>
                <p className={styles.panelBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FEATURED VEHICLES */}
      <Section className="scroll-reveal" tone="warm" space="lg" id="featured">
        <div className={styles.featuredHead}>
          <SectionHeader
            label={text('featured_section_label', 'Collection')}
            title={text('featured_section_title', 'Featured Vehicles')}
            desc={text('featured_section_desc', 'Handpicked cars from Japan, Dubai, Europe and the US, inspected, imported and ready to drive.')}
          />
          <Link to="/inventory" className={styles.allLink}>View all vehicles</Link>
        </div>

        {loading ? (
          <div className={styles.featuredGrid}>
            {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : fetchError ? (
          <div className={styles.errorState}>
            <p className={styles.errorText}>{fetchError}</p>
            <Button variant="secondary" size="sm" onClick={loadVehicles}>Try again</Button>
          </div>
        ) : vehicles.length > 0 ? (
          <div className={`${styles.featuredGrid} stagger-fade-in`}>
            {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        ) : (
          <p className={styles.emptyNote}>
            New stock is on its way. <Link to="/inventory">Browse the full inventory</Link> or
            <Link to="/pre-order"> tell us what you are looking for</Link>.
          </p>
        )}
      </Section>

      {/* ELECTRIC */}
      <Section className="scroll-reveal" tone="deep" space="lg" id="electric">
        <div className={styles.statement}>
          <SectionHeader
            dark
            label={text('ev_teaser_label', 'Electric Vehicles')}
            title={text('ev_teaser_title', 'Go Electric. Go Green.')}
            desc={text('ev_teaser_desc', 'Quiet, quick and cheap to run. Have a look at the electric cars we can source, from city cars to big SUVs.')}
          />
          <Link to="/ev"><Button size="lg" variant="white">Explore electric vehicles</Button></Link>
        </div>
      </Section>

      {/* TESTIMONIALS — real rows only */}
      {publishedTestimonials.length > 0 && (
        <Section className="scroll-reveal" tone="paper" space="lg" id="testimonials">
          <SectionHeader
            label={text('testimonials_label', 'Testimonials')}
            title={text('testimonials_title', 'What Our Clients Say')}
          />
          <div className={styles.quotes}>
            {publishedTestimonials.map(t => (
              <figure key={t.id} className={styles.quote}>
                <blockquote className={styles.quoteText}>{t.quote}</blockquote>
                <figcaption className={styles.quoteBy}>
                  <span className={styles.quoteName}>{t.name}</span>
                  {t.company && <span className={styles.quoteCompany}>{t.company}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {/* CORPORATE */}
      <Section className="scroll-reveal" tone="navy" space="lg" id="corporate">
        <div className={styles.corporate}>
          <SectionHeader
            dark
            label="Corporate"
            title={text('corporate_title', 'Corporate & Fleet')}
            desc={text('corporate_desc', 'Building a fleet? We offer volume pricing, dedicated account management, and fleet maintenance support.')}
          />
          <div className={styles.corporateActions}>
            <Link to="/corporate"><Button size="lg" variant="white">Corporate sales</Button></Link>
            <Link to="/contact"><Button size="lg" variant="ghostLight">Talk to us</Button></Link>
          </div>
        </div>
      </Section>

      {/* CLOSING */}
      <Section className="scroll-reveal" tone="paper" space="lg" id="enquire">
        <div className={styles.closing}>
          <h2 className={styles.closingTitle}>{text('cta_title', 'Ready to Find Your Car?')}</h2>
          <p className={styles.closingDesc}>
            {text('cta_desc', "Whether it's your first car or a whole fleet, we're here to help. No pressure, just straight answers.")}
          </p>
          <div className={styles.closingActions}>
            <Link to="/inventory"><Button size="lg">Browse inventory</Button></Link>
            <Link to="/contact"><Button size="lg" variant="secondary">Contact us</Button></Link>
          </div>
        </div>
      </Section>
    </>
  )
}
