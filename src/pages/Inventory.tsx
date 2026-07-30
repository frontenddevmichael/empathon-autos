import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { X, MessageCircle, Search, HelpCircle, ChevronDown } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useMounted } from '@/hooks/useMounted'
import type { Vehicle, VehicleMedia } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { HeroSection } from '@/components/HeroSection'
import { CarSilhouette, Sparkle, Compass, ChatBubble } from '@/components/DecoSvgs'
import styles from './Inventory.module.css'
import { RippleButton } from '@/components/RippleButton'

const PAGE_SIZE = 12
const MAX_WITH_FILTERS = 200

const MAKES = ['All Makes', 'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai', 'Nissan']
const BODY_TYPES = [
  { value: '', label: 'All Body Types' },
  { value: 'sedan', label: 'Sedan' }, { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' }, { value: 'coupe', label: 'Coupe' },
  { value: 'pickup', label: 'Pickup' }, { value: 'truck', label: 'Truck' },
]
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'walk-in', label: 'In Stock' }, { value: 'pre-order', label: 'Pre-Order' },
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

  const hasAnyFilter = make || bodyType || statusFilter || search
  const activeFilterCount = [make, bodyType, statusFilter, search].filter(Boolean).length
  const maxResults = hasAnyFilter ? MAX_WITH_FILTERS : PAGE_SIZE

  // Reset pagination when filters change
  useEffect(() => { setLoadedAll(false) }, [search, make, bodyType, statusFilter])

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
  }, [search, make, bodyType, statusFilter])

  const clearAll = () => { setSearch(''); setMake(''); setBodyType(''); setStatusFilter(''); setSearchParams({}) }
  const hasMore = !loadedAll && vehicles.length < total

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=90&fit=crop' },
        ]}
        label="Inventory"
        title="Browse Our Collection"
        subtitle="Real cars. Real prices. Ready to drive."
        deco="car"
      />

      <div className={styles.content} style={{ position: 'relative' }}>
      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by make, model, or trim..." />
          </div>
          {hasAnyFilter && (
            <button onClick={clearAll} className={styles.clearBtn}>
              <X size={12} /> Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ''}
            </button>
          )}
        </div>

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
        </div>
      </div>

      {!loading && total > 0 && (
        <p className={styles.resultCount}>
          Showing {vehicles.length} of {total} vehicle{total !== 1 ? 's' : ''}
          {hasAnyFilter && ' — filters active'}
        </p>
      )}

      <CarSilhouette className="deco-positioned" style={{ position: 'absolute', bottom: 'var(--space-1)', left: 'var(--space-1)', opacity: 0.03 }} size={100} />
      <div className={`scroll-reveal stagger-fade-in ${styles.grid}`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
        ) : vehicles.length === 0 ? (
          <div className={styles.empty} style={{ gridColumn: '1 / -1' }}>
            <Search size={28} style={{ color: 'var(--stone-light)', marginBottom: 'var(--space-1)' }} />
            <p>No vehicles match these criteria.</p>
            <button onClick={clearAll} style={{ color: 'var(--navy)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginTop: 'var(--space-1)' }}>Clear all filters</button>
          </div>
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
                href="https://wa.me/2348023392388?text=Hi%20Empathon%20Autos!%20I%20need%20help%20finding%20a%20vehicle."
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
