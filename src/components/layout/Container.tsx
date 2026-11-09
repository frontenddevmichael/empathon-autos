import type { ElementType, ReactNode } from 'react'
import styles from './Container.module.css'

export type ContainerSize = 'default' | 'narrow' | 'wide' | 'full'

interface ContainerProps {
  children: ReactNode
  size?: ContainerSize
  as?: ElementType
  className?: string
  id?: string
}

const sizeClass: Record<ContainerSize, string> = {
  default: styles.default,
  narrow: styles.narrow,
  wide: styles.wide,
  full: styles.full,
}

/**
 * Horizontal rhythm for every section.
 * One max-width + one gutter, so pages never re-invent their own padding.
 */
export function Container({ children, size = 'default', as: Tag = 'div', className = '', id }: ContainerProps) {
  const cls = [styles.container, sizeClass[size], className].filter(Boolean).join(' ')
  return <Tag id={id} className={cls}>{children}</Tag>
}
