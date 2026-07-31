import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { Section } from '@/components/PageLayout'
import { HeroSection } from '@/components/HeroSection'

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
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1779025313068-b4a11d86bf0d?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
        ]}
        label="Blog"
        title="Latest Articles"
        subtitle="Insights, tips, and stories from the Empathon Autos team."
        deco="dots"
      />
      <Section style={{ position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '4/3', background: 'var(--border)', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p style={{ color: 'var(--stone)' }}>No articles yet. Check back soon.</p>
        ) : (
          <div className="scroll-reveal stagger-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-3)' }}>
            {posts.map(p => (
              <Link key={p.id} to={`/blog/${p.slug}`} style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', transition: 'border-color var(--transition-fast), transform var(--transition-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
              >
                {p.cover_image && (
                  <div style={{ width: 140, minWidth: 140, overflow: 'hidden', background: 'var(--paper-warm)' }}>
                    <img src={p.cover_image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, padding: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>{p.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                    {p.author && <span>{p.author}</span>}
                    {p.published_at && <span className="tabular-nums">{new Date(p.published_at).toLocaleDateString()}</span>}
                  </div>
                  {p.body && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', marginTop: 'var(--space-1)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{p.body}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  )
}