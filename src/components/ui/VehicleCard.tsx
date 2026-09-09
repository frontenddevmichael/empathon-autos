import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types'
import { formatPrice } from '@/lib/format'
import { Badge } from './Badge'
import styles from './VehicleCard.module.css'

const statusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  'walk-in': 'available', 'pre-order': 'pre-order', 'sold': 'sold',
  'in-auction': 'live', 'draft': 'draft', 'published': 'available',
}

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const img = vehicle.media?.find(m => m.is_primary) ?? vehicle.media?.[0]

  return (
    <Link to={`/inventory/${vehicle.id}`} className={styles.link}>
      <article className={styles.card}>
        {/* Image — the hero of the card */}
        <div className={styles.imageWrap}>
          {img && !imgError ? (
            <img
              src={img.url}
              alt={`${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} ${vehicle.year}`}
              className={`${styles.image} ${imgLoaded ? styles.imageLoaded : styles.imageLoading}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.placeholder}>No image yet</div>
          )}
          {/* Soft wash + detail cue revealed on hover */}
          <div className={styles.overlay}>
            <span className={styles.viewCue}>View details</span>
          </div>
        </div>

        {/* Metadata — minimal, quiet */}
        <div className={styles.meta}>
          <div className={styles.badgeRow}>
            <Badge variant={statusBadge[vehicle.status] || 'draft'} />
          </div>
          <h3 className={styles.title}>{vehicle.make} {vehicle.model}</h3>
          {vehicle.trim && <p className={styles.trim}>{vehicle.trim}</p>}
          <div className={styles.footer}>
            <span className={styles.price}>{formatPrice(vehicle.price)}</span>
            {vehicle.year && <span className={styles.year}>{vehicle.year}</span>}
          </div>
        </div>
      </article>
    </Link>
  )
}
