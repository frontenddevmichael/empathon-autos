import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { Squiggle, HandCircle, HandDots } from '@/components/DecoSvgs'

interface HeroImage {
  url: string
  alt?: string
}

interface HeroSectionProps {
  images: HeroImage[]
  label?: string
  title: string
  subtitle?: string
  children?: ReactNode
  deco?: 'car' | 'dots' | 'circle' | 'none'
  gradient?: 'navy-to-right' | 'dark-to-right' | 'center-dark'
  className?: string
}

export function HeroSection({
  images,
  label,
  title,
  subtitle,
  children,
  deco = 'dots',
  gradient = 'navy-to-right',
  className = '',
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const nextImage = useCallback(() => setCurrentIndex(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const id = setInterval(nextImage, 5000)
    return () => clearInterval(id)
  }, [nextImage])

  const overlayGradient = gradient === 'dark-to-right'
    ? 'linear-gradient(to right, rgba(5,10,20,0.92) 0%, rgba(5,10,20,0.7) 40%, rgba(5,10,20,0.3) 70%, transparent 100%), linear-gradient(to top, rgba(5,10,20,0.4) 0%, transparent 40%)'
    : gradient === 'center-dark'
    ? 'linear-gradient(to right, rgba(12,30,58,0.85) 0%, rgba(12,30,58,0.5) 50%, rgba(12,30,58,0.85) 100%), linear-gradient(to top, rgba(12,30,58,0.3) 0%, transparent 40%)'
    : 'linear-gradient(to right, var(--navy) 0%, rgba(12,30,58,0.95) 30%, rgba(12,30,58,0.6) 55%, transparent 75%), linear-gradient(to top, rgba(12,30,58,0.4) 0%, transparent 40%)'

  return (
    <section className={`hero-root ${className}`} style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={img.alt || ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: gradient === 'center-dark' ? '100%' : '55%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0,
            opacity: i === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            maskImage: gradient === 'center-dark'
              ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
              : 'linear-gradient(to left, black 60%, transparent 100%)',
            WebkitMaskImage: gradient === 'center-dark'
              ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
              : 'linear-gradient(to left, black 60%, transparent 100%)',
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: overlayGradient,
        pointerEvents: 'none',
      }} />
      {deco === 'circle' && <HandCircle className="deco-positioned" style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.4 }} size={80} />}
      {deco === 'dots' && <HandDots className="deco-positioned" style={{ position: 'absolute', bottom: '18%', right: '15%', opacity: 0.5 }} />}
      {deco === 'car' && <HandCircle className="deco-positioned" style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.4 }} size={80} />}
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: '0 var(--space-4)',
        width: '100%',
        position: 'relative',
        zIndex: 2,
      }}>
        {label && (
          <p style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1-5)',
          }}>
            <span style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.2)' }} />
            {label}
          </p>
        )}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 800,
          letterSpacing: '-0.045em',
          lineHeight: 0.92,
          color: 'white',
          marginBottom: 'var(--space-2)',
          maxWidth: 700,
        }}>{title}</h1>
        <Squiggle style={{ marginTop: '-4px', marginBottom: 'var(--space-1)' }} />
        {subtitle && (
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: 460,
            lineHeight: 1.8,
            marginBottom: 'var(--space-4)',
          }}>{subtitle}</p>
        )}
        {children}
      </div>
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: 'var(--space-4)',
          zIndex: 3,
          display: 'flex',
          gap: 10,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Image ${i + 1}`}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                background: i === currentIndex ? 'white' : 'transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 300ms ease',
              }}
            />
          ))}
        </div>
      )}
      <div style={{
        height: 120,
        background: 'linear-gradient(to bottom, var(--navy) 0%, #1a2f4e 25%, #3a4f6e 50%, #8a9bb0 75%, var(--paper-light) 100%)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }} />
    </section>
  )
}
