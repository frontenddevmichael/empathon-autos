import styles from './DecoOrb.module.css'

interface DecoOrbProps {
  size?: number
  color?: string
  top?: string
  right?: string
  left?: string
  bottom?: string
  blur?: number
}

export function DecoOrb({ size = 300, color = 'rgba(180,140,100,0.08)', top, right, left, bottom, blur = 90 }: DecoOrbProps) {
  return (
    <div
      className={styles.orb}
      style={{
        width: size, height: size, top, right, left, bottom,
        background: `radial-gradient(circle at 40% 40%, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  )
}
