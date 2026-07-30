import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'

/** Inline star-rating picker (1–5) */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          style={{
            width: 28,
            height: 28,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            color: star <= value ? 'var(--navy)' : 'var(--border)',
            transition: 'color 150ms var(--ease-out), transform 150ms var(--ease-out)',
          }}
          onMouseEnter={e => { if (star <= value) e.currentTarget.style.transform = 'scale(1.2)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = '' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={24} height={24}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

/** Read-only stars display */
function StarsDisplay({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--navy)', whiteSpace: 'nowrap' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill={i < rating ? 'currentColor' : 'var(--border)'} width={14} height={14} style={{ display: 'inline', marginRight: 1 }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export function AdminTestimonials() {
  const { showToast } = useToast()
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState<Testimonial | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', company: '', rating: 5, quote: '', photo: '' })

  const fetch = () => {
    setLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
        if (error) { showToast(`Failed to load testimonials: ${error.message}`, 'error'); return }
        if (data) setItems(data)
      } catch (e) {
        showToast(`Error loading testimonials: ${e instanceof Error ? e.message : 'Unknown'}`, 'error')
      }
      setLoading(false)
    })()
  }

  useEffect(() => { fetch() }, [])

  const openNew = () => {
    setForm({ name: '', company: '', rating: 5, quote: '', photo: '' })
    setCreating(true); setEditItem(null)
  }

  const openEdit = (t: Testimonial) => {
    setForm({ name: t.name, company: t.company || '', rating: t.rating, quote: t.quote, photo: t.photo || '' })
    setEditItem(t); setCreating(false)
  }

  const close = () => { setEditItem(null); setCreating(false) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.quote) { showToast('Name and quote are required', 'error'); return }
    setSaving(true)
    const payload = {
      name: form.name,
      company: form.company || null,
      rating: form.rating,
      quote: form.quote,
      photo: form.photo || null,
    }
    if (editItem) {
      const { error } = await supabase.from('testimonials').update(payload).eq('id', editItem.id)
      if (error) { showToast(`Update failed: ${error.message}`, 'error'); setSaving(false); return }
      showToast('Testimonial updated')
    } else {
      const { error } = await supabase.from('testimonials').insert(payload)
      if (error) { showToast(`Create failed: ${error.message}`, 'error'); setSaving(false); return }
      showToast('Testimonial created')
    }
    setSaving(false); close(); fetch()
  }

  const togglePublish = async (t: Testimonial) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_published: !t.is_published })
      .eq('id', t.id)
    if (error) { showToast(`Failed to update status: ${error.message}`, 'error'); return }
    showToast(t.is_published ? 'Unpublished' : 'Published')
    fetch()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('testimonials').delete().eq('id', deleteId)
    if (error) { showToast(`Delete failed: ${error.message}`, 'error'); return }
    showToast('Testimonial deleted')
    setDeleteId(null); fetch()
  }

  const modalOpen = editItem !== null || creating

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h2>Testimonials</h2>
        <Button size="sm" onClick={openNew}>New Testimonial</Button>
      </div>

      {loading ? <TableSkeleton rows={6} cols={5} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Company', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No testimonials yet.</td></tr>
              )}
              {items.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', fontWeight: 500 }}>{t.name}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', color: 'var(--stone)' }}>{t.company || '—'}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>
                    <StarsDisplay rating={t.rating} />
                  </td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(t)}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </Button>
                  </td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', whiteSpace: 'nowrap' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={close} title={creating ? 'New Testimonial' : 'Edit Testimonial'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
          <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--stone)', marginBottom: 4 }}>Rating</label>
            <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <TextArea label="Quote *" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={4} required />
          <Input label="Photo URL" value={form.photo} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://..." />
          <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saving}>{editItem ? 'Save Changes' : 'Create Testimonial'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Testimonial">
        <p style={{ marginBottom: 'var(--space-2)' }}>Delete this testimonial permanently?</p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} style={{ background: 'var(--error)', color: 'white' }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
