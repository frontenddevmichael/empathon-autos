import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './Button'
import styles from './Nav.module.css'

const links = [
  { to: '/inventory', label: 'Inventory' },
  { to: '/ev', label: 'EV' },
  { to: '/pre-order', label: 'Pre-Order' },
  { to: '/auctions', label: 'Auctions' },
  { to: '/corporate', label: 'Corporate' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
]

/** Premium SVG logo mark — used in Nav */
function LogoSvg() {
  const [imgErr, setImgErr] = useState(false)
  const onErr = useCallback(() => setImgErr(true), [])
  if (imgErr) {
    return (
      <svg width="44" height="44" viewBox="0 0 34 34" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <rect width="34" height="34" rx="6" fill="var(--navy)" />
        <text x="17" y="22" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="800" fill="white" letterSpacing="-0.02">EA</text>
        <path d="M6 26 Q17 30 28 26" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      </svg>
    )
  }
  return (
    <img
      src="/Empathon logo.png"
      alt="Empathon Autos"
      width="44"
      height="44"
      style={{ borderRadius: 8, flexShrink: 0, objectFit: 'contain' }}
      onError={onErr}
    />
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)

  // Scroll detection — adds blur/shadow after 40px
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
    const t = setTimeout(() => setMobileOpen(false), 50)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('mousedown', handler)
    }
  }, [mobileOpen])

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  // Determine nav classes:
  // - .nav → always navy bg, white text
  // - .scrolled → adds blur + shadow
  const navClasses = [
    styles.nav,
    scrolled ? styles.scrolled : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <nav className={navClasses} role="navigation" aria-label="Main navigation">
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label="Empathon Autos home">
            <LogoSvg />
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
              <Button as="a" href="/contact" size="sm" variant="primary" className={styles.navContact}>Contact</Button>
            </div>
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className={styles.hamburgerInner}>
              <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen : ''}`} />
            </span>
          </button>
        </div>
      </nav>

      <div
        ref={menuRef}
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}
        role="dialog" aria-modal="true" aria-label="Navigation"
        onKeyDown={e => { if (e.key === 'Escape') setMobileOpen(false) }}
      >
        <div className={styles.mobileLinks}>
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.mobileLink}
              tabIndex={mobileOpen ? 0 : -1}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {link.label}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: 0.3, marginLeft: 'auto' }}>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
        <div className={styles.mobileCta}>
          <Button as="a" href="/contact" fullWidth>Contact</Button>
        </div>
      </div>
    </>
  )
}
