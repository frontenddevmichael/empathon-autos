import type { ReactNode } from 'react'

interface SplitHeadingProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  style?: React.CSSProperties
}

export function SplitHeading({ children, className, as: Tag = 'h2', style }: SplitHeadingProps) {
  if (typeof children !== 'string') {
    return <Tag className={className} style={style}>{children}</Tag>
  }
  return (
    <Tag className={className} style={style}>
      {children.split(' ').map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <span
            className="split-text-reveal"
            style={{ animationDelay: `${i * 80}ms`, display: 'inline-block' }}
          >
            {word}{i < children.split(' ').length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}
