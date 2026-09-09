import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'

export function NotFound() {
  const nav = useNavigate()
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 120, margin: '0 auto var(--space-3)' }}>
          <circle cx="60" cy="60" r="56" stroke="rgba(0,51,102,0.08)" strokeWidth="2" />
          <path d="M40 50 L60 40 L80 50 M40 60 L60 50 L80 60 M40 70 L60 60 L80 70" stroke="rgba(0,51,102,0.12)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="44" r="3" fill="rgba(0,51,102,0.15)" />
          <circle cx="72" cy="44" r="3" fill="rgba(0,51,102,0.15)" />
          <path d="M52 52 C56 48, 64 48, 68 52" stroke="rgba(0,51,102,0.2)" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 58 Q60 62 68 58" stroke="rgba(197,48,48,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Page not found — this road doesn't lead anywhere yet.</p>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={() => nav('/')}>Return Home</button>
        <button className={styles.btnSecondary} onClick={() => nav(-1)}>Go Back</button>
      </div>
      <div className={styles.links}>
        <a href="/inventory" onClick={e => { e.preventDefault(); nav('/inventory') }}>Browse Inventory</a>
        <span className={styles.dot} />
        <a href="/contact" onClick={e => { e.preventDefault(); nav('/contact') }}>Contact Us</a>
        <span className={styles.dot} />
        <a href="/blog" onClick={e => { e.preventDefault(); nav('/blog') }}>Read Blog</a>
      </div>
    </div>
  )
}
