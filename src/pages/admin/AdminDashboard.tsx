import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Car, Users, Gavel, FileText, TrendingUp, ArrowRight } from 'lucide-react'

interface DashboardStats {
  totalVehicles: number
  inStock: number
  preOrder: number
  totalLeads: number
  newLeads: number
  activeLots: number
  blogPosts: number
  totalRevenue: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0, inStock: 0, preOrder: 0,
    totalLeads: 0, newLeads: 0, activeLots: 0,
    blogPosts: 0, totalRevenue: 0,
  })
  const [recentLeads, setRecentLeads] = useState<{ id: string; name: string; email: string; type: string; status: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [vRes, lRes, lotRes, blogRes] = await Promise.all([
          supabase.from('vehicles').select('id, price, status'),
          supabase.from('leads').select('id, name, email, type, status, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('lots').select('id').in('status', ['open', 'closing']),
          supabase.from('blog_posts').select('id', { count: 'exact' }),
        ])

        if (!mounted) return

        const vehicles = vRes.data || []
        const leads = lRes.data || []

        setStats({
          totalVehicles: vehicles.length,
          inStock: vehicles.filter(v => v.status === 'walk-in' || v.status === 'published').length,
          preOrder: vehicles.filter(v => v.status === 'pre-order').length,
          totalLeads: leads.length,
          newLeads: leads.filter(l => l.status === 'new').length,
          activeLots: lotRes.data?.length || 0,
          blogPosts: blogRes.count || 0,
          totalRevenue: vehicles.filter(v => v.status === 'sold').reduce((sum, v) => sum + (v.price || 0), 0),
        })
        setRecentLeads(leads as typeof recentLeads)
        if (vRes.error) console.error('[AdminDashboard] Vehicles query error:', vRes.error.message)
        if (lRes.error) console.error('[AdminDashboard] Leads query error:', lRes.error.message)
        if (lotRes.error) console.error('[AdminDashboard] Lots query error:', lotRes.error.message)
        if (blogRes.error) console.error('[AdminDashboard] Blog query error:', blogRes.error.message)
      } catch (err) {
        console.error('[AdminDashboard] Unexpected error:', err)
      }
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const statCards = [
    { icon: Car, label: 'Total Vehicles', value: stats.totalVehicles, sub: `${stats.inStock} in stock, ${stats.preOrder} pre-order`, color: 'var(--navy)', bg: 'rgba(12,30,58,0.06)' },
    { icon: TrendingUp, label: 'In Stock', value: stats.inStock, sub: `${((stats.inStock / (stats.totalVehicles || 1)) * 100).toFixed(0)}% of fleet`, color: 'var(--success)', bg: 'rgba(21,128,61,0.08)' },
    { icon: Users, label: 'Leads', value: stats.totalLeads, sub: `${stats.newLeads} new`, color: 'var(--gold)', bg: 'rgba(184,148,31,0.08)' },
    { icon: Gavel, label: 'Active Auctions', value: stats.activeLots, sub: 'currently live', color: 'var(--live)', bg: 'rgba(197,48,48,0.08)' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Welcome back — here's your overview.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 120, background: 'var(--border)', borderRadius: 'var(--radius-lg)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {statCards.map(s => (
              <div key={s.label} style={{
                padding: 'var(--space-3)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all 200ms var(--ease-out)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)', marginBottom: 'var(--space-1-5)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                </div>
                <p className="tabular-nums" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{s.value}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', margin: 0 }}>{s.label}</p>
                {s.sub && <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--stone-light)', marginTop: 2 }}>{s.sub}</p>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {/* Recent Leads */}
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Recent Leads</h3>
                <Link to="/admin/leads" style={{ fontSize: 'var(--text-xs)', color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {recentLeads.length === 0 ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', textAlign: 'center', padding: 'var(--space-3)' }}>No leads yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentLeads.slice(0, 5).map(l => (
                    <div key={l.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-1) 0', borderBottom: '1px solid var(--border-light)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      <div>
                        <p style={{ fontWeight: 500, margin: 0 }}>{l.name}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', margin: 0 }}>{l.email}</p>
                      </div>
                      <span style={{
                        fontSize: 'var(--text-2xs)', fontWeight: 600, textTransform: 'uppercase',
                        color: l.status === 'new' ? 'var(--success)' : 'var(--stone)',
                        background: l.status === 'new' ? 'rgba(21,128,61,0.08)' : 'rgba(10,10,10,0.05)',
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      }}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {[
                  { to: '/admin/vehicles/new', icon: Car, label: 'Add New Vehicle', desc: 'List a new vehicle in inventory' },
                  { to: '/admin/auctions/new', icon: Gavel, label: 'Create Auction Lot', desc: 'Start a new auction' },
                  { to: '/admin/blog', icon: FileText, label: 'Write Blog Post', desc: 'Publish an article' },
                ].map(item => (
                  <Link key={item.to} to={item.to} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)',
                    padding: 'var(--space-1-5) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 150ms var(--ease-out)',
                    color: 'inherit', textDecoration: 'none',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={16} style={{ color: 'var(--navy)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', margin: 0 }}>{item.desc}</p>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--stone-light)' }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
