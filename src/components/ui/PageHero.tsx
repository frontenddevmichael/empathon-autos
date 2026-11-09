import { useEffect, useState, type ReactNode } from 'react'
import styles from './PageHero.module.css'

export interface HeroImage {
  url: string
  alt?: string
}

interface PageHeroProps {
  label?: string
  title: ReactNode
  subtitle?: string
  /** One or more background images — multiple images crossfade. */
  images?: HeroImage[]
  /** Image-free navy band, used for utility pages like Inventory. */
  variant?: 'image' | 'band'
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'center'
  /** How the scrim is laid out over the image. */
  overlay?: 'left' | 'bottom' | 'center'
  children?: ReactNode
  className?: string
}

const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg }
const overlayClass = { left: styles.overlayLeft, bottom: styles.overlayBottom, center: styles.overlayCenter }

export function PageHero({
  label,
  title,
  subtitle,
  images = [],
  variant = 'image',
  size = 'md',
  align = 'left',
  overlay = 'left',
  children,
  className = '',
}: PageHeroProps) {
  const [index, setIndex] = useState(0)
  const isBand = variant === 'band'

  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 8000)
    return () => clearInterval(id)
  }, [images.length])

  const cls = [
    styles.hero,
    sizeClass[size],
    isBand ? styles.band : '',
    align === 'center' ? styles.center : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <section className={cls}>
      {!isBand && images.length > 0 && (
        <div className={styles.media} aria-hidden="true">
          {images.map((img, i) => (
            <img
              key={img.url}
              src={img.url}
              alt={img.alt ?? ''}
              className={`${styles.image} ${i === index ? styles.imageActive : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
            />
          ))}
        </div>
      )}

      {!isBand && images.length > 0 && <div className={`${styles.overlay} ${overlayClass[overlay]}`} />}

      <div className={styles.content}>
        {label && (
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {label}
          </p>
        )}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </div>

    </section>
  )
}
