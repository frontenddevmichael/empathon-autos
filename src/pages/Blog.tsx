import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import styles from './Blog.module.css'

function readTime(body: string): string {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
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
      <Section tone="paper" space="sm">
        <SectionHeader
          as="h1"
          size="lg"
          label="Blog"
          title="Latest articles"
          desc="Guides, market notes and buying advice from the Empathon Autos team."
        />
      </Section>

      <Section tone="paper" space="sm">
        {loading ? (
          <div className={styles.grid} aria-label="Loading articles">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No articles yet"
            message="We're writing our first stories — guides, market insights and buying advice. Tell us what you'd like to read about."
            action={<Link to="/contact"><Button size="sm" variant="secondary">Request a topic</Button></Link>}
          />
        ) : (
          <>
            {featured && (
              <Link to={`/blog/${featured.slug}`} className={`scroll-reveal ${styles.featured}`}>
                {featured.cover_image && (
                  <div className={styles.featuredMedia}>
                    <img src={featured.cover_image} alt="" className={styles.image} loading="eager" />
                  </div>
                )}
                <div className={styles.featuredBody}>
                  <p className={styles.meta}>
                    <span className={styles.latest}>Latest</span>
                    {featured.published_at && <span>{formatDate(featured.published_at)}</span>}
                    {featured.body && <span>{readTime(featured.body)}</span>}
                  </p>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  {featured.body && (
                    <p className={styles.featuredExcerpt}>
                      {featured.body.replace(/[#*`>\-[\]]/g, '').slice(0, 220)}…
                    </p>
                  )}
                  <span className={styles.readLink}>Read article</span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className={`scroll-reveal stagger-fade-in ${styles.grid}`}>
                {rest.map(p => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className={styles.card}>
                    {p.cover_image && (
                      <div className={styles.cardMedia}>
                        <img src={p.cover_image} alt="" className={styles.image} loading="lazy" />
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      <p className={styles.meta}>
                        {p.published_at && <span>{formatDate(p.published_at)}</span>}
                        {p.body && <span>{readTime(p.body)}</span>}
                      </p>
                      <h3 className={styles.cardTitle}>{p.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  )
}
