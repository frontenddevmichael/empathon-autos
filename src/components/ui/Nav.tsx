import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, MessageCircle, ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { config } from '@/lib/config'
import styles from './Nav.module.css'

interface NavLink {
  to: string
  label: string
}

interface NavGroup {
  label: string
  children: NavLink[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Buy',
    children: [
      { to: '/inventory', label: 'Inventory' },
      { to: '/pre-order', label: 'Pre-Order' },
      { to: '/auctions', label: 'Auctions' },
    ],
  },
  {
    label: 'Explore',
    children: [
      { to: '/ev', label: 'Electric Vehicles' },
      { to: '/corporate', label: 'Corporate' },
    ],
  },
]

const standaloneLinks: NavLink[] = [
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
]

function LogoSvg() {
  const [imgErr, setImgErr] = useState(false)
  const onErr = useCallback(() => setImgErr(true), [])
  if (imgErr) {
    return (
      <svg viewBox="0 0 34 34" fill="none" aria-hidden="true" style={{ flexShrink: 0, width: '100%', height: '100%' }}>
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
      style={{ width: '100%', height: '100%', flexShrink: 0, objectFit: 'contain', display: 'block' }}
      onError={onErr}
    />
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [underlineStyle, setUnderlineStyle] = useState<React.CSSProperties>({})
  const { pathname } = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const dropdownTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

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
    const previouslyFocused = document.activeElement as HTMLElement | null
    const firstFocusable = menuRef.current?.querySelector<HTMLElement>('a, button')
    firstFocusable?.focus()

    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false); return }
      if (e.key !== 'Tab' || !menuRef.current) return
      const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a, button'))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [mobileOpen])

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  const isGroupActive = (group: NavGroup) => group.children.some(c => isActive(c.to))

  const updateUnderline = useCallback((el: HTMLElement | null) => {
    if (!el || !linksRef.current) {
      setUnderlineStyle({ opacity: 0 })
      return
    }
    const linksRect = linksRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setUnderlineStyle({
      left: elRect.left - linksRect.left,
      width: elRect.width,
      opacity: 1,
    })
  }, [])

  const handleGroupEnter = useCallback((label: string, el: HTMLElement) => {
    const existing = dropdownTimers.current.get(label)
    if (existing) clearTimeout(existing)
    setActiveDropdown(label)
    updateUnderline(el)
  }, [updateUnderline])

  const handleGroupLeave = useCallback((label: string) => {
    const timer = setTimeout(() => {
      setActiveDropdown(prev => prev === label ? null : prev)
      setUnderlineStyle({ opacity: 0 })
    }, 120)
    dropdownTimers.current.set(label, timer)
  }, [])

  const handleDropdownEnter = useCallback((label: string) => {
    const existing = dropdownTimers.current.get(label)
    if (existing) clearTimeout(existing)
  }, [])

  const handleDropdownLeave = useCallback((label: string) => {
    handleGroupLeave(label)
  }, [handleGroupLeave])

  const navClasses = [styles.nav, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <nav className={navClasses} role="navigation" aria-label="Main navigation">
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label="Empathon Autos home">
            <LogoSvg />
          </Link>

          <div className={styles.links} ref={linksRef}>
            {/* Sliding underline indicator */}
            <span className={styles.underlineIndicator} style={underlineStyle} />

            {navGroups.map(group => (
              <div
                key={group.label}
                className={styles.groupWrapper}
                onMouseEnter={(e) => handleGroupEnter(group.label, e.currentTarget.querySelector(`.${styles.groupTrigger}`)!)}
                onMouseLeave={() => handleGroupLeave(group.label)}
              >
                <button
                  className={`${styles.groupTrigger} ${isGroupActive(group) ? styles.groupActive : ''}`}
                  aria-expanded={activeDropdown === group.label}
                  aria-haspopup="true"
                >
                  {group.label}
                  <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown === group.label ? styles.chevronOpen : ''}`} />
                </button>

                <div
                  className={`${styles.dropdown} ${activeDropdown === group.label ? styles.dropdownOpen : ''}`}
                  onMouseEnter={() => handleDropdownEnter(group.label)}
                  onMouseLeave={() => handleDropdownLeave(group.label)}
                  role="menu"
                >
                  {group.children.map(child => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className={`${styles.dropdownItem} ${isActive(child.to) ? styles.dropdownItemActive : ''}`}
                      role="menuitem"
                      tabIndex={activeDropdown === group.label ? 0 : -1}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {standaloneLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.link} ${isActive(link.to) ? styles.active : ''}`}
                aria-current={isActive(link.to) ? 'page' : undefined}
                onMouseEnter={(e) => updateUnderline(e.currentTarget)}
                onMouseLeave={() => setUnderlineStyle({ opacity: 0 })}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.cta}>
            <a href={`tel:${config.company.phone1.replace(/\s/g, '')}`} className={styles.pillButton} aria-label="Call us">
              <Phone size={15} />
              <span className={styles.pillLabel}>Call</span>
            </a>
            <a href={config.whatsapp.link} target="_blank" rel="noopener noreferrer" className={styles.pillButton} aria-label="Chat on WhatsApp">
              <MessageCircle size={15} />
              <span className={styles.pillLabel}>WhatsApp</span>
            </a>
            <Button as="a" href="/register" size="sm" variant="ghost">Register</Button>
            <Button as="a" href="/contact" size="sm" variant="primary" magnetic className={styles.navContact}>Contact</Button>
          </div>

          <button
            ref={hamburgerRef}
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-nav"
          >
            <span className={styles.hamburgerInner}>
              <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen : ''}`} />
            </span>
          </button>
        </div>

        <div
          ref={menuRef}
          id="site-mobile-nav"
          className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}
          role="dialog" aria-modal="true" aria-label="Navigation"
          aria-hidden={!mobileOpen}
        >
        <div className={styles.mobileLinks}>
          {navGroups.map((group, gi) => (
            <div key={group.label} className={styles.mobileGroup}>
              <span
                className={styles.mobileGroupLabel}
                style={{ animationDelay: `${gi * 80}ms` }}
              >
                {group.label}
              </span>
              {group.children.map((child, ci) => (
                <Link
                  key={child.to}
                  to={child.to}
                  className={`${styles.mobileLink} ${isActive(child.to) ? styles.mobileLinkActive : ''}`}
                  tabIndex={mobileOpen ? 0 : -1}
                  style={{ animationDelay: `${(gi * 3 + ci + 1) * 60}ms` }}
                >
                  {child.label}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: 0.3, marginLeft: 'auto' }}>
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          ))}

          <span className={styles.mobileDivider} style={{ animationDelay: `${navGroups.length * 180}ms` }} />

          {standaloneLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.mobileLink} ${isActive(link.to) ? styles.mobileLinkActive : ''}`}
              tabIndex={mobileOpen ? 0 : -1}
              style={{ animationDelay: `${(navGroups.length * 3 + i + 1) * 60}ms` }}
            >
              {link.label}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: 0.3, marginLeft: 'auto' }}>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}

          <Link
            to="/register"
            className={styles.mobileLink}
            tabIndex={mobileOpen ? 0 : -1}
            style={{ animationDelay: `${(navGroups.length + 2) * 100}ms`, color: 'var(--navy)' }}
          >
            Register to Bid
          </Link>
          <Link
            to="/dashboard"
            className={styles.mobileLink}
            tabIndex={mobileOpen ? 0 : -1}
            style={{ animationDelay: `${(navGroups.length + 3) * 100}ms`, color: 'var(--navy)' }}
          >
            My Dashboard
          </Link>
        </div>

        <div className={styles.mobileCta}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <a href={`tel:${config.company.phone1.replace(/\s/g, '')}`} className={styles.mobileContactLink}>
              <Phone size={18} /> Call Us
            </a>
            <a href={config.whatsapp.link} target="_blank" rel="noopener noreferrer" className={styles.mobileContactLink}>
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
          <Button as="a" href="/contact" fullWidth>Contact</Button>
        </div>
      </div>
      </nav>
    </>
  )
}
