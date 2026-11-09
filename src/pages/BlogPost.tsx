import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import type { BlogPost as BlogPostType } from '@/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import styles from './BlogPost.module.css'

/* ── Minimal markdown → HTML (unchanged) ── */
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inline(html: string): string {
  return html
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function renderBody(markdown: string): string {
  const lines = markdown.split('\n')
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
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      closeList()
      const level = Math.min(heading[1].length + 1, 4)
      html += `<h${level}>${inline(escapeHtml(heading[2]))}</h${level}>`
      continue
    }
    const quote = line.match(/^>\s+(.*)$/)
    if (quote) {
      closeList()
      html += `<blockquote>${inline(escapeHtml(quote[1]))}</blockquote>`
      continue
    }
    const ul = line.match(/^[-*]\s+(.*)$/)
    if (ul) {
      if (!inUl) { closeList(); html += '<ul>'; inUl = true }
      html += `<li>${inline(escapeHtml(ul[1]))}</li>`
      continue
    }
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

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [related, setRelated] = useState<BlogPostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
        if (fetchErr || !data) { setError(true) }
        else {
          setPost(data)
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

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }, [])

  if (loading) {
    return (
      <Container className={styles.wrap}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonMeta} />
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </Container>
    )
  }

  if (error || !post) {
    return (
      <Section tone="paper" space="md">
        <EmptyState
          title="Post not found"
          message="This article may have been removed, or the link is wrong."
          action={<Link to="/blog"><Button size="sm" variant="secondary">Back to blog</Button></Link>}
        />
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

      <article className={styles.article}>
        <Container size="narrow" className={styles.head}>
          <Link to="/blog" className={styles.back}>Blog</Link>
          <p className={styles.meta}>
            {post.author && <span>{post.author}</span>}
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
            {post.body && <span>{readTime(post.body)}</span>}
          </p>
          <h1 className={styles.title}>{post.title}</h1>
        </Container>

        {post.cover_image && (
          <Container size="narrow">
            <div className={styles.cover}>
              <img src={post.cover_image} alt="" className={styles.coverImage} />
            </div>
          </Container>
        )}

        <Container size="narrow">
          {post.body && (
            <div className={styles.body} dangerouslySetInnerHTML={{ __html: renderBody(post.body) }} />
          )}

          <div className={styles.share}>
            <span className={styles.shareLabel}>Share</span>
            <button type="button" className={styles.shareLink} onClick={copyLink}>
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            <a className={styles.shareLink} href={`https://x.com/intent/post?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">X</a>
            <a className={styles.shareLink} href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className={styles.shareLink} href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>

          <div className={styles.byline}>
            <p className={styles.bylineName}>{post.author || 'Empathon Autos'}</p>
            <p className={styles.bylineRole}>Empathon Autos, Lagos</p>
          </div>
        </Container>

        {related.length > 0 && (
          <Container size="narrow" className={styles.related}>
            <h2 className={styles.relatedTitle}>Keep reading</h2>
            <div className={styles.relatedList}>
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className={styles.relatedLink}>
                  <span className={styles.relatedName}>{p.title}</span>
                  <span className={styles.relatedMeta}>
                    {p.published_at && formatDate(p.published_at)}
                    {p.body && ` · ${readTime(p.body)}`}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        )}
      </article>
    </>
  )
}
