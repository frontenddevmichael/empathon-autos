import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
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
  { id: 'l1', title: 'How to Choose the Right Car for Lagos Roads', category: 'Buying Guide', image: '/heroimg.jpg', slug: 'choosing-right-car-lagos', readTime: '5 min read' },
  { id: 'l2', title: 'Pre-Owned vs Brand New: What Makes Sense in Nigeria?', category: 'Market Insights', image: '/heroimg2.jpg', slug: 'pre-owned-vs-brand-new', readTime: '7 min read' },
  { id: 'l3', title: 'Understanding Import Duties and Clearing Costs', category: 'Import Guide', image: '/heroimg3.jpg', slug: 'import-duties-clearing', readTime: '6 min read' },
  { id: 'l4', title: 'Electric Vehicles in Nigeria: Are They Worth It?', category: 'EV Guide', image: '/heroimg4.jpg', slug: 'evs-in-nigeria', readTime: '8 min read' },
  { id: 'l5', title: 'Maintaining Your Car in Tropical Climate', category: 'Maintenance Tips', image: '/heroimg5.jpg', slug: 'maintaining-car-tropical', readTime: '4 min read' },
  { id: 'l6', title: 'Financing Options for Your Next Vehicle', category: 'Finance', image: '/heroimg.jpg', slug: 'financing-options', readTime: '5 min read' },
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
  // One photograph, chosen for its empty lower-left quadrant and front three-quarter crop.
  // The CMS value wins over the fallback when the client has set one.
  const heroImage = cmsImage || '/heroimg3.jpg'

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
            Premium vehicles from four continents — inspected, explained and delivered.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/inventory"><Button size="lg" variant="white">Browse Inventory</Button></Link>
            <Link to="/contact"><Button size="lg" variant="ghostLight">Book a Test Drive</Button></Link>
          </div>
        </div>
      </section>

      {/* STATS BAND — quiet editorial moment */}
      <section className={styles.statsBand}>
        <div className={styles.statsGrid}>
          {parseJsonContent(homeContent, 'stats', [
            { label: 'Vehicles Imported', target: 500, suffix: '+' },
            { label: 'Happy Clients', target: 300, suffix: '+' },
            { label: 'Years in Business', target: 6, suffix: '' },
            { label: 'Countries Sourced', target: 12, suffix: '' },
          ]).map((stat) => (
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
      <section className={`scroll-reveal ${styles.section} ${styles.sectionWarm}`}>
        <div className={styles.sectionInner}>
          <SectionHeader
            label="Collection"
            title="Featured Vehicles"
            desc="Handpicked and ready to go. Every car here is sourced from trusted partners across North America, Europe, the Middle East, and the Far East — then prepped and waiting for you in Lagos."
          />

          {loading ? (
            <div className={styles.featuredGrid}>
              {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : fetchError ? (
            <div className={styles.errorState}>
              <p className={styles.errorText}>{fetchError}</p>
              <Button variant="secondary" size="sm" onClick={loadVehicles}>Try Again</Button>
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div className={`${styles.featuredGrid} stagger-fade-in`}>
                {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
              <div className={styles.sectionCta}>
                <Link to="/inventory"><Button variant="secondary">View All Vehicles <ArrowRight size={14} /></Button></Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* LEARNING CAROUSEL */}
      <section className={`scroll-reveal ${styles.section}`}>
        <div className={styles.sectionInner}>
          <div className={styles.learningHeader}>
            <SectionHeader
              label="Learning Centre"
              title="Drive Smarter"
              desc="Tips, guides, and insights to help you make smarter automotive decisions."
              className={styles.learningHeaderText}
            />
            <div className={styles.carouselArrows}>
              <button onClick={prevLearning} disabled={learningIndex === 0} aria-label="Previous articles" className={styles.arrowBtn}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextLearning} disabled={learningIndex >= maxLearningIndex} aria-label="Next articles" className={styles.arrowBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

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
            <Link to="/blog"><Button variant="secondary">View All Articles <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </section>

      {/* EV TEASER */}
      <section className={`scroll-reveal ${styles.evSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.evGrid}>
            <div className={styles.evCopy}>
              <SectionHeader
                label="Electric Vehicles"
                title="Go Electric. Go Green."
                desc="Premium EVs — Mercedes-Benz EQ series and more. Lower running costs, serious performance, and the latest tech, imported and ready for Nigerian roads."
                dark
              />
              <Link to="/ev"><Button size="md" variant="white">Explore Electric Vehicles <ArrowRight size={15} /></Button></Link>
            </div>
            <div className={styles.evImageWrap}>
              <img
                src="/heroimg5.jpg"
                alt="Premium electric vehicle"
                loading="lazy"
                className={styles.evImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* WALK-IN vs PRE-ORDER */}
      <section className={`scroll-reveal ${styles.section}`}>
        <div className={styles.sectionInner}>
          <SectionHeader
            label="How to Buy"
            title="Two Ways to Drive"
            desc="If you want to drive it today, we've got stock. If you want something specific, we'll find it. Simple as that."
          />

          <div className={`${styles.explainerGrid} stagger-fade-in`}>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>01</span>
              <h3>Walk-In — In Stock</h3>
              <p>Come see us at 123 Ajao Road, off Awolowo Way, Ikeja. Test drive whatever catches your eye, ask all the questions you want, and drive home the same day if it feels right. Paperwork included.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory?status=walk-in"><Button size="sm" variant="secondary">Browse In-Stock Vehicles</Button></Link>
              </div>
            </div>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>02</span>
              <h3>Pre-Order — Import &amp; Allocation</h3>
              <p>Can't find that exact spec on the lot? Tell us what you want and we'll track it down through our network — Japan, Dubai, Europe, wherever it takes. A small deposit secures your place in line.</p>
              <div className={styles.explainerCta}>
                <Link to="/pre-order"><Button size="sm" variant="secondary">Learn About Pre-Ordering</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORPORATE vs INDIVIDUAL */}
      <section className={`scroll-reveal ${styles.section} ${styles.sectionWarm}`}>
        <div className={styles.sectionInner}>
          <SectionHeader
            label="Who We Serve"
            title="Tailored for You"
            desc="One car or a whole fleet — we'll treat you the same: with respect, transparency, and straight talk."
          />

          <div className={`${styles.explainerGrid} stagger-fade-in`}>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>01</span>
              <h3>Individual Buyers</h3>
              <p>Browse what we've got, book a test drive, or just walk in. We'll walk you through everything — financing, documents, registration — so you can focus on the fun part.</p>
              <div className={styles.explainerCta}>
                <Link to="/inventory"><Button size="sm" variant="secondary">Browse as Individual</Button></Link>
              </div>
            </div>
            <div className={styles.explainerCard}>
              <span className={styles.explainerIndex}>02</span>
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
      <Section className="scroll-reveal" space="md">
          <SectionHeader
            label="Trusted By"
            title="Our Clients"
            desc="Organisations that trust us to keep their teams moving."
            align="center"
          />
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
      </Section>

      {/* TESTIMONIALS */}
      {testimonialsLoaded && displayTestimonials.length > 0 && (
        <section className={`scroll-reveal ${styles.section} ${styles.sectionDeep}`}>
          <div className={styles.sectionInner}>
            <SectionHeader label="Testimonials" title="What Our Clients Say" align="center" dark />
            <div className={`${styles.testimonialGrid} stagger-fade-in`}>
              {displayTestimonials.map(t => (
                <div key={t.id} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={styles.star} style={{ color: i < (t.rating || 5) ? 'var(--text-inverse-secondary)' : 'var(--text-inverse-faint)' }}>★</span>
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
        </section>
      )}

      {/* CTA SECTION */}
      <section className={`scroll-reveal ${styles.ctaSection}`}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Find Your Car?</h2>
          <p className={styles.ctaDesc}>Whether you know exactly what you want or just want to explore, we're here to help. No pressure, no games — just honest advice and real options.</p>
          <div className={styles.ctaCtas}>
            <Link to="/inventory"><Button size="lg" variant="white">Browse Inventory <ArrowRight size={16} /></Button></Link>
            <Link to="/contact"><Button size="lg" variant="ghostLight">Contact Us</Button></Link>
          </div>
        </div>
      </section>
    </>
  )
}
