import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Car, Users, Gavel, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/auctions', label: 'Auctions', icon: Gavel },
]

export function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 260, background: 'var(--ink)', color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 200ms var(--ease-out)',
      }}>
        <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/admin" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>Empathon Autos</Link>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: 'var(--space-1)' }}>
          {nav.map(n => {
            const active = n.to === '/admin' ? pathname === '/admin' : pathname.startsWith(n.to)
            return (
              <Link key={n.to} to={n.to} onClick={() => setSidebarOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-2)',
                borderRadius: 8, marginBottom: 2, fontSize: 'var(--text-sm)',
                background: active ? 'var(--clay-muted)' : 'transparent',
                color: active ? 'var(--clay)' : 'rgba(255,255,255,0.6)',
                transition: 'all 200ms',
              }}>
                <n.icon size={16} />
                {n.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: 'var(--space-1)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-2)',
            borderRadius: 8, width: '100%', border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.4)', fontSize: 'var(--text-sm)', cursor: 'pointer',
            transition: 'color 200ms',
          }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: sidebarOpen ? 260 : 0, flex: 1, minWidth: 0, transition: 'margin-left 200ms var(--ease-out)' }}>
        <header style={{
          height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          padding: '0 var(--space-3)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 8, marginRight: 'var(--space-1)', color: 'var(--ink)' }} aria-label="Toggle sidebar">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{nav.find(n => n.to === '/admin' ? pathname === '/admin' : pathname.startsWith(n.to))?.label || 'Admin'}</span>
        </header>
        <main style={{ padding: 'var(--space-3)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
