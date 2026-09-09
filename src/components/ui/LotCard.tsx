import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Lot } from '@/types'
import { formatPrice, formatMileage } from '@/lib/format'
import { Badge } from './Badge'
import styles from './VehicleCard.module.css'

const lotStatusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  'scheduled': 'draft',
  'open': 'live',
  'closing': 'live',
  'closed': 'sold',
  'sold': 'sold',
  'unsold': 'draft',
}

function lotTitle(l: Lot): string {
  if (l.title) return l.title
  const own = [l.make, l.model].filter(Boolean).join(' ')
  if (own) return own
  if (l.vehicles) return `${l.vehicles.make} ${l.vehicles.model}`
  return 'Untitled lot'
}

function lotYear(l: Lot): number | string | null {
  if (l.year) return l.year
  return l.vehicles?.year || null
}

function lotMileage(l: Lot): number {
  return l.mileage || l.vehicles?.mileage || 0
}

function primaryImage(l: Lot): string | undefined {
  return l.media?.find(m => m.is_primary)?.url ?? l.media?.[0]?.url ?? l.vehicles?.media?.find(m => m.is_primary)?.url ?? l.vehicles?.media?.[0]?.url
}

interface LotCardProps {
  lot: Lot
}

export function LotCard({ lot }: LotCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const img = primaryImage(lot)
  const title = lotTitle(lot)
  const year = lotYear(lot)
  const mileage = lotMileage(lot)
  const hasBid = lot.current_bid > 0
  const isOpen = lot.status === 'open' || lot.status === 'closing'

  return (
    <Link to={`/auctions/${lot.id}`} className={styles.link}>
      <article className={styles.card}>
        {/* Image */}
        <div className={styles.imageWrap}>
          {img && !imgError ? (
            <img
              src={img}
              alt={`${title}${year ? ` ${year}` : ''}`}
              className={`${styles.image} ${imgLoaded ? styles.imageLoaded : styles.imageLoading}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.placeholder}>No image yet</div>
          )}
          {/* Hover overlay */}
          <div className={styles.overlay}>
            <span className={styles.viewCue}>View lot</span>
          </div>
          {/* Lot badge overlay */}
          <div style={{
            position: 'absolute',
            top: 'var(--space-1)',
            left: 'var(--space-1)',
            display: 'flex',
            gap: '4px',
          }}>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--navy)',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Auction Lot
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className={styles.meta}>
          <div className={styles.badgeRow}>
            <Badge variant={lotStatusBadge[lot.status] || 'draft'} label={isOpen ? 'Live' : lot.status === 'sold' ? 'Sold' : lot.status === 'scheduled' ? 'Scheduled' : 'Closed'} />
            {lot.condition_grade && (
              <span style={{
                marginLeft: '6px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: lot.condition_grade === 'A' ? 'var(--green)' : lot.condition_grade === 'B' ? 'var(--blue-soft)' : lot.condition_grade === 'C' ? 'var(--amber)' : 'var(--stone-light)',
                color: 'white',
              }}>
                Grade {lot.condition_grade}
              </span>
            )}
          </div>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.footer}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                {hasBid ? 'Current bid' : 'Opening bid'}
              </p>
              <span className={`${styles.price} tabular-nums`}>
                {formatPrice(hasBid ? lot.current_bid : lot.opening_bid)}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              {year && <span className={styles.year}>{year}</span>}
              {mileage > 0 && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                  {formatMileage(mileage)}
                </p>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
