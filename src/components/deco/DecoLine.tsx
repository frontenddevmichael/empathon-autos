import styles from './DecoLine.module.css'

interface DecoLineProps {
  width?: number
  height?: number
  top?: string
  right?: string
  left?: string
  bottom?: string
  color?: string
}

export function DecoLine({ width = 200, height = 2, top, right, left, bottom, color = 'var(--gold-dust)' }: DecoLineProps) {
  return (
    <div className={styles.line} style={{ width, height, top, right, left, bottom }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line
          x1="0" y1={height / 2} x2={width} y2={height / 2}
          stroke={color} strokeWidth={height} strokeDasharray="8 4"
          className={`${styles.svgLine} ${styles.shimmer}`}
        />
      </svg>
    </div>
  )
}

export function DecoCurve({ width = 300, height = 100, top, right, left, bottom, color = 'var(--gold-dust)' }: DecoLineProps) {
  return (
    <div className={styles.line} style={{ width, height, top, right, left, bottom }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} fill="none">
        <path
          d={`M 0 ${height} Q ${width * 0.25} 0, ${width * 0.5} ${height * 0.5} T ${width} ${height * 0.3}`}
          stroke={color} strokeWidth="1.5" fill="none" opacity="0.3"
          strokeDasharray="4 6"
          className={styles.shimmer}
        />
      </svg>
    </div>
  )
}
