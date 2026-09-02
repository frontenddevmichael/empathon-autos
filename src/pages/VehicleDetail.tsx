import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SeoHead } from '@/components/SeoHead'
import { getVehicleById, getSimilarVehicles } from '@/lib/queries'
import type { Vehicle, VehicleMedia, LeadType } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SpecTable } from '@/components/ui/SpecTable'
import { LeadForm } from '@/components/LeadForm'
import { Section } from '@/components/PageLayout'
import { ScrollReveal } from '@/components/ScrollReveal'
import { STATUS_TO_BADGE } from '@/lib/constants'
import styles from './VehicleDetail.module.css'

type VehicleWithMedia = Vehicle & { media: VehicleMedia[] }

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<VehicleWithMedia | null>(null)
  const [similar, setSimilar] = useState<VehicleWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [leadType, setLeadType] = useState<LeadType | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getVehicleById(id).then(v => {
      if (v) {
        setVehicle(v)
        getSimilarVehicles(v.make, id).then(setSimilar).catch(() => {})
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Section>
        <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--radius-lg)', aspectRatio: '16/9', marginBottom: 'var(--space-3)' }} />
        <div style={{ height: 32, width: '40%', background: 'var(--border)', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 20, width: '30%', background: 'var(--border)', borderRadius: 8 }} />
      </Section>
    )
  }

  if (!vehicle) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h2>Not found</h2>
          <p style={{ marginBottom: 'var(--space-2)' }}>This vehicle may have been removed.</p>
          <Link to="/inventory"><Button>Browse Inventory</Button></Link>
        </div>
      </Section>
    )
  }

  const images = vehicle.media?.filter(m => m.type === 'image') ?? []
  const activeImage = images[activeImg - 1] ?? images[activeImg] ?? images[0]
  const price = vehicle.price > 0 ? `₦${(vehicle.price / 1_000_000).toFixed(1)}M` : 'Price on request'
  const vehicleAlt = `${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} ${vehicle.year}`

  return (
    <>
      <SeoHead title={`${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} ${vehicle.year}`} description={vehicle.description?.slice(0, 160) || `${vehicle.make} ${vehicle.model} — ${vehicle.mileage.toLocaleString()} km, ${vehicle.transmission}`} />
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {activeImage ? (
            <img src={activeImage.url} alt={vehicleAlt} className={styles.heroImage} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--paper-warm)' }} />
          )}
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <Link to="/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.4)', marginBottom: 'var(--space-1)' }}>
            <ArrowLeft size={12} /> Back to Inventory
          </Link>            <Badge variant={STATUS_TO_BADGE[vehicle.status] || 'draft'} />
          <h1 className={styles.heroTitle}>{vehicle.make} {vehicle.model}</h1>
          {vehicle.trim && <p className={styles.heroSub}>{vehicle.trim} &middot; {vehicle.year}</p>}
          <p className={styles.heroPrice}>{price}</p>
        </div>
      </section>

      <Section>
        {images.length > 1 && (
          <div className={styles.thumbs}>
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveImg(i)} aria-label={`View ${i + 1} of ${images.length}`} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
                <img src={img.url} alt={`${vehicleAlt} view ${i + 1}`} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`} loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className={styles.layout}>
          <div>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Mileage</span>
                <span className={`${styles.metaValue} tabular-nums`}>{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Transmission</span>
                <span className={`${styles.metaValue} capitalize`}>{vehicle.transmission}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Fuel</span>
                <span className={`${styles.metaValue} capitalize`}>{vehicle.fuel_type}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Condition</span>
                <span className={`${styles.metaValue} capitalize`}>{vehicle.condition}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Colour</span>
                <span className={`${styles.metaValue} capitalize`}>{vehicle.colour}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Body</span>
                <span className={`${styles.metaValue} capitalize`}>{vehicle.body_type}</span>
              </div>
            </div>

            {vehicle.description && (
              <div className={styles.descBlock}>
                <h3>About this vehicle</h3>
                <p>{vehicle.description}</p>
              </div>
            )}

            {vehicle.features && vehicle.features.length > 0 && (
              <div className={styles.descBlock}>
                <h3>Features</h3>
                <div className={styles.featureGrid}>
                  {vehicle.features.map((f, i) => <span key={i} className={styles.featureChip}>{f}</span>)}
                </div>
              </div>
            )}

            <div className={styles.specs}>
              <h3>Specifications</h3>
              <SpecTable specs={{
                make: vehicle.make, model: vehicle.model, trim: vehicle.trim,
                year: vehicle.year, mileage: `${vehicle.mileage.toLocaleString()} km`,
                transmission: vehicle.transmission, fuel_type: vehicle.fuel_type,
                colour: vehicle.colour, body_type: vehicle.body_type,
                condition: vehicle.condition, status: vehicle.status,
              }} />
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div style={{ padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
              <p className="tabular-nums" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>{price}</p>
              <p style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
                {vehicle.mileage.toLocaleString()} km &middot; {vehicle.year} &middot; {vehicle.make}
              </p>
              <div className={styles.ctas}>
                <Button onClick={() => setLeadType('enquiry')}>Enquire Now</Button>
                <Button variant="secondary" onClick={() => setLeadType('test-drive')}>Book Test Drive</Button>
                {vehicle.status === 'pre-order' && <Button variant="secondary" onClick={() => setLeadType('pre-order')}>Pre-Order</Button>}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <ScrollReveal>
            <div style={{ marginTop: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Similar Vehicles</h3>
              <div style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {similar.map(v => {
                  const img = v.media?.find(m => m.is_primary) ?? v.media?.[0]
                  return (
                    <Link key={v.id} to={`/inventory/${v.id}`} style={{ display: 'block', padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
                      {img && <img src={img.url} alt={`${v.make} ${v.model} ${v.trim || ''} ${v.year}`.trim()} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} loading="lazy" />}
                      <p style={{ fontWeight: 600, marginTop: 8 }}>{v.make} {v.model}</p>
                      <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', color: 'var(--clay-deep)', fontWeight: 600 }}>{v.price > 0 ? `₦${(v.price / 1_000_000).toFixed(1)}M` : 'Price on request'}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        <LeadForm open={leadType !== null} onClose={() => setLeadType(null)} type={leadType ?? 'enquiry'} vehicleId={vehicle.id} />
      </Section>
    </>
  )
}
