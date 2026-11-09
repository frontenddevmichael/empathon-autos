import type { CSSProperties, ElementType, ReactNode } from 'react'
import { Container, type ContainerSize } from './Container'
import styles from './Section.module.css'

export type SectionTone = 'paper' | 'warm' | 'navy' | 'deep' | 'transparent'
export type SectionSpace = 'none' | 'sm' | 'md' | 'lg'

interface SectionProps {
  children: ReactNode
  tone?: SectionTone
  space?: SectionSpace
  /** Wrap children in a Container. Pass false for full-bleed layouts. */
  contained?: boolean
  containerSize?: ContainerSize
  as?: ElementType
  className?: string
  style?: CSSProperties
  id?: string
}

const toneClass: Record<SectionTone, string> = {
  paper: styles.paper,
  warm: styles.warm,
  navy: styles.navy,
  deep: styles.deep,
  transparent: styles.transparent,
}

const spaceClass: Record<SectionSpace, string> = {
  none: styles.spaceNone,
  sm: styles.spaceSm,
  md: styles.spaceMd,
  lg: styles.spaceLg,
}

/**
 * A page section: tone, vertical rhythm and container width in one place.
 * Replaces the per-page `.section` / `.sectionInner` pairs.
 */
export function Section({
  children,
  tone = 'paper',
  space = 'md',
  contained = true,
  containerSize = 'default',
  as: Tag = 'section',
  className = '',
  style,
  id,
}: SectionProps) {
  const cls = [styles.section, toneClass[tone], spaceClass[space], className].filter(Boolean).join(' ')
  return (
    <Tag id={id} className={cls} style={style}>
      {contained ? <Container size={containerSize}>{children}</Container> : children}
    </Tag>
  )
}
