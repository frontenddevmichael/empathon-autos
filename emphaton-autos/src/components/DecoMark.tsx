export function DecoMark({ size = 40, variant = 'shield' }: { size?: number; variant?: 'shield' | 'arrow' | 'split' }) {
  const s = size
  if (variant === 'shield') {
    return (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 4L34 12v8c0 8.4-5.6 16.2-14 18-8.4-1.8-14-9.6-14-18v-8L20 4z" fill="var(--navy)" opacity="0.06" />
        <path d="M20 4L34 12v8c0 8.4-5.6 16.2-14 18-8.4-1.8-14-9.6-14-18v-8L20 4z" stroke="var(--navy)" strokeWidth="1.25" fill="none" />
        <path d="M16 18l3 3 5-6" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (variant === 'arrow') {
    return (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke="var(--navy)" strokeWidth="1.25" fill="var(--navy)" fillOpacity="0.04" />
        <path d="M18 14l6 6-6 6" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="14" height="24" rx="3" stroke="var(--navy)" strokeWidth="1.25" fill="var(--navy)" fillOpacity="0.04" />
      <rect x="22" y="8" width="14" height="24" rx="3" stroke="var(--navy)" strokeWidth="1.25" fill="var(--navy)" fillOpacity="0.04" />
      <line x1="11" y1="16" x2="11" y2="24" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="16" x2="29" y2="24" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
