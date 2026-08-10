import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { ForkRoad, UnderlineFlourish } from '@/components/DecoSvgs'

import styles from './Home.module.css'

const FALLBACK_CLIENTS = [
  { name: 'Radisson Blu Hotel', logo: null }, { name: 'Johnvents Group', logo: null },
  { name: 'Dangote Industries', logo: null }, { name: 'MTN Nigeria', logo: null }, { name: 'Access Bank', logo: null },
]

const FALLBACK_TESTIMONIALS = [
  { id: 't1', name: 'Chioma Eze', company: 'Lagos Business School', rating: 5, photo: null,
    quote: 'Empathon Autos made my first car purchase seamless. From selection to delivery, every step was transparent and professional.' },
  { id: 't2', name: 'Ahmed Bello', company: 'Kano Chamber of Commerce', rating: 5, photo: null,
    quote: 'We sourced our entire fleet through Empathon. Their corporate sales team understood our needs and delivered beyond expectations.' },
  { id: 't3', name: 'Ngozi Eze', company: null, rating: 4, photo: null,
    quote: 'I was nervous about importing a car but they handled everything. I just showed up and drove away.' },
]

const FALLBACK_LEARNING = [
  { id: 'l1', title: 'How to Choose the Right Car for Lagos Roads', category: 'Buying Guide', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&q=80&fit=crop', slug: 'choosing-right-car-lagos', readTime: '5 min read' },
  { id: 'l2', title: 'Pre-Owned vs Brand New: What Makes Sense in Nigeria?', category: 'Market Insights', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80&fit=crop', slug: 'pre-owned-vs-brand-new', readTime: '7 min read' },
  { id: 'l3', title: 'Understanding Import Duties and Clearing Costs', category: 'Import Guide', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80&fit=crop', slug: 'import-duties-clearing', readTime: '6 min read' },
  { id: 'l4', title: 'Electric Vehicles in Nigeria: Are They Worth It?', category: 'EV Guide', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&fit=crop', slug: 'evs-in-nigeria', readTime: '8 min read' },
  { id: 'l5', title: 'Maintaining Your Car in Tropical Climate', category: 'Maintenance Tips', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80&fit=crop', slug: 'maintaining-car-tropical', readTime: '4 min read' },
  { id: 'l6', title: 'Financing Options for Your Next Vehicle', category: 'Finance', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80&fit=crop', slug: 'financing-options', readTime: '5 min read' },
]

interface Client { name: string; logo?: string | null }
interface BlogPost { id: string; title: string; category: string; image?: string; slug: string; readTime?: string }

export function Home() {
  const mounted = useMounted()
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialsLoaded, setTestimonialsLoaded] = useState(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [blogLoaded, setBlogLoaded] = useState(false)
  const { content: homeContent } = useSiteContent('home')
  const clientLogos = parseJsonContent<Client>(homeContent, 'clients', FALLBACK_CLIENTS)
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

  // Signature scroll moment — the hero image set peels gently as the hero scrolls away.
  // Writes straight to the DOM node (no React state), so scroll frames never re-render
  // the page — the same zero-re-render pattern ParallaxSection uses.
  const heroRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = heroRef.current
        const stage = stageRef.current
        if (!el || !stage) return
        const rect = el.getBoundingClientRect()
        const t = Math.max(0, Math.min(1, -rect.top / rect.height))
        // easeOutCubic — the peel starts brisk and settles as it leaves, never abrupt
        const e = 1 - Math.pow(1 - t, 3)
        stage.style.transform = `translate3d(0, ${(e * 48).toFixed(2)}px, 0) scale(${(1 + e * 0.07).toFixed(4)})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // Learning carousel state
  const [learningIndex, setLearningIndex] = useState(0)
  const learningPosts = blogLoaded && blogPosts.length > 0 ? blogPosts : FALLBACK_LEARNING
  const learningItemsToShow = 3
  const maxLearningIndex = Math.max(0, learningPosts.length - learningItemsToShow)

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

  // Load blog posts for learning carousel
  useEffect(() => {
    if (!isSupabaseConfigured()) { setBlogLoaded(true); return }
    ;(async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, cover_image, author, published_at')
        .order('published_at', { ascending: false })
        .limit(6)
      if (mounted.current) {
        if (data && data.length > 0) {
          setBlogPosts(data.map((p: { id: string; title: string; slug: string; cover_image?: string | null; author?: string | null }) => ({
            id: p.id, title: p.title, slug: p.slug,
            category: 'Guides',
            image: p.cover_image || undefined,
            readTime: '5 min read',
          })))
        }
        setBlogLoaded(true)
      }
    })()
  }, [])

  const prevLearning = () => setLearningIndex(i => Math.max(0, i - 1))
  const nextLearning = () => setLearningIndex(i => Math.min(maxLearningIndex, i + 1))

  const displayTestimonials = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className={styles.hero}>
        {/* Hero images — crossfade, on a scroll-peel stage */}
        <div ref={stageRef} className={styles.heroStage}>
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
        </div>
        {/* Single clean gradient — dark on the left for text, clear on the right for the car */}
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
        <div className={styles.heroContent}>
          <div className={styles.heroPanel}>
            <p className={styles.heroTag} style={{ animation: 'fadeInDown 600ms var(--ease-out) forwards' }}>Lagos &middot; Since 2019</p>
            <SplitHeading as="h1" className={styles.heroTitle}>Trust. Fit. Drive.</SplitHeading>
            <p className={styles.heroSub} style={{ animation: 'fadeInUp 600ms 300ms var(--ease-out) both' }}>
              Real cars. Real people. No games. Quality vehicles sourced worldwide,
              and honest guidance to find the one that fits your life and budget.
            </p>
            <div className={styles.heroCtas} style={{ animation: 'fadeInUp 600ms 500ms var(--ease-out) both' }}>
              <Link to="/inventory"><RippleButton size="lg" magnetic>Browse Inventory <ArrowRight size={16} /></RippleButton></Link>
              <Link to="/contact"><RippleButton size="lg" variant="ghostLight">Request a Quote</RippleButton></Link>
            </div>
            <div className={styles.heroSecondary} style={{ animation: 'fadeInUp 600ms 700ms var(--ease-out) both' }}>
              <Link to="/corporate">Corporate &amp; Fleet Sales</Link>
              <span aria-hidden="true" style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
              <Link to="/pre-order">Pre-Order a Vehicle</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND — quiet editorial moment */}
      <section className={styles.statsBand}>
        <div className={styles.statsGrid}>
          {[
            { label: 'Vehicles Imported', target: 500, suffix: '+' },
            { label: 'Happy Clients', target: 300, suffix: '+' },
            { label: 'Years in Business', target: 6, suffix: '' },
            { label: 'Countries Sourced', target: 12, suffix: '' },
          ].map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={`${styles.statValue} scroll-reveal`}>
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <ParallaxSection className={`scroll-reveal ${styles.section}`} style={{ background: 'var(--paper-warm)' }}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Collection</p>
          <h2 className={styles.sectionTitle}>Featured Vehicles</h2>
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
              <div className={styles.sectionCta}>
                <Link to="/inventory"><RippleButton variant="secondary">View All Vehicles <ArrowRight size={14} /></RippleButton></Link>
              </div>
            </>
          ) : null}
        </div>
      </ParallaxSection>

      {/* LEARNING CAROUSEL */}
      <ParallaxSection className={`scroll-reveal reveal-right ${styles.section}`} style={{ position: 'relative' }}>
        <div className={styles.sectionInner}>
          <div className={styles.learningHeader}>
            <div>
              <p className={styles.sectionLabel}>Learning Centre</p>
              <h2 className={styles.sectionTitle}>Drive Smarter</h2>
            </div>
            <div className={styles.carouselArrows}>
              <button onClick={prevLearning} disabled={learningIndex === 0} aria-label="Previous articles" className={styles.arrowBtn}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextLearning} disabled={learningIndex >= maxLearningIndex} aria-label="Next articles" className={styles.arrowBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <p className={styles.sectionDesc}>Tips, guides, and insights to help you make smarter automotive decisions.</p>

          <div className={styles.learningGrid}>
            {learningPosts.slice(learningIndex, learningIndex + learningItemsToShow).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className={styles.learningCard}>
                <div className={styles.learningImageWrapper}>
                  <img src={post.image} alt={post.title} loading="lazy" className={styles.learningImage} />
                  <span className={styles.learningCategory}>{post.category}</span>
                </div>
                <div className={styles.learningContent}>
                  <h3 className={styles.learningTitle}>{post.title}</h3>
                  <div className={styles.learningMeta}>
                    <Clock size={12} />
                    <span>{post.readTime || '5 min read'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.sectionCta}>
            <Link to="/blog"><RippleButton variant="secondary">View All Articles <ArrowRight size={14} /></RippleButton></Link>
          </div>
        </div>
      </ParallaxSection>

      {/* EV TEASER */}
      <ParallaxSection className={`scroll-reveal reveal-left ${styles.evSection} ${styles.onDark}`}>
        <div className={styles.sectionInner}>
          <div className={styles.evGrid}>
            <div className={styles.evCopy}>
              <p className={styles.sectionLabel}>Electric Vehicles</p>
              <h2 className={styles.sectionTitle}>Go Electric. Go Green.</h2>
              <p className={styles.sectionDesc}>
                Premium EVs — Mercedes-Benz EQ series and more. Lower running costs, serious performance, and the latest tech, imported and ready for Nigerian roads.
              </p>
              <Link to="/ev"><RippleButton size="md" variant="white" magnetic>Explore Electric Vehicles <ArrowRight size={15} /></RippleButton></Link>
            </div>
            <div className={styles.evImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=900&q=80&fit=crop"
                alt="Mercedes-Benz electric vehicle"
                loading="lazy"
                className={styles.evImage}
              />
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* WALK-IN vs PRE-ORDER */}
      <ParallaxSection className={`scroll-reveal ${styles.section}`} style={{ position: 'relative' }}>
        <ForkRoad
          className="deco-positioned"
          size={132}
          style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)' }}
        />
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>How to Buy</p>
          <h2 className={styles.sectionTitle}>Two Ways to Drive</h2>
          <p className={styles.sectionDesc}>If you want to drive it today, we've got stock. If you want something specific, we'll find it. Simple as that.</p>

          <div className={`${styles.explainerGrid} stagger-fade-in`}>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>01</span>
              <h3>Walk-In — In Stock</h3>
              <p>Come see us at 123 Ajao Road, off Awolowo Way, Ikeja. Test drive whatever catches your eye, ask all the questions you want, and drive home the same day if it feels right. Paperwork included.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory?status=walk-in"><RippleButton size="sm" variant="secondary">Browse In-Stock Vehicles</RippleButton></Link>
              </div>
            </div>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>02</span>
              <h3>Pre-Order — Import &amp; Allocation</h3>
              <p>Can't find that exact spec on the lot? Tell us what you want and we'll track it down through our network — Japan, Dubai, Europe, wherever it takes. A small deposit secures your place in line.</p>
              <div className={styles.explainerCta}>
                <Link to="/pre-order"><RippleButton size="sm" variant="secondary">Learn About Pre-Ordering</RippleButton></Link>
              </div>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* CORPORATE vs INDIVIDUAL */}
      <ParallaxSection className={`scroll-reveal reveal-right ${styles.section}`} style={{ background: 'var(--paper-warm)', position: 'relative' }}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Who We Serve</p>
          <h2 className={styles.sectionTitle}>Tailored for You</h2>
          <p className={styles.sectionDesc}>One car or a whole fleet — we'll treat you the same: with respect, transparency, and straight talk.</p>

          <div className={`${styles.explainerGrid} stagger-fade-in`}>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>01</span>
              <h3>Individual Buyers</h3>
              <p>Browse what we've got, book a test drive, or just walk in. We'll walk you through everything — financing, documents, registration — so you can focus on the fun part.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory"><RippleButton size="sm" variant="secondary">Browse as Individual</RippleButton></Link>
              </div>
            </div>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>02</span>
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
      <section className={`scroll-reveal reveal-fade ${styles.section} ${styles.sectionCentered}`} style={{ position: 'relative' }}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Trusted By</p>
          <h2 className={styles.sectionTitle}>Our Clients</h2>
          <p className={styles.sectionDesc}>Organisations that trust us to keep their teams moving.</p>
          <div className={styles.trustStrip}>
            {clientLogos.map((client) => (
              client.logo ? (
                <span key={client.name} className={styles.trustLogo}>
                  <img src={client.logo} alt={client.name} loading="lazy" />
                </span>
              ) : (
                <span key={client.name} className={styles.trustItem}>{client.name}</span>
              )
            ))}
          </div>
          <p className={styles.trustLink}>
            <Link to="/about">See all clients and partners &rarr;</Link>
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonialsLoaded && displayTestimonials.length > 0 && (
        <ParallaxSection className={`scroll-reveal reveal-blur ${styles.section} ${styles.onDark} ${styles.sectionCentered}`} style={{ background: 'var(--navy-deep)' }}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionLabel}>Testimonials</p>
            <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
            <div className={`${styles.testimonialGrid} stagger-fade-in`}>
              {displayTestimonials.map(t => (
                <div key={t.id} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={styles.star} style={{ color: i < (t.rating || 5) ? 'var(--gold)' : 'rgba(255,255,255,0.15)' }}>★</span>
                    ))}
                  </div>
                  <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                  <div className={styles.testimonialAuthorRow}>
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className={styles.testimonialAvatar} loading="lazy" />
                    ) : (
                      <div className={styles.testimonialAvatarFallback}>{t.name.charAt(0)}</div>
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
      )}

      {/* CTA SECTION */}
      <ParallaxSection className={`scroll-reveal reveal-big ${styles.ctaSection}`} style={{ position: 'relative' }}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle} style={{ marginBottom: 'var(--space-1)' }}>Ready to Find Your Car?</h2>
          <UnderlineFlourish style={{ margin: '-6px auto var(--space-2)' }} />
          <p className={styles.ctaDesc}>Whether you know exactly what you want or just want to explore, we're here to help. No pressure, no games — just honest advice and real options.</p>
          <div className={styles.ctaCtas}>
            <Link to="/inventory"><RippleButton size="lg" variant="white" magnetic>Browse Inventory <ArrowRight size={16} /></RippleButton></Link>
            <Link to="/contact"><RippleButton size="lg" variant="ghostLight">Contact Us</RippleButton></Link>
          </div>
        </div>
      </ParallaxSection>
    </>
  )
}
