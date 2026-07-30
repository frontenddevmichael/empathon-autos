import { useState } from 'react'

interface ImageWithBlurProps {
  src: string
  alt: string
  aspectRatio?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Image component that shows a low-quality blur placeholder while loading,
 * then crossfades to the full image.
 */
export function ImageWithBlur({ src, alt, aspectRatio = '4/3', className, style }: ImageWithBlurProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio,
          background: 'var(--paper-warm)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--stone-light)',
          fontSize: 'var(--text-sm)',
          ...style,
        }}
        className={className}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        aspectRatio,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--paper-warm)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      className={className}
    >
      {/* Blur placeholder */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, var(--paper-warm) 0%, var(--paper-light) 100%)`,
            animation: 'shimmer 1.5s ease-in-out infinite',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {/* Full image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(1.03)',
          transition: 'opacity 500ms var(--ease-out), transform 600ms var(--ease-out)',
        }}
      />
    </div>
  )
}

/**
 * Avatar-sized image with circle crop and blur loading.
 */
export function AvatarWithBlur({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--navy-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--navy)',
          fontWeight: 700,
          fontSize: size * 0.35,
          fontFamily: 'var(--font-display)',
        }}
        aria-label={alt}
      >
        {alt.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--paper-warm)',
        flexShrink: 0,
      }}
    >
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--paper-warm)',
          animation: 'shimmer 1.5s ease-in-out infinite',
          backgroundSize: '200% 100%',
        }} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 400ms var(--ease-out)',
        }}
      />
    </div>
  )
}
