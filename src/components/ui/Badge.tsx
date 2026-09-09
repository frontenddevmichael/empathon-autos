import styles from './Badge.module.css'

const variantMap = {
  'available': styles.available,
  'pre-order': styles.preOrder,
  'sold': styles.sold,
  'draft': styles.draft,
  'live': styles.live,
}

const labelMap: Record<string, string> = {
  'available': 'In Stock',
  'pre-order': 'Pre-Order',
  'sold': 'Sold',
  'draft': 'Draft',
  'live': 'Live',
  'walk-in': 'In Stock',
  'in-auction': 'Live Auction',
}

interface BadgeProps {
  variant: keyof typeof variantMap
  label?: string
}

export function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${variantMap[variant]}`}>
      {label ?? labelMap[variant] ?? variant}
    </span>
  )
}