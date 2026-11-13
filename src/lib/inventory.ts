/**
 * Pure inventory helpers.
 *
 * Kept out of the page component so the facet and sort rules can be tested
 * without a database or a browser.
 */

export interface FacetSource {
  make: string
  body_type: string
  fuel_type: string
  transmission: string
  condition: string
  status: string
  year: number
}

export interface Facets {
  makes: string[]
  bodies: string[]
  fuels: string[]
  transmissions: string[]
  conditions: string[]
  statuses: string[]
  years: number[]
}

const EMPTY_FACETS: Facets = {
  makes: [],
  bodies: [],
  fuels: [],
  transmissions: [],
  conditions: [],
  statuses: [],
  years: [],
}

function uniq<T>(values: (T | null | undefined)[]): T[] {
  return [...new Set(values.filter((value): value is T => value != null))]
}

/**
 * Options are derived from the cars actually on the lot, so no chip can lead
 * to an empty result. Makes are alphabetical; years run newest first.
 */
export function buildFacets(rows: FacetSource[]): Facets {
  if (rows.length === 0) return { ...EMPTY_FACETS }
  return {
    makes: uniq(rows.map(row => row.make)).sort((a, b) => a.localeCompare(b)),
    bodies: uniq(rows.map(row => row.body_type)).sort((a, b) => a.localeCompare(b)),
    fuels: uniq(rows.map(row => row.fuel_type)).sort((a, b) => a.localeCompare(b)),
    transmissions: uniq(rows.map(row => row.transmission)).sort((a, b) => a.localeCompare(b)),
    conditions: uniq(rows.map(row => row.condition)).sort((a, b) => a.localeCompare(b)),
    statuses: uniq(rows.map(row => row.status)).sort((a, b) => a.localeCompare(b)),
    years: uniq(rows.map(row => row.year)).sort((a, b) => b - a),
  }
}

/**
 * Price and mileage of 0 mean "not quoted yet", so they always sort after real
 * values, whichever direction is chosen.
 */
export function sortVehicles<T extends { price: number; year: number }>(list: T[], sort: string): T[] {
  if (sort === 'newest') return list
  const sorted = [...list]
  if (sort === 'year') sorted.sort((a, b) => b.year - a.year)
  if (sort === 'price-asc' || sort === 'price-desc') {
    const direction = sort === 'price-asc' ? 1 : -1
    sorted.sort((a, b) => {
      const aPrice = a.price > 0 ? a.price : null
      const bPrice = b.price > 0 ? b.price : null
      if (aPrice === null && bPrice === null) return 0
      if (aPrice === null) return 1
      if (bPrice === null) return -1
      return (aPrice - bPrice) * direction
    })
  }
  return sorted
}
