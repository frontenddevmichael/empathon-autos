import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { Section } from '@/components/PageLayout'
import { Squiggle, HandDots } from '@/components/DecoSvgs'
import { SplitHeading } from '@/components/SplitHeading'
import { ParallaxSection } from '@/components/ParallaxSection'

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

  return (
    <ParallaxSection>
      <Section style={{ position: 'relative' }}>
        <HandDots className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.25 }} />
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--navy)', marginBottom: 'var(--space-0-5)' }}>Blog</p>
        <SplitHeading as="h2" style={{ marginBottom: 'var(--space-1)' }}>Latest Articles</SplitHeading>
        <div className="section-divider" />
        <Squiggle style={{ marginBottom: 'var(--space-2)' }} />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 80, background: 'var(--border)', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p style={{ color: 'var(--stone)' }}>No articles yet. Check back soon.</p>
      ) : (
        <div className="stagger-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {posts.map(p => (
            <Link key={p.id} to={`/blog/${p.slug}`} style={{ display: 'block', padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', transition: 'border-color var(--transition-fast), transform var(--transition-fast)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
            >
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>{p.title}</h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                {p.author && <span>{p.author}</span>}
                {p.published_at && <span className="tabular-nums">{new Date(p.published_at).toLocaleDateString()}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Section>
    </ParallaxSection>
  )
}