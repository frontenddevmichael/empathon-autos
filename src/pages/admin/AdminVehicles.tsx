import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { Vehicle, VehicleMedia } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/admin/AdminSkeleton'
import { useToast } from '@/context/ToastContext'
import { STATUS_TO_BADGE } from '@/lib/constants'
import { getAllVehicles, deleteVehicle } from '@/lib/queries'

const PAGE_SIZE = 20

export function AdminVehicles() {
  const { showToast } = useToast()
  const [vehicles, setVehicles] = useState<(Vehicle & { media?: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAllVehicles(page, PAGE_SIZE)
      .then(setVehicles)
      .catch(() => showToast('Failed to load vehicles', 'error'))
      .finally(() => setLoading(false))
  }, [page])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await deleteVehicle(deleteTarget)
    if (error) { showToast('Failed to delete vehicle', 'error'); setDeleteTarget(null); return }
    setVehicles(prev => prev.filter(v => v.id !== deleteTarget))
    showToast('Vehicle deleted')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <h2 style={{ margin: 0 }}>Vehicles</h2>
        <Link to="/admin/vehicles/new"><Button size="sm"><Plus size={14} /> Add Vehicle</Button></Link>
      </div>
      {loading ? <TableSkeleton rows={8} cols={6} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Vehicle', 'Year', 'Price', 'Status', 'Condition', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}><Link to={`/admin/vehicles/${v.id}/edit`} style={{ color: 'var(--clay-deep)', fontWeight: 500 }}>{v.make} {v.model}{v.trim ? ` ${v.trim}` : ''}</Link></td>
                  <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>{v.year}</td>
                  <td className="tabular-nums" style={{ padding: 'var(--space-1) var(--space-2)' }}>{v.price > 0 ? `₦${(v.price / 1_000_000).toFixed(1)}M` : 'N/A'}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}><Badge variant={STATUS_TO_BADGE[v.status] || 'draft'} /></td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', textTransform: 'capitalize' }}>{v.condition}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <Link to={`/admin/vehicles/${v.id}/edit`} aria-label="Edit vehicle"><Button size="sm" variant="ghost"><Edit size={14} /></Button></Link>
                      <Button size="sm" variant="ghost" aria-label="Delete vehicle" onClick={() => setDeleteTarget(v.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && <tr><td colSpan={6} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No vehicles yet.</td></tr>}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span style={{ fontSize: 'var(--text-sm)', padding: '4px var(--space-1)', color: 'var(--stone)' }}>Page {page + 1}</span>
            <Button variant="ghost" size="sm" disabled={vehicles.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete Vehicle">
        <p style={{ marginBottom: 'var(--space-2)', color: 'var(--stone)' }}>Are you sure? This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button style={{ background: 'var(--error)', color: 'white', border: 'none' }} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
