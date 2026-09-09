import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { RippleButton } from '@/components/RippleButton'
import styles from './Blog.module.css'

function readTime(body: string): string {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await supabase.from('blog_posts')
          .select('*')
          .not('published_at', 'is', null)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })
        if (data) setPosts(data)
      } catch { /* ignore */ }
      setLoading(false)
    })()
  }, [])

  const [featured, ...rest] = posts

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <img
          src="/heroimg3.jpg"
          alt=""
          className={styles.heroImage}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>
            <span className={styles.heroLabelLine} />
            Blog
          </p>
          <h1 className={styles.heroTitle}>Latest Articles</h1>
          <p className={styles.heroSubtitle}>
            Insights, tips, and stories from the Empathon Autos team.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          {loading ? (
            <div className={styles.skeletonGrid} aria-label="Loading articles">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImg} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} style={{ width: '40%' }} />
                    <div className={styles.skeletonLine} style={{ width: '85%' }} />
                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="scroll-reveal">
              <EmptyState
                art="book"
                title="No articles yet"
                message="We're writing our first stories — guides, market insights, and buying advice. In the meantime, tell us what you'd like to read about."
                action={
                  <Link to="/contact">
                    <RippleButton size="sm" variant="secondary">Request a Topic</RippleButton>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              {/* Featured article */}
              {featured && (
                <Link to={`/blog/${featured.slug}`} className={`scroll-reveal ${styles.featuredLink}`}>
                  {featured.cover_image && (
                    <div className={styles.featuredMedia}>
                      <img src={featured.cover_image} alt={featured.title} className={styles.featuredImg} loading="eager" />
                    </div>
                  )}
                  <div className={styles.featuredBody}>
                    <div className={styles.featuredMeta}>
                      <span className={styles.badge}>Latest</span>
                      {featured.author && <span>{featured.author}</span>}
                      {featured.published_at && (
                        <span className="tabular-nums">{formatDate(featured.published_at)}</span>
                      )}
                      {featured.body && <span>{readTime(featured.body)}</span>}
                    </div>
                    <h2 className={styles.featuredTitle}>{featured.title}</h2>
                    {featured.body && <p className={styles.featuredExcerpt}>{featured.body.replace(/[#*`>\-\[\]]/g, '').slice(0, 220)}…</p>}
                    <span className={styles.featuredCta}>Read article <ArrowIcon /></span>
                  </div>
                </Link>
              )}

              {/* Article grid */}
              {rest.length > 0 && (
                <div className={`scroll-reveal reveal-right stagger-fade-in ${styles.grid}`}>
                  {rest.map(p => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className={styles.card}>
                      {p.cover_image && (
                        <div className={styles.cardMedia}>
                          <img src={p.cover_image} alt={p.title} className={styles.cardImg} loading="lazy" />
                        </div>
                      )}
                      <div className={styles.cardBody}>
                        <div className={styles.cardMeta}>
                          {p.author && <span>{p.author}</span>}
                          {p.published_at && <span className="tabular-nums">{formatDate(p.published_at)}</span>}
                          {p.body && <span>{readTime(p.body)}</span>}
                        </div>
                        <h3 className={styles.cardTitle}>{p.title}</h3>
                        {p.body && <p className={styles.cardExcerpt}>{p.body.replace(/[#*`>\-\[\]]/g, '').slice(0, 120)}…</p>}
                        <span className={styles.cardArrow}>Read <ArrowIcon /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className={`scroll-reveal reveal-big ${styles.ctaStrip}`}>
                <h2>Have a topic in mind?</h2>
                <p>Tell us what you'd like us to cover — buying guides, import insights, EV deep-dives. We read every request.</p>
                <Link to="/contact">
                  <RippleButton variant="white">Request a Topic</RippleButton>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
