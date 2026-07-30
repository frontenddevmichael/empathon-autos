import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { Section } from '@/components/PageLayout'

/** Minimal markdown → HTML for blog bodies. Handles bold, italic, links, headings, and lists. */
function renderBody(body: string): string {
  const lines = body.split('\n')
  let html = ''
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Empty line = paragraph break
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false }
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) { if (inList) { html += '</ul>'; inList = false } html += `<h4>${inline(trimmed.slice(4))}</h4>`; continue }
    if (trimmed.startsWith('## ')) { if (inList) { html += '</ul>'; inList = false } html += `<h3>${inline(trimmed.slice(3))}</h3>`; continue }
    if (trimmed.startsWith('# ')) { if (inList) { html += '</ul>'; inList = false } html += `<h2>${inline(trimmed.slice(2))}</h2>`; continue }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true }
      html += `<li>${inline(trimmed.slice(2))}</li>`
      continue
    }

    // Close list if we hit non-list content
    if (inList) { html += '</ul>'; inList = false }

    // Normal paragraph
    html += `<p>${inline(trimmed)}</p>`
  }
  if (inList) html += '</ul>'
  return html
}

/** Apply inline markdown: **bold**, *italic*, [links](url) */
function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--navy);text-decoration:underline">$1</a>')
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
        if (fetchErr || !data) { setError(true) }
        else { setPost(data) }
      } catch {
        setError(true)
      }
      setLoading(false)
    })()
  }, [slug])

  if (loading) {
    return <Section><div style={{ height: 24, width: '60%', background: 'var(--border)', borderRadius: 8, marginBottom: 8 }} /><div style={{ height: 400, background: 'var(--border)', borderRadius: 8 }} /></Section>
  }

  if (error || !post) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h2>Post not found</h2>
          <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-2)' }}>This article may have been removed or the link is incorrect.</p>
          <Link to="/blog" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Back to blog</Link>
        </div>
      </Section>
    )
  }

  const blogTitle = `${post.title} | Empathon Autos`
  const blogDesc = post.body?.slice(0, 200).replace(/[#*\[\]]/g, '') || 'Blog article'
  const blogImg = post.cover_image || '/og-image.jpg'

  return (
    <Section>
      <Helmet>
        <title>{blogTitle}</title>
        <meta name="description" content={blogDesc} />
        <meta property="og:title" content={blogTitle} />
        <meta property="og:description" content={blogDesc} />
        <meta property="og:image" content={blogImg} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.emphatonautos.com/blog/${post.slug}`} />
        {post.author && <meta name="author" content={post.author} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <link rel="canonical" href={`https://www.emphatonautos.com/blog/${post.slug}`} />
      </Helmet>
      <Link to="/blog" style={{ fontSize: 'var(--text-sm)', color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-1)' }}>&larr; Back to Blog</Link>
      <h1 style={{ marginBottom: 'var(--space-0-5)' }}>{post.title}</h1>
      <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--stone)', marginBottom: 'var(--space-3)' }}>
        {post.author && <span>{post.author}</span>}
        {post.published_at && <span className="tabular-nums">{new Date(post.published_at).toLocaleDateString()}</span>}
      </div>
      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-3)' }} />
      )}
      <div
        style={{ maxWidth: 720, lineHeight: 1.8, fontSize: 'var(--text-base)' }}
        dangerouslySetInnerHTML={{ __html: renderBody(post.body) }}
      />
    </Section>
  )
}
