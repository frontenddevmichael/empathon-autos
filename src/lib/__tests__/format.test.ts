import { describe, it, expect } from 'vitest'
import { formatPrice, formatMileage } from '../format'

describe('formatPrice', () => {
  it('returns "Price on request" for zero', () => {
    expect(formatPrice(0)).toBe('Price on request')
  })

  it('returns "Price on request" for negative', () => {
    expect(formatPrice(-1000)).toBe('Price on request')
  })

  it('formats millions correctly', () => {
    expect(formatPrice(5500000)).toBe('₦5.5M')
    expect(formatPrice(1000000)).toBe('₦1.0M')
    expect(formatPrice(9999999)).toBe('₦10.0M')
  })

  it('formats thousands correctly', () => {
    expect(formatPrice(500000)).toBe('₦500,000')
    expect(formatPrice(1500000)).toBe('₦1.5M')
  })

  it('formats small amounts', () => {
    expect(formatPrice(100000)).toBe('₦100,000')
    expect(formatPrice(50000)).toBe('₦50,000')
  })
})

describe('formatMileage', () => {
  it('formats mileage with km suffix', () => {
    expect(formatMileage(0)).toBe('0 km')
    expect(formatMileage(15000)).toBe('15,000 km')
    expect(formatMileage(100000)).toBe('100,000 km')
  })

  it('handles large mileage', () => {
    expect(formatMileage(999999)).toBe('999,999 km')
  })
})
