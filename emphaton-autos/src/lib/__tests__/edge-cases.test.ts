import { describe, it, expect } from 'vitest'
import { formatPrice, formatMileage } from '@/lib/format'
import { isSupabaseConfigured } from '@/lib/supabase'

describe('Supabase configuration check', () => {
  it('isSupabaseConfigured is a function that returns a boolean', () => {
    // In test environment the result depends on whether .env is present
    const result = isSupabaseConfigured()
    expect(typeof result).toBe('boolean')
  })
})

describe('formatPrice edge cases', () => {
  it('handles very large numbers', () => {
    expect(formatPrice(999999999)).toBe('₦1000.0M')
  })

  it('handles NaN', () => {
    expect(formatPrice(NaN)).toBe('Price on request')
  })
})

describe('formatMileage edge cases', () => {
  it('handles very large numbers', () => {
    expect(formatMileage(999999)).toBe('999,999 km')
  })
})
