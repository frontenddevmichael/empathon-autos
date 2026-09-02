import { useEffect, useState } from 'react'
import type { Lead } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/components/ui/FilterChip'
import { TableSkeleton } from '@/components/admin/AdminSkeleton'
import { useToast } from '@/context/ToastContext'
import { getLeads } from '@/lib/queries'

const PAGE_SIZE = 30

const typeOptions = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'test-drive', label: 'Test Drive' },
  { value: 'pre-order', label: 'Pre-Order' },
  { value: 'corporate-quote', label: 'Corporate' },
  { value: 'contact', label: 'Contact' },
]

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const statusBadge: Record<string, 'available' | 'sold' | 'pre-order' | 'draft' | 'live'> = {
  new: 'available', contacted: 'pre-order', 'in-progress': 'live', won: 'available', lost: 'draft',
}

export function AdminLeads() {
  const { showToast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    getLeads(page, PAGE_SIZE, { type: typeFilter, status: statusFilter })
      .then(setLeads)
      .catch(() => showToast('Failed to load leads', 'error'))
      .finally(() => setLoading(false))
  }, [page, typeFilter, statusFilter])

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>Leads</h2>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        <FilterChip label="Type" options={typeOptions} value={typeFilter} onChange={v => { setTypeFilter(v); setPage(0) }} />
        <FilterChip label="Status" options={statusOptions} value={statusFilter} onChange={v => { setStatusFilter(v); setPage(0) }} />
      </div>
      {loading ? <TableSkeleton rows={10} cols={6} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Type', 'Email', 'Phone', 'Status', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{l.name}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', textTransform: 'capitalize' }}>{l.type}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}><a href={`mailto:${l.email}`} style={{ color: 'var(--clay-deep)' }}>{l.email}</a></td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{l.phone}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}><Badge variant={statusBadge[l.status] || 'draft'} /></td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={6} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--text-secondary)' }}>No leads found.</td></tr>}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span style={{ fontSize: 'var(--text-sm)', padding: '4px var(--space-1)', color: 'var(--text-secondary)' }}>Page {page + 1}</span>
            <Button variant="ghost" size="sm" disabled={leads.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
