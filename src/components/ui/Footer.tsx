import { Link } from 'react-router-dom'
import { config } from '@/lib/config'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <strong style={{ fontSize: 'var(--text-lg)', color: 'white' }}>Empathon Autos</strong>
            <p>Premium vehicle imports, pre-orders, and sales serving Nigeria since 2019.</p>
          </div>
          <div>
            <p className={styles.heading}>Quick Links</p>
            <div className={styles.col}>
              <Link to="/inventory">Inventory</Link>
              <Link to="/pre-order">Pre-Order</Link>
              <Link to="/corporate">Corporate</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <p className={styles.heading}>Contact</p>
            <address className={styles.address}>
              {config.address}<br />
              {config.phonePrimary}<br />
              {config.email}
            </address>
          </div>
          <div>
            <p className={styles.heading}>Legal</p>
            <div className={styles.col}>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          &copy; {new Date().getFullYear()} Empathon Autos. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
