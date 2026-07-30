import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia, Testimonial } from '@/types'
import { useSiteContent, parseJsonContent, getTextContent } from '@/hooks/useSiteContent'
import { Button } from '@/components/ui/Button'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { DecoMark } from '@/components/DecoMark'
import { Squiggle, HandDots, HandArrow, HandBracket, HandCircle, WavyDivider, CarSilhouette, SteeringWheel, CarKey, Speedometer, ShieldCheck } from '@/components/DecoSvgs'

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
  const { content: homeContent } = useSiteContent('home')
  const clientNames = parseJsonContent<Client>(homeContent, 'clients', FALLBACK_CLIENTS).map(c => c.name)
  const heroImageUrl = getTextContent(homeContent, 'hero_image') || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=90&fit=crop'

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
    if (!isSupabaseConfigured()) return
    ;(async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(6)
      if (mounted.current && data) setTestimonials(data)
    })()
  }, [])

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        {/* Single hero car image — right side */}
        <img
          className={styles.heroImage}
          src={heroImageUrl}
          alt="Premium luxury car"
          loading="eager"
          fetchPriority="high"
        />
        {/* Dark gradient overlay for text readability on the left */}
        <div className={styles.heroOverlay} />
        <CarSilhouette className="deco-positioned" style={{ position: 'absolute', bottom: '10%', left: '6%', opacity: 0.08, width: 160 }} size={160} />
        <HandCircle className="deco-positioned" style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.4 }} size={80} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: '18%', right: '15%', opacity: 0.5 }} />
        <div className={styles.heroContent}>
          <p className={styles.heroTag}>Lagos &middot; Since 2019</p>
          <h1 className={styles.heroTitle}>Trust . Fit . Drive.</h1>
          <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
          <p className={styles.heroSub}>
            Real cars. Real people. No games. We bring in quality vehicles from around the world
            and help you find the one that actually fits your life and budget.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/inventory"><Button size="md">Browse Inventory <ArrowRight size={16} /></Button></Link>
            <Link to="/contact"><Button size="md" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>Request a Quote</Button></Link>
          </div>
          <div className={styles.heroSecondary}>
            <Link to="/corporate">Corporate & Fleet Sales</Link>
            <HandArrow style={{ margin: '0 -4px' }} />
            <Link to="/pre-order">Pre-Order a Vehicle</Link>
          </div>
        </div>
      </section>

      {/* Smooth gradient transition from navy hero to paper-light content */}
      <div aria-hidden="true" className={styles.heroTransition} />

      {/* FEATURED VEHICLES */}
      <section className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-light)', position: 'relative' }}>
        <SteeringWheel className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.06 }} size={80} />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Collection</p>
          <h2 className={styles.sectionTitle}>Featured Vehicles</h2>
          <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
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
              <div className={styles.featuredGrid}>
                {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                <Link to="/inventory"><Button variant="secondary">View All Vehicles <ArrowRight size={14} /></Button></Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* WALK-IN vs PRE-ORDER */}
      <section className={`scroll-reveal ${styles.section}`} style={{ position: 'relative' }}>
        <CarKey className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.06 }} size={64} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.4 }} />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>How to Buy</p>
          <h2 className={styles.sectionTitle}>Two Ways to Drive</h2>
          <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
          <p className={styles.sectionDesc}>If you want to drive it today, we've got stock. If you want something specific, we'll find it. Simple as that.</p>

          <div className={styles.explainerGrid}>
            <div className={`scroll-reveal-child ${styles.explainerCard}`}>
              <DecoMark variant="shield" size={36} />
              <h3>Walk-In &mdash; In Stock</h3>
              <p>Come see us at 123 Ajao Road, Ikeja. Test drive whatever catches your eye, ask all the questions you want, and drive home the same day if it feels right. Paperwork included.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory?status=walk-in"><Button size="sm" variant="secondary">Browse In-Stock Vehicles</Button></Link>
              </div>
            </div>
            <div className={`scroll-reveal-child ${styles.explainerCard}`}>
              <DecoMark variant="arrow" size={36} />
              <h3>Pre-Order &mdash; Import &amp; Allocation</h3>
              <p>Can't find that exact spec on the lot? Tell us what you want and we'll track it down through our network — Japan, Dubai, Europe, wherever it takes. A small deposit secures your place in line.</p>
              <div className={styles.explainerCta}>
                <Link to="/pre-order"><Button size="sm" variant="secondary">Learn About Pre-Ordering</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORPORATE vs INDIVIDUAL */}
      <section className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-warm)', position: 'relative' }}>
        <ShieldCheck className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.05 }} size={56} />
        <HandBracket className="deco-positioned" position="top-right" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.3 }} />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Who We Serve</p>
          <h2 className={styles.sectionTitle}>Tailored for You</h2>
          <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
          <p className={styles.sectionDesc}>One car or a whole fleet — we'll treat you the same: with respect, transparency, and zero nonsense.</p>

          <div className={styles.explainerGrid}>
            <div className={`scroll-reveal-child ${styles.explainerCard}`}>
              <DecoMark variant="split" size={36} />
              <h3>Individual Buyers</h3>
              <p>Browse what we've got, book a test drive, or just walk in. We'll walk you through everything — financing, documents, registration — so you can focus on the fun part.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory"><Button size="sm" variant="secondary">Browse as Individual</Button></Link>
              </div>
            </div>
            <div className={`scroll-reveal-child ${styles.explainerCard}`}>
              <DecoMark variant="shield" size={36} />
              <h3>Corporate &amp; Fleet Buyers</h3>
              <p>Better pricing on bulk orders, a dedicated person who knows your account, and after-sales support that actually shows up. Trusted by Radisson Blu Hotel, Johnvents Group, and others.</p>
              <div className={styles.explainerCta}>
                <Link to="/corporate"><Button size="sm" variant="secondary">Explore Corporate Sales</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST + CLIENT LOGOS */}
      <section className={`scroll-reveal ${styles.section}`} style={{ position: 'relative' }}>
          <HandCircle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.2 }} size={60} />
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel} style={{ textAlign: 'center' }}>Trusted By</p>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Our Clients</h2>
            <WavyDivider style={{ margin: '0 auto var(--space-2)', maxWidth: '200px' }} />
            <p className={styles.sectionDesc} style={{ textAlign: 'center', margin: '0 auto var(--space-3)' }}>
              Organisations that trust us to keep their teams moving.
            </p>
            <div className={styles.trustStrip}>
              {clientNames.map((name: string) => (
                <span key={name} className={styles.trustItem}>{name}</span>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--stone)', marginTop: 'var(--space-2)' }}>
              Sourcing from North America, Europe, the Middle East, and the Far East since 2019.
            </p>
          </div>
        </section>

      {/* TESTIMONIALS */}
      <section className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-light)', position: 'relative' }}>
          <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-4)', opacity: 0.35 }} />
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>Testimonials</p>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
            <div className={styles.testimonialGrid}>
              {(testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS).map((t, i) => (
                <div key={t.id} className={`scroll-reveal-child ${styles.testimonialCard}`} style={{ ['--reveal-delay' as string]: `${i * 100}ms` }}>
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
        </section>

      {/* CTA */}
      <section className={`scroll-reveal ${styles.ctaSection}`} style={{ position: 'relative' }}>
        <Speedometer className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-4)', left: '10%', opacity: 0.06 }} size={72} />
        <HandCircle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-4)', left: '8%', opacity: 0.15 }} size={100} />
        <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-4)', right: '10%', opacity: 0.3 }} />
        <HandBracket className="deco-positioned" position="top-right" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', opacity: 0.12 }} />
        <h2>Ready to Get Behind the Wheel?</h2>
        <p>No pressure. No pushy sales. Just real cars and honest conversation.</p>
        <div className={styles.ctaCtas}>
          <Link to="/inventory"><Button variant="secondary" style={{ background: 'white', color: 'var(--navy)', borderColor: 'white' }}>Browse Inventory</Button></Link>
          <Link to="/contact"><Button variant="ghost" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>Contact Us</Button></Link>
        </div>
      </section>
    </>
  )
}
export default Home
