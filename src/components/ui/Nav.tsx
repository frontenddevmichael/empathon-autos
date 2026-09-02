import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import styles from './Nav.module.css'
import { Button } from './Button'

const links = [
  { to: '/inventory', label: 'Inventory' },
  { to: '/auctions', label: 'Auctions' },
  { to: '/pre-order', label: 'Pre-Order' },
  { to: '/about', label: 'About' },
]

const sectionIds = ['inventory', 'auctions', 'pre-order', 'about']

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const [activeSection, setActiveSection] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame: number
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 40))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [])

  useEffect(() => {
    if (pathname !== '/') { setActiveSection(''); return }
    const els = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (els.length === 0) return
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActiveSection(e.target.id) } },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [pathname])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  const isActive = (to: string) => {
    if (pathname === '/') return activeSection === to.slice(1)
    return pathname.startsWith(to)
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.mark}>EA</span>
            <span className={styles.wordmark}>Empathon <span className={styles.accent}>Autos</span></span>
          </Link>

          <div className={styles.links}>
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.link} ${isActive(link.to) ? styles.active : ''}`}
                aria-current={isActive(link.to) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.cta}>
              <Button as="a" href="/contact" size="sm" variant="primary">Get in Touch</Button>
            </div>
          </div>

          <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <div
        ref={menuRef}
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}
        role="dialog" aria-modal="true" aria-label="Navigation"
        onKeyDown={e => { if (e.key === 'Escape') setMobileOpen(false) }}
      >
        {links.map(link => (
          <Link key={link.to} to={link.to} className={styles.mobileLink} tabIndex={mobileOpen ? 0 : -1}>{link.label}</Link>
        ))}
        <div className={styles.mobileCta}>
          <Button as="a" href="/contact" fullWidth>Get in Touch</Button>
        </div>
      </div>
    </>
  )
}
