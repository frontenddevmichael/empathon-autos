import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardCounts } from '@/lib/queries'

export function AdminDashboard() {
  const [counts, setCounts] = useState<{ vehicles: number; leads: number; sold: number; auctions: number } | null>(null)

  useEffect(() => {
    getDashboardCounts().then(setCounts).catch(() => {})
  }, [])

  const items = counts ? [
    { label: 'Total Vehicles', value: counts.vehicles, to: '/admin/vehicles' },
    { label: 'Leads', value: counts.leads, to: '/admin/leads' },
    { label: 'Sold', value: counts.sold, to: '/admin/vehicles' },
    { label: 'Active Auctions', value: counts.auctions, to: '/admin/auctions' },
  ] : []

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>Dashboard</h2>
      {counts ? (
        <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {items.map(item => (
            <Link key={item.label} to={item.to} style={{
              padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', background: 'var(--surface)', display: 'block',
              transition: 'all var(--transition-fast)',
            }}>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--stone)', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{item.value}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--stone)' }}>Loading...</p>
      )}
    </div>
  )
}
