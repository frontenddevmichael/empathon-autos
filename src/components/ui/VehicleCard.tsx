import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types'
import { formatPrice } from '@/lib/format'
import { Badge } from './Badge'
import { Card } from './Card'

const statusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  'walk-in': 'available', 'pre-order': 'pre-order', 'sold': 'sold',
  'in-auction': 'live', 'draft': 'draft', 'published': 'available',
}

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const img = vehicle.media?.find(m => m.is_primary) ?? vehicle.media?.[0]

  return (
    <Link to={`/inventory/${vehicle.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <Card hoverable style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Image container with overlay gradient */}
        <div style={{ aspectRatio: '4/3', background: 'var(--paper-warm)', overflow: 'hidden', position: 'relative' }}>
          {img && !imgError ? (
            <>
              {!imgLoaded && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, var(--paper-warm) 0%, var(--paper) 100%)',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                  backgroundSize: '200% 100%',
                }} />
              )}
              <img
                src={img.url}
                alt={`${vehicle.make} ${vehicle.model} ${vehicle.trim || ''} ${vehicle.year}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 600ms var(--ease-out), opacity 400ms var(--ease-out)',
                  opacity: imgLoaded ? 1 : 0,
                  transform: imgLoaded ? 'scale(1)' : 'scale(1.05)',
                }}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              {/* Premium overlay gradient on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,51,102,0.4) 0%, transparent 60%)',
                opacity: 0,
                transition: 'opacity 400ms var(--ease-out)',
                pointerEvents: 'none',
              }} className="card-overlay" />
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--stone-light)', fontSize: 'var(--text-sm)',
              background: 'linear-gradient(135deg, var(--paper-warm) 0%, var(--paper-light) 100%)',
            }}>
              <svg width="40" height="40" viewBox="0 0 80 36" fill="none" aria-hidden="true" style={{ opacity: 0.3 }}>
                <path d="M 6 26 Q 4 26 4 22 Q 4 18 12 18 Q 18 12 26 10 Q 34 8 46 8 Q 54 8 60 12 Q 66 14 72 18 Q 74 20 74 22 Q 74 26 70 26 L 6 26 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.04" opacity="0.3" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: 4 }}>
            <Badge variant={statusBadge[vehicle.status] || 'draft'} />
          </div>
          <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 2, color: 'var(--ink)' }}>
            {vehicle.make} {vehicle.model}
          </p>
          {vehicle.trim && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', marginBottom: 4 }}>{vehicle.trim}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--navy)' }}>
              {formatPrice(vehicle.price)}
            </p>
            {vehicle.year && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone-light)' }}>{vehicle.year}</p>
            )}
          </div>
        </div>

        {/* Premium hover border accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2,
          background: 'var(--navy)',
          transform: 'scaleX(0)',
          transition: 'transform 500ms var(--ease-out)',
          transformOrigin: 'left',
          opacity: 0.3,
        }} className="card-accent" />

        <style>{`
          .card-overlay {
            transition: opacity 400ms var(--ease-out) !important;
          }
          a:hover .card-overlay {
            opacity: 1 !important;
          }
          a:hover .card-accent {
            transform: scaleX(1) !important;
          }
        `}</style>
      </Card>
    </Link>
  )
}
