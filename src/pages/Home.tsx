import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia, Testimonial } from '@/types'
import { useSiteContent, parseJsonContent, getTextContent } from '@/hooks/useSiteContent'
import { Button } from '@/components/ui/Button'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { RippleButton } from '@/components/RippleButton'
import { SplitHeading } from '@/components/SplitHeading'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { ParallaxSection } from '@/components/ParallaxSection'
import { DecoMark } from '@/components/DecoMark'
import { Squiggle, HandDots, HandArrow, HandBracket, HandCircle, CarSilhouette, SteeringWheel, CarKey, Speedometer, ShieldCheck } from '@/components/DecoSvgs'

import styles from './Home.module.css'

const FALLBACK_CLIENTS = [
  { name: 'Radisson Blu Hotel' }, { name: 'Johnvents Group' },
  { name: 'Dangote Industries' }, { name: 'MTN Nigeria' }, { name: 'Access Bank' },
]

const FALLBACK_TESTIMONIALS = [
  { id: 't1', name: 'Chioma Eze', company: 'Lagos Business School', rating: 5, photo: null,
    quote: 'Empathon Autos made my first car purchase seamless. From selection to delivery, every step was transparent and professional.' },
  { id: 't2', name: 'Ahmed Bello', company: 'Kano Chamber of Commerce', rating: 5, photo: null,
    quote: 'We sourced our entire fleet through Empathon. Their corporate sales team understood our needs and delivered beyond expectations.' },
  { id: 't3', name: 'Ngozi Eze', company: null, rating: 4, photo: null,
    quote: 'I was nervous about importing a car but they handled everything. I just showed up and drove away.' },
]

interface Client { name: string }

export function Home() {
  const mounted = useMounted()
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialsLoaded, setTestimonialsLoaded] = useState(false)
  const { content: homeContent } = useSiteContent('home')
  const clientNames = parseJsonContent<Client>(homeContent, 'clients', FALLBACK_CLIENTS).map(c => c.name)
  const cmsImage = getTextContent(homeContent, 'hero_image')
  const heroImages = [
    cmsImage || 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop',
    'https://images.unsplash.com/photo-1774578432996-54e195b3c5b0?w=1400&q=90&fit=crop',
    'https://images.unsplash.com/photo-1779025313068-b4a11d86bf0d?w=1400&q=90&fit=crop',
    'https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=1400&q=90&fit=crop',
  ]
  const [currentIndex, setCurrentIndex] = useState(0)
  const nextImage = useCallback(() => setCurrentIndex(i => (i + 1) % heroImages.length), [heroImages.length])
  useEffect(() => {
    const id = setInterval(nextImage, 5000)
    return () => clearInterval(id)
  }, [nextImage])

  const loadVehicles = () => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setFetchError(null)
    setLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase.from('vehicles').select('*, media:vehicle_media(*)').eq('is_featured', true).neq('status', 'sold').limit(6)
        if (!mounted.current) return
        if (error) {
          console.error('[Home] Failed to load featured vehicles:', error.message)
          setFetchError('Could not load vehicles. Please try again.')
        } else if (data) {
          setVehicles(data as unknown as (Vehicle & { media: VehicleMedia[] })[])
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
        .limit(6)
      if (mounted.current) {
        if (data) setTestimonials(data)
        setTestimonialsLoaded(true)
      }
    })()
  }, [])

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        {/* Hero images — crossfade */}
        {heroImages.map((url, i) => (
          <img
            key={url}
            className={`${styles.heroImage} ${i === currentIndex ? styles.heroImageActive : styles.heroImageInactive}`}
            src={url}
            alt="Premium luxury car"
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'low'}
          />
        ))}
        {/* Dark gradient overlay for text readability on the left */}
        <div className={styles.heroOverlay} />
        {/* Image indicators */}
        <div className={styles.heroDots}>
          {heroImages.map((_, i) => (
            <button
              key={i}
              className={`${styles.heroDot} ${i === currentIndex ? styles.heroDotActive : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
        <CarSilhouette className="deco-positioned" style={{ position: 'absolute', bottom: '10%', left: '6%', opacity: 0.08, width: 160 }} size={160} />
        <HandCircle className="deco-positioned" style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.4 }} size={80} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: '18%', right: '15%', opacity: 0.5 }} />
        <div className={styles.heroContent}>
          <p className={styles.heroTag} style={{ animation: 'fadeInDown 600ms var(--ease-out) forwards' }}>Lagos &middot; Since 2019</p>
          <SplitHeading as="h1" className={styles.heroTitle}>Trust . Fit . Drive.</SplitHeading>
          <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
          <p className={styles.heroSub} style={{ animation: 'fadeInUp 600ms 300ms var(--ease-out) both' }}>
            Real cars. Real people. No games. We bring in quality vehicles from around the world
            and help you find the one that actually fits your life and budget.
          </p>
          <div className={styles.heroCtas} style={{ animation: 'fadeInUp 600ms 500ms var(--ease-out) both' }}>
            <Link to="/inventory"><RippleButton size="md">Browse Inventory <ArrowRight size={16} /></RippleButton></Link>
            <Link to="/contact"><RippleButton size="md" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>Request a Quote</RippleButton></Link>
          </div>
          <div className={styles.heroSecondary} style={{ animation: 'fadeInUp 600ms 700ms var(--ease-out) both' }}>
            <Link to="/corporate">Corporate & Fleet Sales</Link>
            <HandArrow style={{ margin: '0 -4px' }} />
            <Link to="/pre-order">Pre-Order a Vehicle</Link>
          </div>
        </div>
      </section>

      {/* STATS ROW — immediately after hero */}
      <section style={{ background: 'var(--navy)', padding: 'var(--space-4) var(--space-4)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', textAlign: 'center' }}>
            {[
              { label: 'Vehicles Imported', target: 500, suffix: '+' },
              { label: 'Happy Clients', target: 300, suffix: '+' },
              { label: 'Years in Business', target: 6, suffix: '' },
              { label: 'Countries Sourced', target: 12, suffix: '' },
            ].map((stat) => (
              <div key={stat.label} style={{ animation: 'fadeInUp 500ms var(--ease-out) forwards' }}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--gold)', lineHeight: 1, marginBottom: 'var(--space-1)' }}>
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <ParallaxSection className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-light)', position: 'relative' }}>
        <SteeringWheel className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.06 }} size={80} />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Collection</p>
          <SplitHeading as="h2" className={styles.sectionTitle}>Featured Vehicles</SplitHeading>
          <div className="section-divider" />
          <p className={styles.sectionDesc}>Handpicked and ready to go. Every car here is sourced from trusted partners across North America, Europe, the Middle East, and the Far East — then prepped and waiting for you in Lagos.</p>

          {loading ? (
            <div className={styles.featuredGrid}>
              {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : fetchError ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <p style={{ color: 'var(--error, #dc2626)', marginBottom: 'var(--space-2)' }}>{fetchError}</p>
              <Button variant="secondary" size="sm" onClick={loadVehicles}>Try Again</Button>
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div className={`${styles.featuredGrid} stagger-fade-in`}>
                {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                <Link to="/inventory"><RippleButton variant="secondary">View All Vehicles <ArrowRight size={14} /></RippleButton></Link>
              </div>
            </>
          ) : null}
        </div>
      </ParallaxSection>

      {/* EV TEASER */}
      <ParallaxSection className={`scroll-reveal ${styles.evSection}`}>
        <div className={styles.sectionInner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', alignItems: 'center' }}>
            <div>
              <p className={styles.sectionLabel} style={{ color: 'rgba(255,255,255,0.5)' }}>Electric Vehicles</p>
              <SplitHeading as="h2" style={{ color: 'white' }}>Go Electric. Go Silent.</SplitHeading>
              <div className="section-divider" />
              <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 'var(--space-3)', maxWidth: 480 }}>
                Premium EVs — Mercedes-Benz EQ series and more. Lower running costs, serious performance, and the latest tech, imported and ready for Nigerian roads.
              </p>
              <Link to="/ev"><RippleButton size="md">Explore Electric Vehicles <ArrowRight size={15} /></RippleButton></Link>
            </div>
            <div style={{ animation: 'fadeInUp 700ms var(--ease-out) both' }}>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}>
                <img
                  src="https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=900&q=80&fit=crop"
                  alt="Mercedes-Benz electric vehicle"
                  loading="lazy"
                  style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* WALK-IN vs PRE-ORDER */}
      <ParallaxSection className={`scroll-reveal ${styles.section}`} style={{ position: 'relative' }}>
        <CarKey className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.06 }} size={64} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.4 }} />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>How to Buy</p>
          <SplitHeading as="h2" className={styles.sectionTitle}>Two Ways to Drive</SplitHeading>
          <div className="section-divider" />
          <p className={styles.sectionDesc}>If you want to drive it today, we've got stock. If you want something specific, we'll find it. Simple as that.</p>

          <div className={`${styles.explainerGrid} stagger-fade-in`}>
            <div className={styles.explainerCard}>
              <DecoMark variant="shield" size={36} />
              <h3>Walk-In &mdash; In Stock</h3>
              <p>Come see us at 123 Ajao Road, Ikeja. Test drive whatever catches your eye, ask all the questions you want, and drive home the same day if it feels right. Paperwork included.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory?status=walk-in"><RippleButton size="sm" variant="secondary">Browse In-Stock Vehicles</RippleButton></Link>
              </div>
            </div>
            <div className={styles.explainerCard}>
              <DecoMark variant="arrow" size={36} />
              <h3>Pre-Order &mdash; Import &amp; Allocation</h3>
              <p>Can't find that exact spec on the lot? Tell us what you want and we'll track it down through our network — Japan, Dubai, Europe, wherever it takes. A small deposit secures your place in line.</p>
              <div className={styles.explainerCta}>
                <Link to="/pre-order"><RippleButton size="sm" variant="secondary">Learn About Pre-Ordering</RippleButton></Link>
              </div>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* CORPORATE vs INDIVIDUAL */}
      <ParallaxSection className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-warm)', position: 'relative' }}>
        <ShieldCheck className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.05 }} size={56} />
        <HandBracket className="deco-positioned" position="top-right" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.3 }} />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Who We Serve</p>
          <SplitHeading as="h2" className={styles.sectionTitle}>Tailored for You</SplitHeading>
          <div className="section-divider" />
          <p className={styles.sectionDesc}>One car or a whole fleet — we'll treat you the same: with respect, transparency, and zero nonsense.</p>

          <div className={`${styles.explainerGrid} stagger-fade-in`}>
            <div className={styles.explainerCard}>
              <DecoMark variant="split" size={36} />
              <h3>Individual Buyers</h3>
              <p>Browse what we've got, book a test drive, or just walk in. We'll walk you through everything — financing, documents, registration — so you can focus on the fun part.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory"><RippleButton size="sm" variant="secondary">Browse as Individual</RippleButton></Link>
              </div>
            </div>
            <div className={styles.explainerCard}>
              <DecoMark variant="shield" size={36} />
              <h3>Corporate &amp; Fleet Buyers</h3>
              <p>Better pricing on bulk orders, a dedicated person who knows your account, and after-sales support that actually shows up. Trusted by Radisson Blu Hotel, Johnvents Group, and others.</p>
              <div className={styles.explainerCta}>
                <Link to="/corporate"><RippleButton size="sm" variant="secondary">Explore Corporate Sales</RippleButton></Link>
              </div>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* TRUST + CLIENT LOGOS */}
      <section className={`scroll-reveal ${styles.section}`} style={{ position: 'relative' }}>
          <HandCircle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.2 }} size={60} />
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel} style={{ textAlign: 'center', justifyContent: 'center' }}>Trusted By</p>
            <SplitHeading as="h2" className={styles.sectionTitle} style={{ textAlign: 'center' }}>Our Clients</SplitHeading>
            <div className="section-divider section-divider-center" />
            <p className={styles.sectionDesc} style={{ textAlign: 'center', margin: '0 auto var(--space-3)' }}>
              Organisations that trust us to keep their teams moving.
            </p>
            <div className={styles.trustStrip}>
              {clientNames.map((name: string, i: number) => (
                <span key={name} className={styles.trustItem} style={{ animation: `fadeInUp 400ms ${i * 80}ms var(--ease-out) both` }}>{name}</span>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--stone)', marginTop: 'var(--space-2)' }}>
              Sourcing from North America, Europe, the Middle East, and the Far East since 2019.
            </p>
          </div>
        </section>

      {/* TESTIMONIALS */}
      <ParallaxSection className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-light)', position: 'relative' }}>
          <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-4)', opacity: 0.35 }} />
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>Testimonials</p>
            <SplitHeading as="h2" className={styles.sectionTitle}>What Our Customers Say</SplitHeading>
            <div className="section-divider" />
            <div className={`${styles.testimonialGrid} stagger-fade-in`}>
              {(testimonials.length > 0 ? testimonials : (!testimonialsLoaded ? FALLBACK_TESTIMONIALS : [])).map((t) => (
                <div key={t.id} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className={styles.star} viewBox="0 0 20 20" fill={j < t.rating ? 'var(--gold)' : 'var(--border)'}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                  <div className={styles.testimonialAuthorRow}>
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className={styles.testimonialAvatar} />
                    ) : (
                      <div className={styles.testimonialAvatarFallback}>
                        {t.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <p className={styles.testimonialAuthor}>{t.name}</p>
                      {t.company && <p className={styles.testimonialCompany}>{t.company}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ParallaxSection>

      {/* CTA */}
      <section className={`scroll-reveal ${styles.ctaSection}`} style={{ position: 'relative' }}>
        <Speedometer className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-4)', left: '10%', opacity: 0.06 }} size={72} />
        <HandCircle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-4)', left: '8%', opacity: 0.15 }} size={100} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-4)', right: '10%', opacity: 0.3 }} />
        <HandBracket className="deco-positioned" position="top-right" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.12 }} />
        <SplitHeading as="h2">Ready to Get Behind the Wheel?</SplitHeading>
        <p>No pressure. No pushy sales. Just real cars and honest conversation.</p>
        <div className={styles.ctaCtas}>
          <Link to="/inventory"><RippleButton variant="secondary" style={{ background: 'white', color: 'var(--navy)', borderColor: 'white' }}>Browse Inventory</RippleButton></Link>
          <Link to="/contact"><RippleButton variant="ghost" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>Contact Us</RippleButton></Link>
        </div>
      </section>
    </>
  )
}
export default Home
