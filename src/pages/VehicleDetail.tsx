import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatMileage, mileageLabel } from '@/lib/format'
import type { Vehicle, VehicleMedia, LeadType } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SpecTable, type SpecRow } from '@/components/ui/SpecTable'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { Container } from '@/components/layout/Container'
import { LeadForm } from '@/components/LeadForm'
import { config } from '@/lib/config'
import styles from './VehicleDetail.module.css'

type VehicleWithMedia = Vehicle & { media: VehicleMedia[] }

const statusBadge: Record<string, 'available' | 'pre-order' | 'sold' | 'draft' | 'live'> = {
  'walk-in': 'available', 'pre-order': 'pre-order', 'sold': 'sold',
  'in-auction': 'live', 'draft': 'draft', 'published': 'available',
}

const statusLabel: Record<string, string> = {
  'walk-in': 'Available',
  'pre-order': 'Pre-order',
  'sold': 'Sold',
  'in-auction': 'In auction',
  'draft': 'Coming soon',
  'published': 'Available',
}

const titleCase = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

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
      <Container className={styles.wrap}>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonFrame} />
          <div>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLineShort} />
            <div className={styles.skeletonLine} />
          </div>
        </div>
        <div className={styles.relatedGrid}>
          {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      </Container>
    )
  }

  if (error || !vehicle) {
    return (
      <Container className={styles.wrap}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Vehicle not found</h1>
          <p className={styles.notFoundText}>This vehicle may have been removed, or the link is wrong.</p>
          <Link to="/inventory"><Button>Browse inventory</Button></Link>
        </div>
      </Container>
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
  const specLine = [vehicle.year, mileageLabel(vehicle.mileage), titleCase(vehicle.transmission), titleCase(vehicle.fuel_type)]
    .filter(Boolean)
    .join(' · ')
  const whatsappMsg = `Hi, I'm interested in the ${vehicleAlt} at Empathon Autos.`

  const DEFAULT_IMG = '/og-image.jpg'
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.trim || ''} ${vehicle.year}`.trim()
  const vehicleDesc = vehicle.description?.slice(0, 200) || [vehicleTitle, formatPrice(vehicle.price), mileageLabel(vehicle.mileage), titleCase(vehicle.transmission)]
    .filter(Boolean)
    .join(', ')
  const vehicleImg = activeImage?.url || DEFAULT_IMG

  const specRows: (SpecRow | null)[] = [
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    vehicle.trim ? { label: 'Trim', value: vehicle.trim } : null,
    { label: 'Year', value: vehicle.year },
    vehicle.mileage > 0 ? { label: 'Mileage', value: formatMileage(vehicle.mileage) } : null,
    { label: 'Transmission', value: titleCase(vehicle.transmission) },
    { label: 'Fuel', value: titleCase(vehicle.fuel_type) },
    { label: 'Body', value: titleCase(vehicle.body_type) },
    vehicle.colour ? { label: 'Colour', value: vehicle.colour } : null,
    { label: 'Condition', value: titleCase(vehicle.condition) },
    { label: 'Status', value: statusLabel[vehicle.status] ?? titleCase(vehicle.status) },
  ]
  const specs = specRows.filter((row): row is SpecRow => row !== null)

  // Schema.org JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    'name': vehicleTitle,
    'description': vehicle.description || vehicleDesc,
    'image': vehicleImg,
    'url': `${config.seo.siteUrl}/inventory/${vehicle.id}`,
    'brand': { '@type': 'Brand', 'name': vehicle.make },
    'model': vehicle.model,
    'vehicleConfiguration': vehicle.trim || undefined,
    'modelDate': vehicle.year.toString(),
    ...(vehicle.mileage > 0 ? {
      'mileageFromOdometer': {
        '@type': 'QuantitativeValue',
        'value': vehicle.mileage,
        'unitCode': 'KMT',
      },
    } : {}),
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

      <article className={styles.page}>
        <Container className={styles.wrap}>
          <Link to="/inventory" className={styles.back}>
            <ArrowLeft size={14} /> All vehicles
          </Link>

          <div className={styles.body}>
            <div className={styles.gallery}>
              <div className={styles.frame}>
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={vehicleAlt}
                    className={styles.mainImage}
                    fetchPriority="high"
                  />
                ) : (
                  <div className={styles.noImage}>Photo coming soon</div>
                )}
                {images.length > 1 && (
                  <>
                    <button type="button" onClick={prevImage} className={`${styles.arrow} ${styles.arrowPrev}`} aria-label="Previous image">
                      <ChevronLeft size={20} />
                    </button>
                    <button type="button" onClick={nextImage} className={`${styles.arrow} ${styles.arrowNext}`} aria-label="Next image">
                      <ChevronRight size={20} />
                    </button>
                    <span className={styles.counter}>{activeImg + 1} / {images.length}</span>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className={styles.thumbs}>
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={i === activeImg ? styles.thumbOn : styles.thumb}
                      aria-label={`View image ${i + 1}`}
                      aria-pressed={i === activeImg}
                    >
                      <img src={img.url} alt="" className={styles.thumbImg} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className={styles.buy}>
              <div className={styles.buyHead}>
                <Badge variant={statusBadge[vehicle.status] || 'draft'} label={statusLabel[vehicle.status]} />
                <h1 className={styles.title}>{vehicle.make} {vehicle.model}</h1>
                <p className={styles.specLine}>{specLine}</p>
                <p className={styles.price}>{price}</p>
              </div>

              <div className={styles.actions}>
                <Button size="lg" onClick={() => setLeadType('enquiry')}>Enquire</Button>
                <a
                  href={config.whatsapp.getDeepLink(whatsappMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="lg">WhatsApp</Button>
                </a>
                {vehicle.status === 'pre-order' && (
                  <Button variant="ghost" size="lg" onClick={() => setLeadType('pre-order')}>Pre-order this vehicle</Button>
                )}
              </div>
              <button type="button" className={styles.textAction} onClick={() => setLeadType('test-drive')}>
                Book a test drive
              </button>
            </aside>

            <div className={styles.details}>
              {vehicle.description && <p className={styles.description}>{vehicle.description}</p>}

              {vehicle.features && vehicle.features.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Features</h2>
                  <ul className={styles.features}>
                    {vehicle.features.map((feature, i) => (
                      <li key={`${feature}-${i}`} className={styles.feature}>{feature}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Specifications</h2>
                <SpecTable rows={specs} />
              </section>
            </div>
          </div>

          {similar.length > 0 && (
            <section className={styles.related}>
              <h2 className={styles.relatedTitle}>More from {vehicle.make}</h2>
              <div className={styles.relatedGrid}>
                {similar.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            </section>
          )}
        </Container>

        {/* Mobile: price and the primary action stay within thumb reach */}
        <div className={styles.mobileBar}>
          <div>
            <p className={styles.mobilePrice}>{price}</p>
            <p className={styles.mobileMeta}>{[vehicle.year, mileageLabel(vehicle.mileage)].filter(Boolean).join(' · ')}</p>
          </div>
          <Button onClick={() => setLeadType('enquiry')}>Enquire</Button>
        </div>

        <LeadForm open={leadType !== null} onClose={() => setLeadType(null)} type={leadType ?? 'enquiry'} vehicleId={vehicle.id} />
      </article>
    </>
  )
}
