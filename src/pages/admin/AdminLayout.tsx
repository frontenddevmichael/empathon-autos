import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Car, Users, Megaphone, LogOut, Gavel, FileText, Menu, X, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import styles from './AdminLayout.module.css'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/admin/leads', icon: Users, label: 'Leads' },
  { to: '/admin/auctions', icon: Gavel, label: 'Auctions' },
  { to: '/admin/content', icon: Megaphone, label: 'Content' },
  { to: '/admin/blog', icon: FileText, label: 'Blog' },
  { to: '/admin/testimonials', icon: Star, label: 'Testimonials' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className={styles.layout}>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}
      
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <img src="/Empathon logo.png" alt="Empathon Autos" height="36" style={{ width: 'auto', maxWidth: 160, height: 36, objectFit: 'contain' }} />
          Admin
          <button className={styles.closeBtn} onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.spacer} />
        <button className={styles.logout} onClick={handleLogout}>
          <LogOut size={14} style={{ marginRight: 6 }} />
          Sign Out
        </button>
      </aside>

      <main className={styles.main}>
        <div className={styles.mobileBar}>
          <button className={styles.hamburger} onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Empathon Autos Admin</span>
        </div>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className={styles.bottomNav}>
        {navItems.map(item => {
          const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to)
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={`${styles.bottomLink} ${isActive ? styles.bottomActive : ''}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
        <button className={`${styles.bottomLink} ${styles.bottomLogout}`} onClick={handleLogout} aria-label="Sign out">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  )
}