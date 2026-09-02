import styles from './Badge.module.css'

type BadgeVariant = 'draft' | 'published' | 'available' | 'sold' | 'pre-order' | 'live'

const variantMap: Record<BadgeVariant, string> = {
  'draft': styles.draft,
  'published': styles.published,
  'available': styles.available,
  'sold': styles.sold,
  'pre-order': styles.preOrder,
  'live': styles.live,
}

const labelMap: Record<BadgeVariant, string> = {
  'draft': 'Draft',
  'published': 'Published',
  'available': 'Available',
  'sold': 'Sold',
  'pre-order': 'Pre-Order',
  'live': 'Live',
}

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

export function Badge({ variant, className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${variantMap[variant]} ${className}`}>
      {variant === 'live' && <span className={styles.liveDot} />}
      {labelMap[variant]}
    </span>
  )
}
