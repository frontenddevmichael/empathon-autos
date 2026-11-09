import type { CSSProperties, ReactNode } from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  label?: string
  title: ReactNode
  desc?: string
  align?: 'left' | 'center'
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean
  /** Optional decorative accent rendered between title and desc (e.g. a drawn flourish) */
  deco?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  style?: CSSProperties
}

const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg }

/**
 * The one section-heading pattern: quiet eyebrow, one confident headline,
 * optional supporting line. Never re-declare `.sectionLabel` / `.sectionTitle`
 * in a page module.
 */
export function SectionHeader({
  label,
  title,
  desc,
  align = 'left',
  size = 'md',
  dark,
  deco,
  as: Tag = 'h2',
  id,
  className = '',
  style,
}: SectionHeaderProps) {
  return (
    <div
      id={id}
      className={[
        styles.root,
        sizeClass[size],
        dark ? styles.dark : '',
        align === 'center' ? styles.center : '',
        className,
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {label && <p className={styles.label}>{label}</p>}
      <Tag className={styles.title}>{title}</Tag>
      {deco && <div className={styles.deco}>{deco}</div>}
      {desc && <p className={styles.desc}>{desc}</p>}
    </div>
  )
}
