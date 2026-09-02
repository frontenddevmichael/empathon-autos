import { Link } from 'react-router-dom'
import type { Vehicle, VehicleMedia } from '@/types'
import { Badge } from './Badge'
import { OptImage } from '@/components/OptImage'
import { CardTilt } from '@/components/CardTilt'
import { STATUS_TO_BADGE } from '@/lib/constants'
import styles from './VehicleCard.module.css'

interface VehicleCardProps {
  vehicle: Vehicle & { media?: VehicleMedia[] }
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const primary = vehicle.media?.find(m => m.is_primary) ?? vehicle.media?.[0]
  const price = vehicle.price > 0
    ? `₦${(vehicle.price / 1_000_000).toFixed(1)}M`
    : 'Price on request'

  return (
    <Link to={`/inventory/${vehicle.id}`} className={styles.card}>
      <CardTilt>
      <div className={styles.wrap}>
        <div className={styles.imageWrap}>
          {primary ? (
            <OptImage src={primary.url} alt={primary.alt_text || `${vehicle.make} ${vehicle.model}`} className={styles.image} width={480} />
          ) : (
            <div className={styles.image} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              No image
            </div>
          )}
          <div className={styles.badge}>
            <Badge variant={STATUS_TO_BADGE[vehicle.status] || 'draft'} />
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.topRow}>
            <span className={styles.title}>{vehicle.make} {vehicle.model}</span>
            <span className={styles.year}>{vehicle.year}</span>
          </div>
          {vehicle.trim && <span className={styles.trim}>{vehicle.trim}</span>}
          <span className={styles.price}>{price}</span>
          <div className={styles.meta}>
            <span>{vehicle.mileage.toLocaleString()} km</span>
            <span className={styles.dot} />
            <span className="capitalize">{vehicle.transmission}</span>
            <span className={styles.dot} />
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
        </div>
      </div>
      </CardTilt>
    </Link>
  )
}
