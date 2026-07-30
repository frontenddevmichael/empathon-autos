import { describe, it, expect } from 'vitest'
import { formatPrice, formatMileage } from '../format'

describe('formatPrice', () => {
  it('returns "Price on request" for zero', () => {
    expect(formatPrice(0)).toBe('Price on request')
  })

  it('returns "Price on request" for negative', () => {
    expect(formatPrice(-5000)).toBe('Price on request')
  })

  it('formats millions correctly', () => {
    expect(formatPrice(5500000)).toBe('₦5.5M')
    expect(formatPrice(1200000)).toBe('₦1.2M')
  })

  it('formats values below 1M with comma separation', () => {
    expect(formatPrice(500000)).toBe('₦500,000')
    expect(formatPrice(15000)).toBe('₦15,000')
  })

  it('formats edge case at exactly 1M', () => {
    expect(formatPrice(1000000)).toBe('₦1.0M')
  })

  it('formats small values', () => {
    expect(formatPrice(500)).toBe('₦500')
    expect(formatPrice(1)).toBe('₦1')
  })
})

describe('formatMileage', () => {
  it('formats zero km', () => {
    expect(formatMileage(0)).toBe('0 km')
  })

  it('formats regular mileage with commas', () => {
    expect(formatMileage(45000)).toBe('45,000 km')
    expect(formatMileage(120000)).toBe('120,000 km')
  })

  it('formats small mileage', () => {
    expect(formatMileage(500)).toBe('500 km')
  })
})
