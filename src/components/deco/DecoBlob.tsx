import styles from './DecoBlob.module.css'

interface DecoBlobProps {
  variant?: 1 | 2 | 3 | 4 | 5
  color?: string
  width?: number
  height?: number
  top?: string
  right?: string
  left?: string
  bottom?: string
  opacity?: number
}

const paths = {
  1: 'M98 28c12 18 8 48-6 62s-40 18-58 6c-18-12-26-36-18-56s28-32 48-28 20 10 34 16z',
  2: 'M120 50c20 16 28 44 18 66-10 22-38 30-62 22s-34-30-26-54c8-24 28-50 50-48s8 4 20 14z',
  3: 'M80 20c24 8 40 28 36 52s-24 40-48 38c-24-2-42-22-40-46s16-52 40-48c8 2 8 4 12 4z',
  4: 'M140 30c18 12 34 32 28 56s-28 38-52 36c-24-2-48-20-50-44-2-24 16-42 38-48 14-4 10-8 36 0z',
  5: 'M60 15c20-8 44-4 56 14s12 44-2 62c-14 18-40 26-62 16s-32-32-24-54c8-22 22-30 32-38z',
}

export function DecoBlob({ variant = 1, color = 'var(--gold-dust)', width = 120, height = 120, top, right, left, bottom, opacity = 0.08 }: DecoBlobProps) {
  const floatClass = variant <= 3
    ? variant === 1 ? styles.float1 : variant === 2 ? styles.float2 : styles.float3
    : styles.float3

  return (
    <div className={`${styles.blob} ${floatClass}`} style={{ top, right, left, bottom, opacity }}>
      <svg width={width} height={height} viewBox="0 0 150 150" fill="none">
        <path d={paths[variant as keyof typeof paths]} fill={color} opacity="0.6" />
        <path d={paths[variant as keyof typeof paths]} fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" transform={`translate(2, 2)`} />
      </svg>
    </div>
  )
}
