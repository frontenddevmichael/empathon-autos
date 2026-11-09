import { Link } from 'react-router-dom'
import { formatPrice, formatMileage } from '@/lib/format'
import { lotTitle, lotYear, lotMileage, primaryLotImage, firstName } from '@/lib/auction'
import { Badge } from '@/components/ui/Badge'
import { AuctionTimer } from '@/components/ui/AuctionTimer'
import type { Lot } from '@/types'
import styles from './AuctionLotCard.module.css'

interface AuctionLotCardProps {
  lot: Lot
  variant?: 'live' | 'past'
}

/** Shared auction tile — same frame, rhythm and type as the vehicle card. */
export function AuctionLotCard({ lot, variant = 'live' }: AuctionLotCardProps) {
  const img = primaryLotImage(lot)
  const title = lotTitle(lot)
  const year = lotYear(lot)

  const isOpen = lot.status === 'open' || lot.status === 'closing'
  const hasBid = lot.current_bid > 0
  const isSold = lot.status === 'sold'
  const winner = isSold ? firstName(lot.winner_name) : null

  const pastLabel = isSold
    ? (winner ? `Won by ${winner}` : 'Sold')
    : lot.current_bid > 0 ? 'Reserve not met' : 'No winning bid'

  const priceLabel = variant === 'live'
    ? (hasBid ? 'Current bid' : 'Opening bid')
    : pastLabel

  const priceValue = variant === 'live'
    ? formatPrice(hasBid ? lot.current_bid : lot.opening_bid)
    : isSold ? formatPrice(lot.current_bid) : '—'

  return (
    <Link to={`/auctions/${lot.id}`} className={styles.link}>
      <article className={styles.card}>
        <div className={styles.media}>
          {img ? (
            <img
              src={img}
              alt={title}
              className={`${styles.image} ${variant === 'past' && !isSold ? styles.imageMuted : ''}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.placeholder}>Photo coming soon</div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.head}>
            <h3 className={styles.name}>{title}</h3>
            {variant === 'live'
              ? (isOpen ? <Badge variant="live" /> : <Badge variant="draft" label="Scheduled" />)
              : (isSold
                ? <Badge variant="sold" />
                : <Badge variant="draft" label={lot.status === 'closed' ? 'Closed' : 'Unsold'} />)}
          </div>

          <p className={styles.spec}>
            {variant === 'live'
              ? [year, formatMileage(lotMileage(lot))].filter(Boolean).join(' · ')
              : `Closed ${new Date(lot.closes_at).toLocaleDateString()}`}
          </p>

          <div className={styles.footer}>
            <div>
              <p className={styles.label}>{priceLabel}</p>
              <p className={`${styles.price} ${variant === 'past' && !isSold ? styles.priceMuted : ''}`}>
                {priceValue}
              </p>
            </div>
            <p className={styles.timer}>
              {variant === 'live'
                ? (isOpen ? <AuctionTimer closesAt={lot.closes_at} /> : 'Bidding opens soon')
                : ''}
            </p>
          </div>
        </div>
      </article>
    </Link>
  )
}
