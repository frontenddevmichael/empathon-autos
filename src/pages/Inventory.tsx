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
import { buildFacets, sortVehicles, type Facets, type FacetSource } from '@/lib/inventory'
import styles from './Inventory.module.css'
import { config } from '@/lib/config'

const PAGE_SIZE = 12
const MAX_WITH_FILTERS = 200

const BODY_LABELS: Record<string, string> = {
  sedan: 'Sedan', suv: 'SUV', hatchback: 'Hatchback', coupe: 'Coupe',
  pickup: 'Pickup', truck: 'Truck', wagon: 'Wagon', van: 'Van',
  convertible: 'Convertible',
}
const CONDITION_LABELS: Record<string, string> = {
  new: 'New', used: 'Used', 'certified-pre-owned': 'Certified pre-owned',
}
const STATUS_LABELS: Record<string, string> = {
  'walk-in': 'In stock', 'pre-order': 'Pre-order', reserved: 'Reserved',
}
const YEAR_RANGES = [
  { value: '2024-2026', label: '2024-2026' },
  { value: '2022-2023', label: '2022-2023' },
  { value: '2020-2021', label: '2020-2021' },
  { value: '2018-2019', label: '2018-2019' },
  { value: '2015-2017', label: '2015-2017' },
  { value: '0-2014', label: '2014 & older' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest listed' },
  { value: 'year', label: 'Year: newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

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
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [facets, setFacets] = useState<Facets>({ makes: [], bodies: [], fuels: [], transmissions: [], conditions: [], statuses: [], years: [] })

  const hasAnyFilter = Boolean(make || bodyType || statusFilter || fuelType || transmission || condition || yearRange || search)
  const activeFilterCount = [make, bodyType, statusFilter, fuelType, transmission, condition, yearRange].filter(Boolean).length
  // Sorting price or year has to happen after the fetch, so pull the full set
  // (bounded by MAX_WITH_FILTERS) instead of one page.
  const maxResults = hasAnyFilter || sort !== 'newest' ? MAX_WITH_FILTERS : PAGE_SIZE

  // Facet options come from the cars on the lot, so a chip never leads to zero results.
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let active = true
    ;(async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('make,body_type,fuel_type,transmission,condition,status,year')
        .neq('status', 'sold')
        .neq('status', 'draft')
      if (!active || !data) return
      setFacets(buildFacets(data as FacetSource[]))
    })()
    return () => { active = false }
  }, [])

  // Reset pagination when filters change
  useEffect(() => { setLoadedAll(false) }, [search, make, bodyType, statusFilter, fuelType, transmission, condition, yearRange, sort])

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

        const { data, count } = await q.order('created_at', { ascending: false }).range(from, to)
        if (!mounted.current) return
        const rows = (data ?? []) as unknown as (Vehicle & { media: VehicleMedia[] })[]
        if (append) {
          setVehicles(prev => sortVehicles([...prev, ...rows], sort))
        } else {
          setVehicles(sortVehicles(rows, sort))
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
  }, [search, make, bodyType, statusFilter, fuelType, transmission, condition, yearRange, sort])

  const clearAll = () => {
    setSearch(''); setMake(''); setBodyType(''); setStatusFilter('')
    setFuelType(''); setTransmission(''); setCondition('')
    setYearRange(''); setSearchParams({})
  }
  const hasMore = !loadedAll && vehicles.length < total

  // Active filters as removable chips in the bar, so the state is always visible
  const activeChips = [
    make && { key: 'make', label: make, clear: () => setMake('') },
    bodyType && { key: 'body', label: BODY_LABELS[bodyType] ?? capitalise(bodyType), clear: () => setBodyType('') },
    statusFilter && { key: 'status', label: STATUS_LABELS[statusFilter] ?? capitalise(statusFilter), clear: () => setStatusFilter('') },
    transmission && { key: 'transmission', label: capitalise(transmission), clear: () => setTransmission('') },
    fuelType && { key: 'fuel', label: capitalise(fuelType), clear: () => setFuelType('') },
    condition && { key: 'condition', label: CONDITION_LABELS[condition] ?? capitalise(condition.replace(/-/g, ' ')), clear: () => setCondition('') },
    yearRange && { key: 'year', label: YEAR_RANGES.find(y => y.value === yearRange)?.label ?? yearRange, clear: () => setYearRange('') },
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => Boolean(chip))

  // Only facets with a real choice behind them. A field where every car shares
  // one value (fuel, transmission, condition today) is not a filter.
  const yearOptions = YEAR_RANGES.filter(range => {
    const [minYear, maxYear] = range.value.split('-').map(Number)
    return facets.years.some(year => year >= minYear && year <= maxYear)
  })
  const facetConfigs = [
    { key: 'make', label: 'Make', value: make, onChange: setMake, options: facets.makes.map(m => ({ value: m, label: m })) },
    { key: 'body', label: 'Body', value: bodyType, onChange: setBodyType, options: facets.bodies.map(b => ({ value: b, label: BODY_LABELS[b] ?? capitalise(b) })) },
    { key: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: facets.statuses.map(s => ({ value: s, label: STATUS_LABELS[s] ?? capitalise(s) })) },
    { key: 'transmission', label: 'Transmission', value: transmission, onChange: setTransmission, options: facets.transmissions.map(t => ({ value: t, label: capitalise(t) })) },
    { key: 'year', label: 'Year', value: yearRange, onChange: setYearRange, options: yearOptions },
    { key: 'fuel', label: 'Fuel', value: fuelType, onChange: setFuelType, options: facets.fuels.map(f => ({ value: f, label: capitalise(f) })) },
    { key: 'condition', label: 'Condition', value: condition, onChange: setCondition, options: facets.conditions.map(c => ({ value: c, label: CONDITION_LABELS[c] ?? capitalise(c.replace(/-/g, ' ')) })) },
  ].filter(facet => facet.options.length > 1)

  return (
    <>
      <PageHero
        variant="band"
        size="sm"
        align="center"
        label="Inventory"
        title="Browse our collection"
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
            <label className={styles.sortWrap}>
              <span className="sr-only">Sort by</span>
              <select
                className={styles.sort}
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
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
            {facetConfigs.map(facet => (
              <Facet
                key={facet.key}
                label={facet.label}
                options={facet.options}
                value={facet.value}
                onChange={facet.onChange}
              />
            ))}
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
