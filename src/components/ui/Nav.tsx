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

const SCROLL_THRESHOLD = 24

function LogoSvg() {
  const [imgErr, setImgErr] = useState(false)
  const onErr = useCallback(() => setImgErr(true), [])
  if (imgErr) {
    return (
      <svg viewBox="0 0 34 34" fill="none" aria-hidden="true" className={styles.logoFallback}>
        <rect width="34" height="34" rx="6" fill="var(--navy)" />
        <text x="17" y="22" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="800" fill="white" letterSpacing="-0.02">EA</text>
      </svg>
    )
  }
  return <img src="/Empathon logo.png" alt="Empathon Autos" className={styles.logoImage} onError={onErr} />
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { pathname } = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const dropdownTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    // No rAF gate: the value only changes once per threshold cross, and this
    // keeps the nav correct in background tabs where rAF is paused.
    const onScroll = () => {
      setScrolled(prev => {
        const next = window.scrollY > SCROLL_THRESHOLD
        return next === prev ? prev : next
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setActiveDropdown(null)
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
      if (e.key === 'Escape') { setMobileOpen(false); hamburgerRef.current?.focus(); return }
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

  const clearTimer = (label: string) => {
    const existing = dropdownTimers.current.get(label)
    if (existing) clearTimeout(existing)
  }

  const handleGroupEnter = useCallback((label: string) => {
    clearTimer(label)
    setActiveDropdown(label)
  }, [])

  const handleGroupLeave = useCallback((label: string) => {
    const timer = setTimeout(() => {
      setActiveDropdown(prev => prev === label ? null : prev)
    }, 140)
    dropdownTimers.current.set(label, timer)
  }, [])

  const openAndFocusFirstItem = (label: string, wrapper: HTMLElement) => {
    setActiveDropdown(label)
    requestAnimationFrame(() => {
      wrapper.querySelector<HTMLElement>(`.${styles.dropdownItem}`)?.focus()
    })
  }

  // Transparent only over the home hero, and never behind the open sheet
  const overHero = pathname === '/' && !scrolled && !mobileOpen

  const navClasses = [
    styles.nav,
    overHero ? styles.transparent : '',
  ].filter(Boolean).join(' ')

  // Mobile links stagger at 60ms as the sheet opens
  const mobileDelay = (i: number) => ({
    style: { transitionDelay: `${i * 60}ms` },
    'data-open': mobileOpen,
  }) as const
  const groupLinkCount = navGroups.reduce((n, g) => n + g.children.length, 0)

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <nav className={navClasses} role="navigation" aria-label="Main navigation">
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label="Empathon Autos home">
            <LogoSvg />
          </Link>

          <div className={styles.links}>
            {navGroups.map(group => (
              <div
                key={group.label}
                className={styles.groupWrapper}
                onMouseEnter={() => handleGroupEnter(group.label)}
                onMouseLeave={() => handleGroupLeave(group.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveDropdown(null)
                }}
              >
                <button
                  type="button"
                  className={`${styles.groupTrigger} ${isGroupActive(group) ? styles.groupActive : ''}`}
                  aria-expanded={activeDropdown === group.label}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(prev => prev === group.label ? null : group.label)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      openAndFocusFirstItem(group.label, e.currentTarget.parentElement as HTMLElement)
                    }
                    if (e.key === 'Escape') setActiveDropdown(null)
                  }}
                >
                  {group.label}
                  <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown === group.label ? styles.chevronOpen : ''}`} />
                </button>

                <div
                  className={`${styles.dropdown} ${activeDropdown === group.label ? styles.dropdownOpen : ''}`}
                  onMouseEnter={() => clearTimer(group.label)}
                  onMouseLeave={() => handleGroupLeave(group.label)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Escape') return
                    e.preventDefault()
                    setActiveDropdown(null)
                    e.currentTarget.parentElement?.querySelector<HTMLElement>(`.${styles.groupTrigger}`)?.focus()
                  }}
                  role="menu"
                >
                  {group.children.map(child => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className={`${styles.dropdownItem} ${isActive(child.to) ? styles.dropdownItemActive : ''}`}
                      role="menuitem"
                      tabIndex={activeDropdown === group.label ? 0 : -1}
                      aria-current={isActive(child.to) ? 'page' : undefined}
                      onClick={() => setActiveDropdown(null)}
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
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.cta}>
            <Link to="/register" className={styles.textLink}>Register</Link>
            <Button
              as="a"
              href="/contact"
              size="sm"
              variant={overHero ? 'white' : 'primary'}
            >
              Enquire
            </Button>
          </div>

          <button
            ref={hamburgerRef}
            type="button"
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
      </nav>

      {/* The menu is a sibling of <nav>: the nav's backdrop-filter creates a
          containing block, which would clip a fixed-position child. */}
      <div
          ref={menuRef}
          id="site-mobile-nav"
          className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          aria-hidden={!mobileOpen}
        >
          <div className={styles.mobileLinks}>
            {navGroups.map((group, gi) => (
              <div key={group.label} className={styles.mobileGroup}>
                <span className={styles.mobileGroupLabel}>{group.label}</span>
                {group.children.map((child, ci) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    className={`${styles.mobileLink} ${isActive(child.to) ? styles.mobileLinkActive : ''}`}
                    tabIndex={mobileOpen ? 0 : -1}
                    aria-current={isActive(child.to) ? 'page' : undefined}
                    {...mobileDelay(gi * 3 + ci)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}

            <span className={styles.mobileDivider} />

            {standaloneLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.mobileLink} ${isActive(link.to) ? styles.mobileLinkActive : ''}`}
                tabIndex={mobileOpen ? 0 : -1}
                aria-current={isActive(link.to) ? 'page' : undefined}
                {...mobileDelay(groupLinkCount + i)}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/register"
              className={styles.mobileLink}
              tabIndex={mobileOpen ? 0 : -1}
              {...mobileDelay(groupLinkCount + standaloneLinks.length)}
            >
              Register
            </Link>
            <Link
              to="/dashboard"
              className={styles.mobileLink}
              tabIndex={mobileOpen ? 0 : -1}
              {...mobileDelay(groupLinkCount + standaloneLinks.length + 1)}
            >
              My Dashboard
            </Link>
          </div>

          <div className={styles.mobileCta}>
            <div className={styles.mobileContactRow}>
              <a href={`tel:${config.company.phone1.replace(/\s/g, '')}`} className={styles.mobileContactLink}>
                <Phone size={18} /> Call Us
              </a>
              <a href={config.whatsapp.link} target="_blank" rel="noopener noreferrer" className={styles.mobileContactLink}>
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
            <Button as="a" href="/contact" fullWidth size="lg">Enquire</Button>
          </div>
        </div>
    </>
  )
}
