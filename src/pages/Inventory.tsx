import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { X, MessageCircle, HelpCircle, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { CarSilhouette, Sparkle, Compass, ChatBubble } from '@/components/DecoSvgs'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './Inventory.module.css'
import { RippleButton } from '@/components/RippleButton'
import { config } from '@/lib/config'

const PAGE_SIZE = 12
const MAX_WITH_FILTERS = 200

const MAKES = ['All Makes', 'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai', 'Nissan', 'Audi', 'Porsche', 'Volkswagen']
const BODY_TYPES = [
  { value: '', label: 'All Body Types' },
  { value: 'sedan', label: 'Sedan' }, { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' }, { value: 'coupe', label: 'Coupe' },
  { value: 'pickup', label: 'Pickup' }, { value: 'truck', label: 'Truck' },
  { value: 'wagon', label: 'Wagon' }, { value: 'van', label: 'Van' },
]
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'walk-in', label: 'In Stock' }, { value: 'pre-order', label: 'Pre-Order' },
]
const FUEL_TYPES = [
  { value: '', label: 'All Fuel Types' },
  { value: 'petrol', label: 'Petrol' }, { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' }, { value: 'hybrid', label: 'Hybrid' },
]
const TRANSMISSIONS = [
  { value: '', label: 'All Transmissions' },
  { value: 'automatic', label: 'Automatic' }, { value: 'manual', label: 'Manual' },
]
const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'new', label: 'New' }, { value: 'used', label: 'Used' },
  { value: 'certified-pre-owned', label: 'Certified Pre-Owned' },
]
const YEAR_RANGES = [
  { value: '', label: 'All Years' },
  { value: '2024-2026', label: '2024-2026 (Newest)' },
  { value: '2022-2023', label: '2022-2023' },
  { value: '2020-2021', label: '2020-2021' },
  { value: '2018-2019', label: '2018-2019' },
  { value: '2015-2017', label: '2015-2017' },
  { value: '0-2014', label: '2014 & Older' },
]


export function Inventory() {
  const mounted = useMounted()
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [loadedAll, setLoadedAll] = useState(false)
  const [search, setSearch] = useState('')
  const [make, setMake] = useState(searchParams.get('make') || '')
  const [bodyType, setBodyType] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [fuelType, setFuelType] = useState('')
  const [transmission, setTransmission] = useState('')
  const [condition, setCondition] = useState('')
  const [yearRange, setYearRange] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [mileageRange, setMileageRange] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const hasAnyFilter = make || bodyType || statusFilter || fuelType || transmission || condition || yearRange || priceRange || mileageRange || search
  const activeFilterCount = [make, bodyType, statusFilter, fuelType, transmission, condition, yearRange, priceRange, mileageRange, search].filter(Boolean).length
  const maxResults = hasAnyFilter ? MAX_WITH_FILTERS : PAGE_SIZE

  // Reset pagination when filters change
  useEffect(() => { setLoadedAll(false) }, [search, make, bodyType, statusFilter, fuelType, transmission, condition, yearRange, priceRange, mileageRange])

  const fetchVehicles = (append: boolean) => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    ;(async () => {
      try {
        const from = append ? vehicles.length : 0
        const to = from + maxResults - 1
        let q = supabase.from('vehicles').select('*, media:vehicle_media(*)', { count: 'exact' })
          .neq('status', 'sold').neq('status', 'draft')
        
        if (search) q = q.or(`make.ilike.%${search}%,model.ilike.%${search}%,trim.ilike.%${search}%`)
        if (make) q = q.eq('make', make)
        if (bodyType) q = q.eq('body_type', bodyType)
        if (statusFilter) q = q.eq('status', statusFilter)
        if (fuelType) q = q.eq('fuel_type', fuelType)
        if (transmission) q = q.eq('transmission', transmission)
        if (condition) q = q.eq('condition', condition)
        
        // Parse year range
        if (yearRange) {
          const [minYear, maxYear] = yearRange.split('-').map(Number)
          if (minYear && maxYear) {
            q = q.gte('year', minYear).lte('year', maxYear)
          }
        }
        
        // Parse price range
        if (priceRange) {
          const [minPrice, maxPrice] = priceRange.split('-').map(Number)
          if (minPrice && maxPrice) {
            q = q.gte('price', minPrice).lte('price', maxPrice)
          }
        }
        
        // Parse mileage range
        if (mileageRange) {
          const [minMileage, maxMileage] = mileageRange.split('-').map(Number)
          if (minMileage && maxMileage) {
            q = q.gte('mileage', minMileage).lte('mileage', maxMileage)
          }
        }
        
        const { data, count } = await q.order('created_at', { ascending: false }).range(from, to)
        if (!mounted.current) return
        if (append && data) {
          setVehicles(prev => [...prev, ...(data as unknown as (Vehicle & { media: VehicleMedia[] })[])])
        } else if (data) {
          setVehicles(data as unknown as (Vehicle & { media: VehicleMedia[] })[])
        }
        if (count !== null) {
          setTotal(count)
          if (data && data.length < maxResults) setLoadedAll(true)
        }
      } catch (err) {
        console.error('[Inventory] Failed to load vehicles:', err)
      }
      if (mounted.current) setLoading(false)
    })()
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    fetchVehicles(false)
  }, [search, make, bodyType, statusFilter, fuelType, transmission, condition, yearRange, priceRange, mileageRange])

  const clearAll = () => {
    setSearch(''); setMake(''); setBodyType(''); setStatusFilter('')
    setFuelType(''); setTransmission(''); setCondition('')
    setYearRange(''); setPriceRange(''); setMileageRange('')
    setSearchParams({})
  }
  const hasMore = !loadedAll && vehicles.length < total

  return (
    <>
      <header className={styles.slimHeader}>
        <div className={styles.slimHeaderInner}>
          <p className={styles.slimHeaderLabel} style={{ animation: 'fadeInUp 600ms var(--ease-out) both' }}>Inventory</p>
          <h1 className={styles.slimHeaderTitle} style={{ animation: 'fadeInUp 600ms 120ms var(--ease-out) both' }}>Browse Our Collection</h1>
          <p className={styles.slimHeaderSub} style={{ animation: 'fadeInUp 600ms 240ms var(--ease-out) both' }}>Real cars. Real prices. Ready to drive.</p>
        </div>
      </header>

      <div className={styles.content} style={{ position: 'relative' }}>
      <div className={`scroll-reveal reveal-fade ${styles.toolbar}`}>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by make, model, or trim..." />
          </div>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
            className={styles.filterToggle}
          >
            <SlidersHorizontal size={14} />
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
          </button>
          {hasAnyFilter && (
            <button onClick={clearAll} className={styles.clearBtn}>
              <X size={12} /> Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ''}
            </button>
          )}
        </div>

        {/* Basic Filters */}
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Make</span>
            <select
              value={make}
              onChange={e => setMake(e.target.value)}
              className={styles.filterSelect}
              aria-label="Filter by make"
            >
              {MAKES.map(m => (
                <option key={m} value={m === 'All Makes' ? '' : m}>{m}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Body</span>
            <select
              value={bodyType}
              onChange={e => setBodyType(e.target.value)}
              className={styles.filterSelect}
              aria-label="Filter by body type"
            >
              {BODY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Status</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Transmission</span>
            <select
              value={transmission}
              onChange={e => setTransmission(e.target.value)}
              className={styles.filterSelect}
              aria-label="Filter by transmission"
            >
              {TRANSMISSIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className={`${styles.filterRow} ${styles.advancedFilters}`}>
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Year</span>
              <select
                value={yearRange}
                onChange={e => setYearRange(e.target.value)}
                className={styles.filterSelect}
                aria-label="Filter by year"
              >
                {YEAR_RANGES.map(y => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Fuel</span>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value)}
                className={styles.filterSelect}
                aria-label="Filter by fuel type"
              >
                {FUEL_TYPES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Condition</span>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className={styles.filterSelect}
                aria-label="Filter by condition"
              >
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <p className={styles.resultCount}>
          Showing {vehicles.length} of {total} vehicle{total !== 1 ? 's' : ''}
          {hasAnyFilter && ' — filters active'}
        </p>
      )}

      <CarSilhouette className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-1)', left: 'var(--space-1)', opacity: 0.03 }} size={100} />
      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
        ) : vehicles.length === 0 ? (
          <EmptyState
            className={styles.emptyState}
            art="search"
            title="No vehicles found"
            message={hasAnyFilter
              ? 'Try widening your search or clearing a few filters — there may be more to see.'
              : "We're restocking the lot. Tell us what you're after and we'll hunt it down."}
            action={hasAnyFilter
              ? <Button variant="secondary" size="sm" onClick={clearAll}>Clear all filters</Button>
              : <Link to="/pre-order"><RippleButton size="sm" variant="secondary">Request a Vehicle</RippleButton></Link>}
          />
        ) : (
          vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => fetchVehicles(true)}
            loading={loading}
          >
            <ChevronDown size={14} style={{ marginRight: 4 }} />
            Load More ({total - vehicles.length} remaining)
          </Button>
        </div>
      )}

      {/* ── Need Help? Lead CTA ── */}
      <div className={`scroll-reveal ${styles.leadCta}`}>
        <div className={styles.leadCtaInner}>
          <Compass className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', opacity: 0.06 }} size={60} />
          <ChatBubble className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-3)', opacity: 0.05 }} size={50} />
          <Sparkle className="deco-positioned" style={{ position: 'absolute', top: 'var(--space-3)', right: '20%', opacity: 0.08 }} size={28} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <p className={styles.leadCtaLabel}>Can't find what you're looking for?</p>
              <p className={styles.leadCtaDesc}>
                Tell us your preferences and we'll source the perfect vehicle for you —
                or reach out on WhatsApp for a quick chat with our team.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-1-5)', flexWrap: 'wrap' }}>
              <Link to="/contact">
                <RippleButton variant="primary" size="md">
                  <HelpCircle size={15} style={{ marginRight: 4 }} />
                  Send Enquiry
                </RippleButton>
              </Link>
              <a
                href={config.whatsapp.getDeepLink("Hi Empathon Autos! I need help finding a vehicle.")}
                target="_blank" rel="noopener noreferrer"
              >
                <RippleButton variant="secondary" size="md">
                  <MessageCircle size={15} style={{ marginRight: 4 }} />
                  WhatsApp Us
                </RippleButton>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
