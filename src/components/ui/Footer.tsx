import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { config } from '@/lib/config'
import styles from './Footer.module.css'

interface FooterLink { to: string; label: string; live?: boolean }

const footerLinks: Record<string, FooterLink[]> = {
  Vehicles: [
    { to: '/inventory', label: 'Browse Inventory', live: true },
    { to: '/ev', label: 'Electric Vehicles' },
    { to: '/pre-order', label: 'Pre-Order' },
    { to: '/track-order', label: 'Track Order' },
    { to: '/auctions', label: 'Auctions' },
    { to: '/corporate', label: 'Corporate Sales' },
  ],
  Company: [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Use' },
  ],
}

/** Instagram glyph — lucide dropped brand icons, so we ship our own */
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

/** Facebook glyph — lucide dropped brand icons, so we ship our own */
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

/** Decorative SVG car silhouette for footer accent */
function FooterDeco() {
  return (
    <svg
      width="140"
      height="46"
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden="true"
      style={{ position: 'absolute', bottom: 0, right: '4%', opacity: 0.03, pointerEvents: 'none' }}
    >
      <path
        d="M 10 30 Q 8 30 8 28 Q 8 24 16 24 Q 22 18 30 16 Q 38 14 50 14 Q 58 14 64 18 Q 70 20 76 24 Q 78 26 78 28 Q 78 30 74 30 L 10 30 Z"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        fill="white"
        fillOpacity="0.05"
      />
      <circle cx="24" cy="32" r="5" stroke="white" strokeWidth="0.8" fill="none" />
      <circle cx="62" cy="32" r="5" stroke="white" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

export function Footer() {
  const [inventoryCount, setInventoryCount] = useState<number | null>(null)

  // Live count of available vehicles — echoes the homepage stats band
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let cancelled = false
    ;(async () => {
      try {
        const { count, error } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'sold')
          .neq('status', 'draft')
        if (!cancelled && !error && count !== null) setInventoryCount(count)
      } catch { /* non-fatal */ }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <footer className={`scroll-reveal ${styles.footer}`}>
      {/* Gold hairline — the closing echo of the hero's brand tick */}
      <div className={styles.goldLine} aria-hidden="true" />
      <FooterDeco />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src="/Empathon logo.png" alt="Empathon Autos" className={styles.logo} />
          <p>Premium vehicle imports, pre-orders, and sales since 2019. Your trusted automotive partner in Lagos, Nigeria.</p>
          <div className={styles.social}>
            <a
              href={config.whatsapp.getDeepLink("Hi Empathon Autos!")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
            {config.social.instagram && (
              <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                <InstagramIcon />
              </a>
            )}
            {config.social.facebook && (
              <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                <FacebookIcon />
              </a>
            )}
          </div>
        </div>
        {Object.entries(footerLinks).map(([heading, items]) => (
          <div key={heading} className={styles.col}>
            <h4>{heading}</h4>
            {items.map(item => (
              <Link key={item.to} to={item.to}>
                {item.label}
                {item.live && inventoryCount !== null && (
                  <span className={styles.liveBadge}>{inventoryCount}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
        <div className={styles.col}>
          <h4>Contact</h4>
          <p className={styles.contactItem}><MapPin size={14} /><span>123 Ajao Road, off Awolowo Way, Ikeja, Lagos</span></p>
          <a className={styles.contactItem} href="tel:+2348023392388"><Phone size={14} /><span>+234 802 339 2388</span></a>
          <a className={styles.contactItem} href="tel:+2348103832403"><Phone size={14} /><span>+234 810 383 2403</span></a>
          <a className={styles.contactItem} href="mailto:empathonautos@gmail.com"><Mail size={14} /><span>empathonautos@gmail.com</span></a>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; {new Date().getFullYear()} Empathon Autos. All rights reserved.</span>
        <span className={styles.tagline}><span className={styles.taglineDot} aria-hidden="true" />Trust . Fit . Drive.</span>
      </div>
    </footer>
  )
}
