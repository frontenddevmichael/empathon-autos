import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { Section } from '@/components/PageLayout'
import { EmptyState } from '@/components/ui/EmptyState'
import { RippleButton } from '@/components/RippleButton'
import styles from './BlogPost.module.css'

/** Escape HTML so admin-authored markdown can never inject markup. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Inline markdown: **bold**, *italic*, `code`, [text](url) — applied after escaping. */
function inline(text: string): string {
  const code = /`([^`]+)`/g
  const bold = /\*\*(.+?)\*\*/g
  const italic = /\*(.+?)\*/g
  const link = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  let out = text
  out = out.replace(code, '<code>$1</code>')
  out = out.replace(bold, '<strong>$1</strong>')
  out = out.replace(italic, '<em>$1</em>')
  out = out.replace(link, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return out
}

/** Block markdown → HTML. Supports headings, paragraphs, lists (ordered +
 *  unordered), blockquotes, hr, and inline formatting. */
function renderBody(body: string): string {
  const lines = body.split('\n')
  let html = ''
  let inUl = false
  let inOl = false

  const closeList = () => {
    if (inUl) { html += '</ul>'; inUl = false }
    if (inOl) { html += '</ol>'; inOl = false }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { closeList(); continue }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { closeList(); html += '<hr />'; continue }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      closeList()
      const level = h[1].length + 1 // # → h2, ## → h3, ### → h4
      html += `<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeList()
      html += `<blockquote>${inline(escapeHtml(line.slice(2)))}</blockquote>`
      continue
    }

    // Unordered list
    const ul = line.match(/^[-*]\s+(.*)$/)
    if (ul) {
      if (!inUl) { closeList(); html += '<ul>'; inUl = true }
      html += `<li>${inline(escapeHtml(ul[1]))}</li>`
      continue
    }

    // Ordered list
    const ol = line.match(/^\d+\.\s+(.*)$/)
    if (ol) {
      if (!inOl) { closeList(); html += '<ol>'; inOl = true }
      html += `<li>${inline(escapeHtml(ol[1]))}</li>`
      continue
    }

    closeList()
    html += `<p>${inline(escapeHtml(line))}</p>`
  }
  closeList()
  return html
}

function readTime(body: string): string {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
        if (fetchErr || !data) { setError(true) }
        else {
          setPost(data)
          // Related — latest published posts excluding the current one
          const { data: others } = await supabase.from('blog_posts')
            .select('*')
            .not('published_at', 'is', null)
            .lte('published_at', new Date().toISOString())
            .neq('id', data.id)
            .order('published_at', { ascending: false })
            .limit(2)
          if (others) setRelated(others)
        }
      } catch {
        setError(true)
      }
      setLoading(false)
    })()
  }, [slug])

  // Reading progress — fills the gold bar as the article scrolls through view
  useEffect(() => {
    let frame: number
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = document.getElementById('blog-article')
        if (!el) return
        const rect = el.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        if (total <= 0) { setProgress(100); return }
        const p = Math.min(100, Math.max(0, (-rect.top / total) * 100))
        setProgress(p)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [post])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }, [])

  if (loading) {
    return (
      <Section>
        <div className={styles.skeleton}>
          <div style={{ height: 14, width: 120, background: 'var(--border)', borderRadius: 6, marginBottom: 24 }} />
          <div style={{ height: 40, width: '80%', background: 'var(--border)', borderRadius: 8, marginBottom: 16 }} />
          <div style={{ aspectRatio: '16/9', background: 'var(--border)', borderRadius: 'var(--radius-xl)', marginBottom: 24 }} />
          <div style={{ height: 16, background: 'var(--border)', borderRadius: 6, marginBottom: 10 }} />
          <div style={{ height: 16, background: 'var(--border)', borderRadius: 6, marginBottom: 10 }} />
          <div style={{ height: 16, width: '70%', background: 'var(--border)', borderRadius: 6 }} />
        </div>
      </Section>
    )
  }

  if (error || !post) {
    return (
      <Section>
        <div className="scroll-reveal" style={{ maxWidth: 640, margin: '0 auto' }}>
          <EmptyState
            art="book"
            title="Post not found"
            message="This article may have been removed or the link is incorrect."
            action={
              <Link to="/blog">
                <RippleButton size="sm" variant="secondary">Back to Blog</RippleButton>
              </Link>
            }
          />
        </div>
      </Section>
    )
  }

  const blogTitle = `${post.title} | Empathon Autos`
  const blogDesc = post.body?.slice(0, 200).replace(/[#*`>[\]-]/g, '') || 'Blog article'
  const blogImg = post.cover_image || '/og-image.jpg'
  const url = `https://www.emphatonautos.com/blog/${post.slug}`
  const shareText = encodeURIComponent(post.title)
  const shareUrl = encodeURIComponent(url)

  return (
    <>
      <Helmet>
        <title>{blogTitle}</title>
        <meta name="description" content={blogDesc} />
        <meta property="og:title" content={blogTitle} />
        <meta property="og:description" content={blogDesc} />
        <meta property="og:image" content={blogImg} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        {post.author && <meta name="author" content={post.author} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <link rel="canonical" href={url} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            author: { '@type': 'Person', name: post.author || 'Empathon Autos' },
            datePublished: post.published_at || undefined,
            image: blogImg,
            publisher: { '@type': 'Organization', name: 'Empathon Autos' },
            mainEntityOfPage: url,
          })}
        </script>
      </Helmet>

      <div className={styles.progress} style={{ width: `${progress}%` }} aria-hidden="true" />

      <Section>
        <article id="blog-article" className={styles.article}>
          <Link to="/blog" className={styles.backLink}><BackIcon /> Back to Blog</Link>

          <div className={styles.articleMeta}>
            <span>Article</span>
            <span className={styles.metaDot} />
            {post.author && <span>{post.author}</span>}
            {post.published_at && (
              <>
                <span className={styles.metaDot} />
                <span className="tabular-nums">{formatDate(post.published_at)}</span>
              </>
            )}
            {post.body && (
              <>
                <span className={styles.metaDot} />
                <span>{readTime(post.body)}</span>
              </>
            )}
          </div>

          <h1 className={styles.articleTitle}>{post.title}</h1>

          {post.cover_image && (
            <div className={styles.cover}>
              <img src={post.cover_image} alt={post.title} />
            </div>
          )}

          {post.body && (
            <div className={styles.body} dangerouslySetInnerHTML={{ __html: renderBody(post.body) }} />
          )}

          <div className={styles.shareRow}>
            <span className={styles.shareLabel}>Share</span>
            <button type="button" className={styles.shareBtn} onClick={copyLink} aria-label="Copy link to article" title="Copy link">
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 10l4-4M5 11l-1.5 1.5a2.12 2.12 0 0 1-3-3L4 6a2.12 2.12 0 0 1 3 0M11 5l1.5-1.5a2.12 2.12 0 0 1 3 3L12 10a2.12 2.12 0 0 1-3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <a
              className={styles.shareBtn}
              href={`https://x.com/intent/post?text=${shareText}&url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.9 1.2h3.7l-8.1 9.3L24 22.8h-7.5l-5.9-7.7-6.7 7.7H.2l8.7-9.9L0 1.2h7.7l5.3 7 6-7z" />
              </svg>
            </a>
            <a
              className={styles.shareBtn}
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z" />
              </svg>
            </a>
            <a
              className={styles.shareBtn}
              href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
              target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" title="Share on WhatsApp"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" />
              </svg>
            </a>
          </div>

          <div className={styles.authorCard}>
            <div className={styles.authorAvatar} aria-hidden="true">
              {(post.author || 'E').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={styles.authorName}>{post.author || 'Empathon Autos'}</p>
              <p className={styles.authorRole}>Trust. Fit. Drive. — Empathon Autos, Lagos</p>
            </div>
          </div>

          {related.length > 0 && (
            <div className={`scroll-reveal ${styles.related}`}>
              <h3 className={styles.relatedTitle}>Keep reading</h3>
              <div className={styles.relatedGrid}>
                {related.map(p => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className={styles.relatedCard}>
                    {p.cover_image && (
                      <div className={styles.relatedMedia}>
                        <img src={p.cover_image} alt={p.title} loading="lazy" />
                      </div>
                    )}
                    <div className={styles.relatedBody}>
                      <p className={styles.relatedTitle2}>{p.title}</p>
                      <div className={styles.relatedMeta}>
                        {p.published_at && <span className="tabular-nums">{formatDate(p.published_at)}</span>}
                        {p.body && <span> · {readTime(p.body)}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </Section>
    </>
  )
}
