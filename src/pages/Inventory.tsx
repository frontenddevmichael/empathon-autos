import { useEffect, useState } from 'react'
import { SeoHead } from '@/components/SeoHead'
import { Input } from '@/components/ui/Input'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { Section } from '@/components/PageLayout'
import { ScrollReveal } from '@/components/ScrollReveal'
import { getInventory, type InventoryFilters } from '@/lib/queries'
import type { Vehicle, VehicleMedia } from '@/types'
import { MAKES, BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, CONDITIONS } from '@/lib/constants'
import styles from './Inventory.module.css'

const PAGE_SIZE = 12
const PAGE_STEP = 12

function FilterLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.filterLink} ${active ? styles.filterLinkActive : ''}`}
    >
      {label}
    </button>
  )
}

export function Inventory() {
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [make, setMake] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [transmission, setTransmission] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [condition, setCondition] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const hasAnyFilter = [make, bodyType, transmission, fuelType, condition].some(Boolean)

  useEffect(() => {
    setLoading(true)
    const filters: InventoryFilters = { search, make, bodyType, transmission, fuelType, condition }
    getInventory(filters, { from: 0, to: hasAnyFilter ? 199 : visibleCount - 1 })
      .then(({ vehicles, total }) => {
        setVehicles(vehicles)
        setTotal(total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, make, bodyType, transmission, fuelType, condition, visibleCount, hasAnyFilter])

  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, make, bodyType, transmission, fuelType, condition])

  const hasMore = !hasAnyFilter && total > visibleCount

  return (
    <Section>
      <SeoHead title="Inventory" description="Browse our collection of premium vehicles available for purchase, pre-order, and auction in Nigeria." />
      <div className={styles.heading}>
        <h2>Browse the Collection</h2>
        <p style={{ color: 'var(--stone)' }}>
          {loading ? 'Searching...' : `${total} vehicle${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.searchField}>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              aria-label="Search vehicles"
            />
          </div>

          <div style={{ marginTop: 'var(--space-2)' }}>
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Make</span>
              <div className={styles.filterGroupItems}>
                {MAKES.map(m => <FilterLink key={m} label={m} active={make === m} onClick={() => setMake(make === m ? '' : m)} />)}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Body Type</span>
              <div className={styles.filterGroupItems}>
                {BODY_TYPES.map(t => <FilterLink key={t.value} label={t.label} active={bodyType === t.value} onClick={() => setBodyType(bodyType === t.value ? '' : t.value)} />)}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Transmission</span>
              <div className={styles.filterGroupItems}>
                {TRANSMISSIONS.map(t => <FilterLink key={t.value} label={t.label} active={transmission === t.value} onClick={() => setTransmission(transmission === t.value ? '' : t.value)} />)}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Fuel</span>
              <div className={styles.filterGroupItems}>
                {FUEL_TYPES.map(f => <FilterLink key={f.value} label={f.label} active={fuelType === f.value} onClick={() => setFuelType(fuelType === f.value ? '' : f.value)} />)}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Condition</span>
              <div className={styles.filterGroupItems}>
                {CONDITIONS.map(c => <FilterLink key={c.value} label={c.label} active={condition === c.value} onClick={() => setCondition(condition === c.value ? '' : c.value)} />)}
              </div>
            </div>

            {hasAnyFilter && (
              <button className={styles.clearBtn} onClick={() => { setMake(''); setBodyType(''); setTransmission(''); setFuelType(''); setCondition('') }}>
                Clear all
              </button>
            )}
          </div>
        </aside>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className={styles.empty}>
              <p>No vehicles match these filters.</p>
              <button onClick={() => { setSearch(''); setMake(''); setBodyType(''); setTransmission(''); setFuelType(''); setCondition('') }} className={styles.clearBtn}>
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {vehicles.map((v, i) => (
                  <ScrollReveal key={v.id} delay={i * 60}>
                    <VehicleCard vehicle={v} />
                  </ScrollReveal>
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                  <button className={styles.clearBtn} onClick={() => setVisibleCount(c => c + PAGE_STEP)}>
                    Load more ({total - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  )
}
