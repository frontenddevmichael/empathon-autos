import { useState } from 'react'

interface OptImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  style?: React.CSSProperties
}

export function OptImage({ src, alt, className, loading = 'lazy', style }: OptImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        className={className}
        style={{
          background: 'var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          ...style,
        }}
        aria-label={alt || 'No image available'}
      >
        No image
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setError(true)}
      style={style}
    />
  )
}
