import { describe, it, expect } from 'vitest'
import { buildFacets, sortVehicles, type FacetSource } from '@/lib/inventory'

const row = (overrides: Partial<FacetSource>): FacetSource => ({
  make: 'Toyota',
  body_type: 'suv',
  fuel_type: 'petrol',
  transmission: 'automatic',
  condition: 'used',
  status: 'walk-in',
  year: 2018,
  ...overrides,
})

describe('buildFacets', () => {
  it('returns empty lists when there are no cars', () => {
    const facets = buildFacets([])
    expect(facets.makes).toEqual([])
    expect(facets.years).toEqual([])
  })

  it('dedupes makes and sorts them alphabetically', () => {
    const facets = buildFacets([
      row({ make: 'Toyota' }),
      row({ make: 'BMW' }),
      row({ make: 'Toyota' }),
      row({ make: 'Mercedes Benz' }),
    ])
    expect(facets.makes).toEqual(['BMW', 'Mercedes Benz', 'Toyota'])
  })

  it('lists years newest first without duplicates', () => {
    const facets = buildFacets([
      row({ year: 2014 }),
      row({ year: 2022 }),
      row({ year: 2014 }),
      row({ year: 2009 }),
    ])
    expect(facets.years).toEqual([2022, 2014, 2009])
  })

  it('keeps a single value, so the page can decide whether to show the facet', () => {
    const facets = buildFacets([row({}), row({})])
    expect(facets.fuels).toEqual(['petrol'])
    expect(facets.transmissions).toEqual(['automatic'])
  })
})

describe('sortVehicles', () => {
  const cars = [
    { id: 'a', price: 20000000, year: 2018 },
    { id: 'b', price: 0, year: 2022 },
    { id: 'c', price: 45000000, year: 2014 },
    { id: 'd', price: 0, year: 2010 },
    { id: 'e', price: 14350000, year: 2020 },
  ]

  it('leaves the server order alone for newest', () => {
    expect(sortVehicles(cars, 'newest').map(car => car.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('sorts price low to high and puts unquoted cars last', () => {
    expect(sortVehicles(cars, 'price-asc').map(car => car.id)).toEqual(['e', 'a', 'c', 'b', 'd'])
  })

  it('sorts price high to low and still puts unquoted cars last', () => {
    expect(sortVehicles(cars, 'price-desc').map(car => car.id)).toEqual(['c', 'a', 'e', 'b', 'd'])
  })

  it('sorts year newest first', () => {
    expect(sortVehicles(cars, 'year').map(car => car.id)).toEqual(['b', 'e', 'a', 'c', 'd'])
  })

  it('does not mutate the input', () => {
    const order = cars.map(car => car.id)
    sortVehicles(cars, 'price-asc')
    expect(cars.map(car => car.id)).toEqual(order)
  })
})
