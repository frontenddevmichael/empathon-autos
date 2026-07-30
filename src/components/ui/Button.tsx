import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonBase {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'sm'
  loading?: boolean
  fullWidth?: boolean
}

type ButtonAsButton = ButtonBase & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type ButtonAsLink = ButtonBase & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }

type ButtonProps = ButtonAsButton | ButtonAsLink

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className = '', style, children, ...props }, ref) => {
    const cls = [
      styles.btn,
      styles[variant],
      size === 'sm' ? styles.sm : '',
      loading ? styles.loading : '',
      fullWidth ? styles.full : '',
      className,
    ].filter(Boolean).join(' ')

    const combinedStyle = { ...style } as React.CSSProperties

    if (props.as === 'a') {
      const { as: _, ...rest } = props as ButtonAsLink
      return (
        <a ref={ref as any} className={cls} style={combinedStyle} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {loading && <span className={styles.spinner} />}
          {children}
        </a>
      )
    }

    const { as: _a, ...rest } = props as ButtonAsButton
    return (
      <button ref={ref as any} className={cls} style={combinedStyle} disabled={loading || (rest as any).disabled} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {loading && <span className={styles.spinner} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'