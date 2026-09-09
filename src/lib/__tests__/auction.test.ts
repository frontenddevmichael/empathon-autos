import { describe, it, expect } from 'vitest'
import { computeBidIncrement, getLotDeadline, shouldExtend, firstName, SEVERITY_META, GRADE_META } from '@/lib/auction'

describe('computeBidIncrement', () => {
  it('honors an explicit override', () => {
    expect(computeBidIncrement(85_000_000, 2_000_000)).toBe(2_000_000)
  })

  it('defaults to 5% of current bid rounded to a clean 100k step', () => {
    expect(computeBidIncrement(85_000_000)).toBe(4_300_000)
    expect(computeBidIncrement(10_000_000)).toBe(500_000)
  })

  it('never drops below the 500k floor', () => {
    expect(computeBidIncrement(1_000_000)).toBe(500_000)
    expect(computeBidIncrement(0)).toBe(500_000)
  })
})

describe('getLotDeadline', () => {
  it('prefers extended_until when set', () => {
    const lot = { closes_at: '2026-01-01T10:00:00Z', extended_until: '2026-01-01T10:05:00Z' }
    expect(getLotDeadline(lot)).toBe('2026-01-01T10:05:00Z')
  })

  it('falls back to closes_at', () => {
    expect(getLotDeadline({ closes_at: '2026-01-01T10:00:00Z', extended_until: null })).toBe('2026-01-01T10:00:00Z')
  })
})

describe('shouldExtend (anti-sniping)', () => {
  const now = new Date('2026-01-01T10:00:00Z').getTime()

  it('extends when a bid lands within 3 minutes of the deadline', () => {
    const deadline = new Date('2026-01-01T10:02:30Z') // 2.5 min out
    const result = shouldExtend(deadline, now)
    expect(result).toBe(now + 5 * 60_000)
  })

  it('returns null when more than 3 minutes remain', () => {
    const deadline = new Date('2026-01-01T10:10:00Z') // 10 min out
    expect(shouldExtend(deadline, now)).toBeNull()
  })

  it('returns null for invalid deadlines', () => {
    expect(shouldExtend('not-a-date', now)).toBeNull()
  })
})

describe('firstName (public winner display)', () => {
  it('returns the first word of a name', () => {
    expect(firstName('Ada Obi Chukwu')).toBe('Ada')
  })

  it('handles null, empty, and whitespace', () => {
    expect(firstName(null)).toBeNull()
    expect(firstName('')).toBeNull()
    expect(firstName('   ')).toBeNull()
  })
})

describe('meta maps', () => {
  it('defines all fault severities with distinct colors', () => {
    expect(Object.keys(SEVERITY_META)).toEqual(['minor', 'warning', 'critical'])
    const colors = new Set(Object.values(SEVERITY_META).map(m => m.color))
    expect(colors.size).toBe(3)
  })

  it('defines all condition grades', () => {
    expect(Object.keys(GRADE_META)).toEqual(['A', 'B', 'C', 'D'])
  })
})
