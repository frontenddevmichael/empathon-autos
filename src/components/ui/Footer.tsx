import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const footerLinks = {
  Vehicles: [
    { to: '/inventory', label: 'Browse Inventory' },
    { to: '/ev', label: 'Electric Vehicles' },
    { to: '/pre-order', label: 'Pre-Order' },
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

/** Decorative SVG car silhouette for footer accent */
function FooterDeco() {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden="true"
      style={{ position: 'absolute', bottom: 0, right: '5%', opacity: 0.03, pointerEvents: 'none' }}
    >
      <path
        d="M 10 30 Q 8 30 8 28 Q 8 24 16 24 Q 22 18 30 16 Q 38 14 50 14 Q 58 14 64 18 Q 70 20 76 24 Q 78 26 78 28 Q 78 30 74 30 L 10 30 Z"
        stroke="var(--navy)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="var(--navy)"
        fillOpacity="0.05"
      />
      <circle cx="24" cy="32" r="5" stroke="var(--navy)" strokeWidth="0.8" fill="none" />
      <circle cx="62" cy="32" r="5" stroke="var(--navy)" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <FooterDeco />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} style={{ marginBottom: 'var(--space-1)' }}>
            <img src="/Empathon logo.png" alt="Empathon Autos" width="110" height="110" style={{ borderRadius: 14, objectFit: 'contain' }} />
          </span>
          <p>Premium vehicle imports, pre-orders, and sales since 2019. Your trusted automotive partner in Lagos, Nigeria.</p>
        </div>
        {Object.entries(footerLinks).map(([heading, items]) => (
          <div key={heading} className={styles.col}>
            <h4>{heading}</h4>
            {items.map(item => (
              <Link key={item.to} to={item.to}>{item.label}</Link>
            ))}
          </div>
        ))}
        <div className={styles.col}>
          <h4>Contact</h4>
          <p>123 Ajao Road, Ikeja, Lagos</p>
          <a href="tel:+2348023392388">+234 802 339 2388</a>
          <a href="tel:+2348103832403">+234 810 383 2403</a>
          <a href="mailto:empathonautos@gmail.com">empathonautos@gmail.com</a>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; {new Date().getFullYear()} Empathon Autos. All rights reserved.</span>
        <span style={{ letterSpacing: '0.15em', fontWeight: 500 }}>Trust . Fit . Drive.</span>
      </div>
    </footer>
  )
}
