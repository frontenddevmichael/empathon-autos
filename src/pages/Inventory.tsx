import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { PageHero } from '@/components/ui/PageHero'
import { Container } from '@/components/layout/Container'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './Inventory.module.css'
import { config } from '@/lib/config'

const PAGE_SIZE = 12
const MAX_WITH_FILTERS = 200

const MAKES = ['All Makes', 'Toyota', 'Honda', 'Mercedes Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai', 'Nissan', 'Audi', 'Porsche', 'Volkswagen']
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

interface FacetProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

function Facet({ label, options, value, onChange }: FacetProps) {
  return (
    <div className={styles.facet} role="group" aria-label={label}>
      <span className={styles.facetLabel}>{label}</span>
      <div className={styles.chips}>
        {/* No "All" pill: unfiltered is the absence of a choice, not a choice.
            Removing a filter happens on its chip in the bar above. */}
        {options.filter(option => option.value !== '').map(option => (
          <button
            key={option.value || 'all'}
            type="button"
            aria-pressed={value === option.value}
            className={value === option.value ? styles.chipOn : styles.chip}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

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
  const [filtersOpen, setFiltersOpen] = useState(false)

  const hasAnyFilter = Boolean(make || bodyType || statusFilter || fuelType || transmission || condition || yearRange || priceRange || mileageRange || search)
  const activeFilterCount = [make, bodyType, statusFilter, fuelType, transmission, condition, yearRange, priceRange, mileageRange].filter(Boolean).length
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
          // `0-2014` is a valid range — 0 is falsy, so test for a number, not truthiness.
          if (Number.isFinite(minYear) && Number.isFinite(maxYear)) {
            q = q.gte('year', minYear).lte('year', maxYear)
          }
        }

        // Parse price range
        if (priceRange) {
          const [minPrice, maxPrice] = priceRange.split('-').map(Number)
          if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
            q = q.gte('price', minPrice).lte('price', maxPrice)
          }
        }

        // Parse mileage range
        if (mileageRange) {
          const [minMileage, maxMileage] = mileageRange.split('-').map(Number)
          if (Number.isFinite(minMileage) && Number.isFinite(maxMileage)) {
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

  // Active filters as removable chips in the bar, so the state is always visible
  const activeChips = [
    make && { key: 'make', label: make, clear: () => setMake('') },
    bodyType && { key: 'body', label: BODY_TYPES.find(b => b.value === bodyType)?.label ?? bodyType, clear: () => setBodyType('') },
    statusFilter && { key: 'status', label: STATUS_OPTIONS.find(s => s.value === statusFilter)?.label ?? statusFilter, clear: () => setStatusFilter('') },
    transmission && { key: 'transmission', label: TRANSMISSIONS.find(t => t.value === transmission)?.label ?? transmission, clear: () => setTransmission('') },
    fuelType && { key: 'fuel', label: FUEL_TYPES.find(f => f.value === fuelType)?.label ?? fuelType, clear: () => setFuelType('') },
    condition && { key: 'condition', label: condition.replace(/-/g, ' '), clear: () => setCondition('') },
    yearRange && { key: 'year', label: YEAR_RANGES.find(y => y.value === yearRange)?.label ?? yearRange, clear: () => setYearRange('') },
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => Boolean(chip))

  return (
    <>
      <PageHero
        variant="band"
        size="sm"
        align="center"
        label="Inventory"
        title="Browse Our Collection"
        subtitle="Real cars. Real prices. Ready to drive."
      />

      <Container className={styles.content}>
        <div className={styles.bar}>
          <div className={styles.barRow}>
            <div className={styles.searchInput}>
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search make or model"
                aria-label="Search vehicles"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(open => !open)}
              className={filtersOpen ? styles.filterButtonOpen : styles.filterButton}
              aria-expanded={filtersOpen}
              aria-controls="inventory-filters"
            >
              {filtersOpen ? 'Hide filters' : 'Filters'}
              {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
            </button>
            <p className={styles.resultCount}>
              {loading ? 'Loading' : `${total} ${total === 1 ? 'vehicle' : 'vehicles'}`}
            </p>
          </div>

          {activeChips.length > 0 && (
            <div className={styles.activeRow}>
              {activeChips.map(chip => (
                <button key={chip.key} type="button" onClick={chip.clear} className={styles.activeChip}>
                  {chip.label}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              <button type="button" onClick={clearAll} className={styles.clearAll}>Clear all</button>
            </div>
          )}
        </div>

        {filtersOpen && (
          <div id="inventory-filters" className={styles.panel}>
            <Facet label="Make" options={MAKES.map(m => ({ value: m === 'All Makes' ? '' : m, label: m }))} value={make} onChange={setMake} />
            <Facet label="Body" options={BODY_TYPES} value={bodyType} onChange={setBodyType} />
            <Facet label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            <Facet label="Transmission" options={TRANSMISSIONS} value={transmission} onChange={setTransmission} />
            <Facet label="Year" options={YEAR_RANGES} value={yearRange} onChange={setYearRange} />
            <Facet label="Fuel" options={FUEL_TYPES} value={fuelType} onChange={setFuelType} />
            <Facet label="Condition" options={CONDITIONS} value={condition} onChange={setCondition} />
          </div>
        )}

        <p className={styles.gridCount}>
          {loading ? 'Loading' : `${total} ${total === 1 ? 'vehicle' : 'vehicles'}`}
        </p>

        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
          ) : vehicles.length === 0 ? (
            <EmptyState
              className={styles.emptyState}
              title="No vehicles found"
              message={hasAnyFilter
                ? 'Try widening the search or clearing a couple of filters. There may be more to see.'
                : "We're restocking the lot. Tell us what you're after and we'll hunt it down."}
              action={hasAnyFilter
                ? <Button variant="secondary" size="sm" onClick={clearAll}>Clear all filters</Button>
                : <Link to="/pre-order"><Button size="sm" variant="secondary">Request a vehicle</Button></Link>}
            />
          ) : (
            vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)
          )}
        </div>

        {hasMore && !loading && (
          <div className={styles.more}>
            <Button variant="secondary" onClick={() => fetchVehicles(true)} loading={loading}>
              Load more
            </Button>
          </div>
        )}

        <div className={styles.help}>
          <div>
            <p className={styles.helpTitle}>Can&rsquo;t find what you&rsquo;re looking for?</p>
            <p className={styles.helpText}>
              Tell us the spec you want and we&rsquo;ll source it, or message us on WhatsApp for a quick answer.
            </p>
          </div>
          <div className={styles.helpActions}>
            <Link to="/contact"><Button>Send an enquiry</Button></Link>
            <a
              href={config.whatsapp.getDeepLink('Hi Empathon Autos! I need help finding a vehicle.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary">WhatsApp us</Button>
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
