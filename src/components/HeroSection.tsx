import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { Squiggle, HandCircle, HandDots, CarSilhouette } from '@/components/DecoSvgs'
import { SplitHeading } from '@/components/SplitHeading'

interface HeroImage {
  url: string
  alt?: string
}

interface HeroSectionProps {
  images: HeroImage[]
  label?: string
  title: string | ReactNode
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
  const sectionRef = useRef<HTMLElement>(null)
  const [parallax, setParallax] = useState({ zoom: 1, rise: 0, fade: 1 })

  useEffect(() => {
    const id = setInterval(nextImage, 5000)
    return () => clearInterval(id)
  }, [nextImage])

  // Scroll parallax — images zoom/blur and the hero peels away as you scroll down
  useEffect(() => {
    let frame: number
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = sectionRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const scrolled = -rect.top
        if (scrolled <= 0) {
          setParallax({ zoom: 1, rise: 0, fade: 1 })
          return
        }
        const max = Math.min(500, rect.height * 0.4)
        const t = Math.min(1, scrolled / max)
        setParallax({
          zoom: 1 + t * 0.18,
          rise: t * 160,
          fade: Math.max(0, 1 - t),
        })
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [])

  const isCenterDark = gradient === 'center-dark'

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{
        minHeight: '100vh',
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Full-width crossfading background images */}
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={img.alt || ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
          style={{
            position: 'absolute',
            top: -50,
            left: 0,
            width: '100%',
            height: 'calc(100% + 100px)',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0,
            opacity: i === currentIndex ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            transform: `translateY(${parallax.rise * 0.4}px) scale(${parallax.zoom})`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: isCenterDark
            ? 'linear-gradient(to right, rgba(12,30,58,0.85) 0%, rgba(12,30,58,0.5) 50%, rgba(12,30,58,0.85) 100%), linear-gradient(to top, rgba(12,30,58,0.3) 0%, transparent 40%)'
            : 'linear-gradient(to right, var(--navy) 0%, rgba(12,30,58,0.92) 35%, rgba(12,30,58,0.5) 65%, transparent 100%), linear-gradient(to top, rgba(12,30,58,0.4) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />

      {/* Noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.025,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }}
      />

      {/* Empathon logo watermark */}
      <img
        src="/Empathon logo.png"
        alt=""
        width="180"
        height="180"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '4%',
          zIndex: 2,
          opacity: 0.07,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }}
      />

      {/* Decorative elements */}
      {deco === 'circle' && (
        <HandCircle
          style={{ position: 'absolute', top: '12%', right: '8%', opacity: 0.35, zIndex: 2 }}
          size={80}
        />
      )}
      {deco === 'dots' && (
        <HandDots
          style={{ position: 'absolute', bottom: '18%', right: '15%', opacity: 0.4, zIndex: 2 }}
        />
      )}
      {deco === 'car' && (
        <CarSilhouette
          style={{ position: 'absolute', bottom: '10%', left: '6%', opacity: 0.08, zIndex: 2 }}
          size={160}
        />
      )}

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '0 var(--space-4)',
          width: '100%',
          transform: `translateY(${parallax.rise}px)`,
          opacity: parallax.fade,
          willChange: 'transform, opacity',
        }}
      >
        {label && (
          <p
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1-5)',
              animation: 'fadeInDown 600ms var(--ease-out) forwards',
            }}
          >
            <span style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.2)' }} />
            {label}
          </p>
        )}

        {typeof title === 'string' ? (
          <SplitHeading
            as="h1"
            style={{
              color: 'white',
              marginBottom: 'var(--space-2)',
              maxWidth: 700,
              animation: 'fadeInUp 600ms 150ms var(--ease-out) both',
            }}
          >
            {title}
          </SplitHeading>
        ) : (
          title
        )}

        <div style={{ animation: 'fadeInUp 600ms 250ms var(--ease-out) both' }}>
          <Squiggle />
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 460,
              lineHeight: 1.8,
              marginBottom: 'var(--space-4)',
              animation: 'fadeInUp 600ms 350ms var(--ease-out) both',
            }}
          >
            {subtitle}
          </p>
        )}

        <div style={{ animation: 'fadeInUp 600ms 450ms var(--ease-out) both' }}>
          {children}
        </div>
      </div>

      {/* Image dot indicators */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: 'var(--space-4)',
            zIndex: 3,
            display: 'flex',
            gap: 10,
          }}
        >
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
                transition: 'all 300ms var(--ease-out)',
              }}
            />
          ))}
        </div>
      )}

    </section>
  )
}
