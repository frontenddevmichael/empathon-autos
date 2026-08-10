import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { activity } from '@/lib/activityLog'

const PAGE_SIZE = 30

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'test-drive', label: 'Test Drive' },
  { value: 'corporate-quote', label: 'Corporate Quote' },
  { value: 'pre-order', label: 'Pre-Order' },
  { value: 'contact', label: 'Contact' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const statusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  new: 'available', contacted: 'pre-order', 'in-progress': 'live', won: 'available', lost: 'draft',
}

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchLeads = () => {
    setLoading(true)
    ;(async () => {
      try {
        let q = supabase.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false })
        if (typeFilter) q = q.eq('type', typeFilter)
        if (statusFilter) q = q.eq('status', statusFilter)
        const { data, error: dbError } = await q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        if (dbError) console.error('[AdminLeads] Fetch error:', dbError.message)
        if (data) setLeads(data)
      } catch (err) {
        console.error('[AdminLeads] Unexpected error:', err)
      }
      setLoading(false)
    })()
  }

  useEffect(() => { fetchLeads() }, [page, typeFilter, statusFilter])

  const updateStatus = async (id: string, status: LeadStatus) => {
    const lead = leads.find(l => l.id === id)
    setSaving(true)
    await supabase.from('leads').update({ status }).eq('id', id)
    setSaving(false)
    setSelected(null)
    fetchLeads()
    activity.lead.statusChanged(id, lead?.status || 'unknown', status)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    await supabase.from('leads').delete().eq('id', deleteId)
    setSaving(false)
    activity.lead.deleted(deleteId)
    setDeleteId(null)
    fetchLeads()
  }

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>Leads</h2>

      <div style={{ display: 'flex', gap: 'var(--space-1-5)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 160 }}><Select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0) }} options={typeOptions} aria-label="Filter by type" /></div>
        <div style={{ minWidth: 160 }}><Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }} options={statusOptions} aria-label="Filter by status" /></div>
      </div>

      {loading ? <TableSkeleton rows={10} cols={7} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Type', 'Email', 'Phone', 'Status', 'Source', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr
                  key={l.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => setSelected(l)}
                  onKeyDown={e => { if (e.key === 'Enter') setSelected(l) }}
                  tabIndex={0}
                >
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{l.name}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', textTransform: 'capitalize' }}>{l.type}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}><a href={`mailto:${l.email}`} style={{ color: 'var(--navy)' }} onClick={e => e.stopPropagation()}>{l.email}</a></td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{l.phone}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }} onClick={e => e.stopPropagation()}>
                    <select
                      value={l.status}
                      onChange={e => updateStatus(l.id, e.target.value as LeadStatus)}
                      style={{ fontSize: 'inherit', padding: '2px 4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)' }}
                      disabled={saving}
                    >
                      {statusOptions.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{l.source_page}</td>
                  <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={7} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No leads match these filters.</td></tr>}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span style={{ fontSize: 'var(--text-sm)', padding: '4px var(--space-1)', color: 'var(--stone)' }}>Page {page + 1}</span>
            <Button variant="ghost" size="sm" disabled={leads.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={selected !== null} onClose={() => setSelected(null)} title="Lead Detail">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Name</p><p>{selected.name}</p></div>
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Type</p><p style={{ textTransform: 'capitalize' }}>{selected.type}</p></div>
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Email</p><p><a href={`mailto:${selected.email}`} style={{ color: 'var(--navy)' }}>{selected.email}</a></p></div>
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Phone</p><p>{selected.phone}</p></div>
              {selected.company && <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Company</p><p>{selected.company}</p></div>}
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Status</p><Badge variant={statusBadge[selected.status] || 'draft'} /></div>
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Source</p><p>{selected.source_page}</p></div>
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Date</p><p className="tabular-nums">{new Date(selected.created_at).toLocaleString()}</p></div>
            </div>
            {selected.message && (
              <div><p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>Message</p><p style={{ fontSize: 'var(--text-sm)' }}>{selected.message}</p></div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
              <Button variant="ghost" size="sm" onClick={() => { setDeleteId(selected.id); setSelected(null) }}>Delete</Button>
              <Button size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Lead">
        <p style={{ marginBottom: 'var(--space-2)' }}>Are you sure? This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} loading={saving} style={{ background: 'var(--error)', color: 'white' }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
