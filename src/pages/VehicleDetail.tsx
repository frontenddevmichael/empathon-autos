import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatMileage } from '@/lib/format'
import type { Vehicle, VehicleMedia, LeadType } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LeadForm } from '@/components/LeadForm'
import { Section } from '@/components/PageLayout'
import { SteeringWheel, Speedometer, CarSilhouette } from '@/components/DecoSvgs'
import { config } from '@/lib/config'
import styles from './VehicleDetail.module.css'

type VehicleWithMedia = Vehicle & { media: VehicleMedia[] }

const statusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  'walk-in': 'available', 'pre-order': 'pre-order', 'sold': 'sold',
  'in-auction': 'live', 'draft': 'draft', 'published': 'available',
}

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<VehicleWithMedia | null>(null)
  const [similar, setSimilar] = useState<VehicleWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [leadType, setLeadType] = useState<LeadType | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    ;(async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('vehicles').select('*, media:vehicle_media(*)').eq('id', id).single()
        if (fetchErr || !data) { setError(true); setLoading(false); return }
        const v = data as unknown as VehicleWithMedia
        setVehicle(v)
        const images = v.media?.filter(m => m.type === 'image') ?? []
        const primaryIdx = images.findIndex(m => m.is_primary)
        setActiveImg(primaryIdx >= 0 ? primaryIdx : 0)
        const { data: similarData } = await supabase.from('vehicles')
          .select('*, media:vehicle_media(*)')
          .eq('make', v.make).neq('id', id).neq('status', 'sold').limit(3)
        if (similarData) setSimilar(similarData as unknown as VehicleWithMedia[])
      } catch {
        setError(true)
      }
      setLoading(false)
    })()
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

  if (error || !vehicle) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h2>Vehicle not found</h2>
          <p style={{ marginBottom: 'var(--space-2)', color: 'var(--stone)' }}>This vehicle may have been removed or the link is incorrect.</p>
          <Link to="/inventory"><Button>Browse Inventory</Button></Link>
        </div>
      </Section>
    )
  }

  const images = vehicle.media?.filter(m => m.type === 'image') ?? []
  const activeImage = images[activeImg] ?? images[0]
  const prevImage = () => {
    if (images.length < 2) return
    setActiveImg(i => (i - 1 + images.length) % images.length)
  }
  const nextImage = () => {
    if (images.length < 2) return
    setActiveImg(i => (i + 1) % images.length)
  }
  const price = formatPrice(vehicle.price)
  const vehicleAlt = `${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} ${vehicle.year}`
  const whatsappMsg = `Hi, I'm interested in the ${vehicleAlt} at Empathon Autos.`

  const DEFAULT_IMG = '/og-image.jpg'
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.trim || ''} ${vehicle.year}`.trim()
  const vehicleDesc = vehicle.description?.slice(0, 200) || `${vehicleTitle} — ${formatPrice(vehicle.price)}, ${formatMileage(vehicle.mileage)}, ${vehicle.transmission}`
  const vehicleImg = activeImage?.url || DEFAULT_IMG

  // Schema.org JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    'name': vehicleTitle,
    'description': vehicle.description || vehicleDesc,
    'image': vehicleImg,
    'url': `${config.seo.siteUrl}/inventory/${vehicle.id}`,
    'brand': {
      '@type': 'Brand',
      'name': vehicle.make,
    },
    'model': vehicle.model,
    'vehicleConfiguration': vehicle.trim || undefined,
    'modelDate': vehicle.year.toString(),
    'mileageFromOdometer': {
      '@type': 'QuantitativeValue',
      'value': vehicle.mileage,
      'unitCode': 'KMT',
    },
    'vehicleTransmission': vehicle.transmission === 'automatic' ? 'Automatic' : vehicle.transmission === 'manual' ? 'Manual' : 'Semi-automatic',
    'fuelType': vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1).replace('-', ' '),
    'vehicleColor': vehicle.colour || undefined,
    'bodyType': vehicle.body_type.charAt(0).toUpperCase() + vehicle.body_type.slice(1),
    'vehicleCondition': vehicle.condition === 'new' ? 'New' : vehicle.condition === 'used' ? 'Used' : 'CertifiedPreOwned',
    'offers': {
      '@type': 'Offer',
      'price': vehicle.price,
      'priceCurrency': vehicle.currency,
      'availability': vehicle.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      'seller': {
        '@type': 'AutoDealer',
        'name': config.company.name,
        'url': config.seo.siteUrl,
      },
    },
  }

  return (
    <>
      <Helmet>
        <title>{vehicleTitle} | {config.company.name}</title>
        <meta name="description" content={vehicleDesc} />
        <meta property="og:title" content={`${vehicleTitle} | ${config.company.name}`} />
        <meta property="og:description" content={vehicleDesc} />
        <meta property="og:image" content={vehicleImg} />
        <meta property="og:url" content={`${config.seo.siteUrl}/inventory/${vehicle.id}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={`${vehicleTitle} | ${config.company.name}`} />
        <meta name="twitter:description" content={vehicleDesc} />
        <meta name="twitter:image" content={vehicleImg} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${config.seo.siteUrl}/inventory/${vehicle.id}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Helmet>
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {activeImage ? (
            <img src={activeImage.url} alt={vehicleAlt} className={styles.heroImage} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--paper-warm)' }} />
          )}
          <div className={styles.heroOverlay} />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className={styles.heroArrow} style={{ left: 'var(--space-3)' }} aria-label="Previous image">
                <ChevronLeft size={22} />
              </button>
              <button onClick={nextImage} className={styles.heroArrow} style={{ right: 'var(--space-3)' }} aria-label="Next image">
                <ChevronRight size={22} />
              </button>
              <span className={styles.imageCounter}>{activeImg + 1} / {images.length}</span>
            </>
          )}
        </div>
        <div className={styles.heroContent}>
          <Link to="/inventory" className={styles.heroBack}>
            <ArrowLeft size={12} /> Back to Inventory
          </Link>
          <Badge variant={statusBadge[vehicle.status] || 'draft'} />
          <h1 className={styles.heroTitle}>{vehicle.make} {vehicle.model}</h1>
          {vehicle.trim && <p className={styles.heroSub}>{vehicle.trim} &middot; {vehicle.year}</p>}
          <p className={`${styles.heroPrice} tabular-nums`}>{price}</p>
        </div>
      </section>

      <Section style={{ position: 'relative' }}>
        <SteeringWheel className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.03 }} size={72} />
        <Speedometer className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', left: 'var(--space-3)', opacity: 0.03 }} size={56} />
        <CarSilhouette className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-1)', right: 'var(--space-3)', opacity: 0.02 }} size={80} />
        {images.length > 1 && (
          <div className={styles.thumbs}>
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                <img src={img.url} alt={`${vehicleAlt} view ${i + 1}`} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`} loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Mileage</span>
                <span className={`${styles.metaValue} tabular-nums`}>{formatMileage(vehicle.mileage)}</span>
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
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {Object.entries({
                  Make: vehicle.make, Model: vehicle.model, Trim: vehicle.trim || '—',
                  Year: vehicle.year, Mileage: formatMileage(vehicle.mileage),
                  Transmission: vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1),
                  'Fuel Type': vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.replace('-', ' ').slice(1),
                  Colour: vehicle.colour || '—',
                  'Body Type': vehicle.body_type.charAt(0).toUpperCase() + vehicle.body_type.slice(1),
                  Condition: vehicle.condition.replace('-', ' '),
                  Status: vehicle.status.replace('-', ' '),
                }).map(([key, val], i) => (
                  <div key={key} style={{ display: 'flex', padding: 'var(--space-1-5) var(--space-2)', background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderBottom: i < 10 ? '1px solid var(--border-light)' : 'none' }}>
                    <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{key}</span>
                    <span className="tabular-nums" style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div style={{ padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
              <p className="tabular-nums" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>{price}</p>
              <p style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
                {formatMileage(vehicle.mileage)} &middot; {vehicle.year} &middot; {vehicle.make}
              </p>
              <div className={styles.ctas}>
                <Button onClick={() => setLeadType('enquiry')}>Enquire Now</Button>
                <Button variant="secondary" onClick={() => setLeadType('test-drive')}>Book Test Drive</Button>
                {vehicle.status === 'pre-order' && <Button variant="secondary" onClick={() => setLeadType('pre-order')}>Pre-Order</Button>}
                <a
                  href={config.whatsapp.getDeepLink(whatsappMsg)}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)', height: 40, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500, border: '1px solid var(--border)', color: 'var(--ink)', transition: 'all var(--transition-fast)' }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Similar Vehicles</h3>
            <div className={styles.similarGrid}>
              {similar.map(v => {
                const img = v.media?.find(m => m.is_primary) ?? v.media?.[0]
                return (
                  <Link key={v.id} to={`/inventory/${v.id}`} style={{ display: 'block', padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', transition: 'border-color var(--transition-fast), transform var(--transition-fast)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy-light)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
                  >
                    {img && <img src={img.url} alt={`${v.make} ${v.model} ${v.trim || ''} ${v.year}`.trim()} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} loading="lazy" />}
                    <p style={{ fontWeight: 600, marginTop: 8 }}>{v.make} {v.model}</p>
                    <p className="tabular-nums" style={{ fontSize: 'var(--text-sm)', color: 'var(--navy)', fontWeight: 600 }}>{formatPrice(v.price)}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <LeadForm open={leadType !== null} onClose={() => setLeadType(null)} type={leadType ?? 'enquiry'} vehicleId={vehicle.id} />
      </Section>
    </>
  )
}
