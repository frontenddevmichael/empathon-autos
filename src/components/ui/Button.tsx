import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonBase {
  variant?: 'primary' | 'secondary' | 'ghost' | 'ghostLight' | 'white'
  size?: 'lg' | 'md' | 'sm'
  loading?: boolean
  fullWidth?: boolean
}

type ButtonAsButton = ButtonBase & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type ButtonAsLink = ButtonBase & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }

type ButtonProps = ButtonAsButton | ButtonAsLink

const sizeClass = { sm: 'sm', md: 'md', lg: 'lg' } as const

/**
 * The single button primitive.
 * Hover darkens, press scales to .98 — no ripple, no lift, no glow.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className = '', style, children, ...props }, ref) => {
    const cls = [
      styles.btn,
      styles[variant],
      styles[sizeClass[size]],
      loading ? styles.loading : '',
      fullWidth ? styles.full : '',
      className,
    ].filter(Boolean).join(' ')

    const inner = props.as === 'a'
      ? (() => {
          const { as: _, ...rest } = props as ButtonAsLink
          return (
            <a
              ref={ref as React.Ref<HTMLAnchorElement>}
              className={cls}
              style={style}
              {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {children}
            </a>
          )
        })()
      : (() => {
          const { as: _a, ...rest } = props as ButtonAsButton
          return (
            <button
              ref={ref as React.Ref<HTMLButtonElement>}
              className={cls}
              style={style}
              disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
              {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
            >
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {children}
            </button>
          )
        })()

    return inner
  }
)

Button.displayName = 'Button'
