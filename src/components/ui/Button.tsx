import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import styles from './Button.module.css'
import { Magnetic } from '@/components/Magnetic'

interface ButtonBase {
  variant?: 'primary' | 'secondary' | 'ghost' | 'ghostLight' | 'white'
  size?: 'lg' | 'md' | 'sm'
  loading?: boolean
  fullWidth?: boolean
  magnetic?: boolean
}

type ButtonAsButton = ButtonBase & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type ButtonAsLink = ButtonBase & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }

type ButtonProps = ButtonAsButton | ButtonAsLink

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, magnetic, className = '', style, children, ...props }, ref) => {
    const cls = [
      styles.btn,
      styles[variant],
      size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
      loading ? styles.loading : '',
      fullWidth ? styles.full : '',
      className,
    ].filter(Boolean).join(' ')

    const combinedStyle = { ...style } as React.CSSProperties

    const inner = props.as === 'a'
      ? (() => {
          const { as: _, ...rest } = props as ButtonAsLink
          return (
            <a ref={ref as any} className={cls} style={combinedStyle} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
              {loading && <span className={styles.spinner} />}
              {children}
            </a>
          )
        })()
      : (() => {
          const { as: _a, ...rest } = props as ButtonAsButton
          return (
            <button ref={ref as any} className={cls} style={combinedStyle} disabled={loading || (rest as any).disabled} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
              {loading && <span className={styles.spinner} />}
              {children}
            </button>
          )
        })()

    if (magnetic && !loading && !fullWidth) {
      return <Magnetic>{inner}</Magnetic>
    }
    return inner
  }
)

Button.displayName = 'Button'