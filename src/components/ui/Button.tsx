import type { ButtonHTMLAttributes, ReactNode, AnchorHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsButton = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type ButtonAsLink = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a'; href: string }

type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading,
    fullWidth,
    children,
    className = '',
    as,
    ...rest
  } = props as ButtonProps & { as?: 'button' | 'a' }

  const cls = [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    fullWidth ? styles.full : '',
    loading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ')

  if (as === 'a') {
    return <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  }

  return (
    <button className={cls} disabled={(rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled || loading} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  )
}
