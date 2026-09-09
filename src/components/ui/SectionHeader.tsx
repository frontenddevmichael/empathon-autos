import type { CSSProperties, ReactNode } from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  label?: string
  title: string
  desc?: string
  align?: 'left' | 'center'
  dark?: boolean
  /** Optional decorative accent rendered between title and desc (e.g. a drawn flourish) */
  deco?: ReactNode
  className?: string
  style?: CSSProperties
}

export function SectionHeader({ label, title, desc, align = 'left', dark, deco, className = '', style }: SectionHeaderProps) {
  return (
    <div
      className={`${styles.root} ${dark ? styles.dark : ''} ${align === 'center' ? styles.center : ''} ${className}`}
      style={style}
    >
      {label && <p className={styles.label}>{label}</p>}
      <h2 className={styles.title}>{title}</h2>
      {deco && <div className={styles.deco}>{deco}</div>}
      {desc && <p className={styles.desc}>{desc}</p>}
    </div>
  )
}
