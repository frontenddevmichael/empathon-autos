import { describe, it, expect } from 'vitest'
import { validateReference, lookupOrder, ORDER_STAGES } from '@/lib/mockOrders'

describe('validateReference', () => {
  it('accepts valid EA-XXXXXX references', () => {
    expect(validateReference('EA-202418')).toBe(true)
    expect(validateReference('EA-000001')).toBe(true)
    expect(validateReference('EA-999999')).toBe(true)
  })

  it('accepts lowercase and whitespace-tolerant input', () => {
    expect(validateReference('  ea-123456  ')).toBe(true)
    expect(validateReference('ea-202418')).toBe(true)
  })

  it('rejects wrong length', () => {
    expect(validateReference('EA-12345')).toBe(false)
    expect(validateReference('EA-1234567')).toBe(false)
    expect(validateReference('EA-2024-0718')).toBe(false)
  })

  it('rejects wrong prefix and non-digit characters', () => {
    expect(validateReference('EB-123456')).toBe(false)
    expect(validateReference('XYZ-123456')).toBe(false)
    expect(validateReference('EA-12345A')).toBe(false)
    expect(validateReference('EA-abcdef')).toBe(false)
  })

  it('rejects empty input', () => {
    expect(validateReference('')).toBe(false)
    expect(validateReference('   ')).toBe(false)
  })
})

describe('lookupOrder determinism', () => {
  it('returns null for invalid references', () => {
    expect(lookupOrder('nope')).toBeNull()
    expect(lookupOrder('EA-123')).toBeNull()
  })

  it('same reference produces identical results', () => {
    const a = lookupOrder('EA-202418')
    const b = lookupOrder('EA-202418')
    expect(a).toEqual(b)
  })

  it('every valid reference resolves to an order', () => {
    for (let i = 0; i < 1000; i++) {
      const ref = `EA-${String(i).padStart(6, '0')}`
      expect(lookupOrder(ref)).not.toBeNull()
    }
  })
})

describe('lookupOrder stage distribution', () => {
  it('stage index stays within 0..4', () => {
    for (let i = 0; i < 500; i++) {
      const ref = `EA-${String(i * 7).padStart(6, '0')}`
      const order = lookupOrder(ref)
      expect(order).not.toBeNull()
      expect(order!.stageIndex).toBeGreaterThanOrEqual(0)
      expect(order!.stageIndex).toBeLessThan(ORDER_STAGES.length)
    }
  })

  it('derives the correct stage label from the stage index', () => {
    const refs = ['EA-000006', 'EA-000007', 'EA-000008', 'EA-000009', 'EA-000010']
    refs.forEach(ref => {
      const order = lookupOrder(ref)
      expect(order).not.toBeNull()
      expect(order!.stage).toBe(ORDER_STAGES[order!.stageIndex])
    })
  })
})
