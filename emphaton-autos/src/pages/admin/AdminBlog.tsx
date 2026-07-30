import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'

export function AdminBlog() {
  const { showToast } = useToast()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editPost, setEditPost] = useState<BlogPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', body: '', author: '', cover_image: '' })

  const fetch = () => {
    setLoading(true)
    ;(async () => {
      try {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
        if (data) setPosts(data)
      } catch { /* ignore */ }
      setLoading(false)
    })()
  }

  useEffect(() => { fetch() }, [])

  const openNew = () => {
    setForm({ title: '', slug: '', body: '', author: '', cover_image: '' })
    setCreating(true); setEditPost(null)
  }

  const openEdit = (p: BlogPost) => {
    setForm({ title: p.title, slug: p.slug, body: p.body, author: p.author, cover_image: p.cover_image || '' })
    setEditPost(p); setCreating(false)
  }

  const close = () => { setEditPost(null); setCreating(false) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) { showToast('Title and slug required', 'error'); return }
    setSaving(true)
    const payload = {
      title: form.title, slug: form.slug, body: form.body, author: form.author,
      cover_image: form.cover_image || null,
      published_at: editPost?.published_at || (creating ? null : undefined),
    }
    if (editPost) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editPost.id)
      if (error) { showToast('Update failed', 'error'); setSaving(false); return }
      showToast('Post updated')
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload)
      if (error) { showToast('Create failed', 'error'); setSaving(false); return }
      showToast('Post created')
    }
    setSaving(false); close(); fetch()
  }

  const togglePublish = async (post: BlogPost) => {
    const isPublished = !!post.published_at
    await supabase.from('blog_posts').update({
      published_at: isPublished ? null : new Date().toISOString(),
    }).eq('id', post.id)
    fetch()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('blog_posts').delete().eq('id', deleteId)
    setDeleteId(null); fetch()
  }

  const modalOpen = editPost !== null || creating

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h2>Blog Posts</h2>
        <Button size="sm" onClick={openNew}>New Post</Button>
      </div>

      {loading ? <TableSkeleton rows={8} cols={5} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Title', 'Slug', 'Author', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No posts yet.</td></tr>
              )}
              {posts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', fontWeight: 500 }}>{p.title}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{p.slug}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{p.author || '—'}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(p)}>
                      {p.published_at ? 'Published' : 'Draft'}
                    </Button>
                  </td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', whiteSpace: 'nowrap' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={close} title={creating ? 'New Post' : 'Edit Post'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
          <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <Input label="Slug *" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="e.g. how-to-import-a-car" disabled={!!editPost} />
          <Input label="Author" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          <Input label="Cover Image URL" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." />
          <TextArea label="Body (Markdown)" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={12} />
          <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saving}>{editPost ? 'Save Changes' : 'Create Post'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Post">
        <p style={{ marginBottom: 'var(--space-2)' }}>Delete this post permanently?</p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} style={{ background: 'var(--error)', color: 'white' }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}