import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types'
import { formatPrice, formatMileage } from '@/lib/format'
import { Badge } from './Badge'
import styles from './VehicleCard.module.css'

const statusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  'walk-in': 'available', 'pre-order': 'pre-order', 'sold': 'sold',
  'in-auction': 'live', 'draft': 'draft', 'published': 'available',
}

const statusLabel: Record<string, string> = {
  'walk-in': 'Available',
  'pre-order': 'Pre-order',
  'sold': 'Sold',
  'in-auction': 'In auction',
  'draft': 'Coming soon',
  'published': 'Available',
}

const transmissionLabel: Record<string, string> = {
  automatic: 'Automatic',
  manual: 'Manual',
  'semi-automatic': 'Semi-automatic',
}

interface VehicleCardProps {
  vehicle: Vehicle
}

/**
 * The vehicle card. One link, one photograph, three lines of type.
 * Hover does one thing: the image scales to 1.03 over 600ms.
 */
export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [broken, setBroken] = useState(false)
  const img = vehicle.media?.find(m => m.is_primary) ?? vehicle.media?.[0]
  const spec = [vehicle.year || null, formatMileage(vehicle.mileage), transmissionLabel[vehicle.transmission]]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link to={`/inventory/${vehicle.id}`} className={styles.link}>
      <article className={styles.card}>
        <div className={styles.media}>
          {img && !broken ? (
            <img
              src={img.url}
              alt={`${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} ${vehicle.year}`}
              className={styles.image}
              loading="lazy"
              decoding="async"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className={styles.placeholder}>Photo coming soon</div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.head}>
            <h3 className={styles.name}>{vehicle.make} {vehicle.model}</h3>
            <Badge
              variant={statusBadge[vehicle.status] || 'draft'}
              label={statusLabel[vehicle.status]}
            />
          </div>
          <p className={styles.spec}>{spec}</p>
          <p className={styles.price}>{formatPrice(vehicle.price)}</p>
        </div>
      </article>
    </Link>
  )
}
