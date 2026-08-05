import type { ConditionGrade, FaultSeverity } from '@/types'

/** Colors for fault severity chips. */
export const SEVERITY_META: Record<FaultSeverity, { label: string; color: string; bg: string }> = {
  minor: { label: 'Minor', color: '#15803d', bg: 'rgba(21,128,61,0.10)' },
  warning: { label: 'Warning', color: '#b45309', bg: 'rgba(217,119,6,0.12)' },
  critical: { label: 'Critical', color: '#b91c1c', bg: 'rgba(220,38,38,0.10)' },
}

/** Overall condition grades with human labels. */
export const GRADE_META: Record<ConditionGrade, { label: string; color: string; bg: string }> = {
  A: { label: 'A — Excellent', color: '#15803d', bg: 'rgba(21,128,61,0.10)' },
  B: { label: 'B — Very Good', color: '#4d7c0f', bg: 'rgba(77,124,15,0.10)' },
  C: { label: 'C — Good', color: '#b45309', bg: 'rgba(217,119,6,0.12)' },
  D: { label: 'D — Fair', color: '#b91c1c', bg: 'rgba(220,38,38,0.10)' },
}

/** Default minimum bid increment: max(₦500k, 5% of current bid) rounded to a clean ₦100k step. */
export function computeBidIncrement(currentBid: number, override = 0): number {
  if (override > 0) return override
  return Math.max(500_000, Math.round((currentBid * 0.05) / 100_000) * 100_000)
}

/** The effective close deadline for a lot (extensions win over the original closes_at). */
export function getLotDeadline(lot: { closes_at: string; extended_until?: string | null }): string {
  return lot.extended_until || lot.closes_at
}

/**
 * Anti-sniping rule. Returns the new deadline if the lot should be extended,
 * otherwise null. Bids landing within `withinMs` of the deadline push it out by `extendMs`.
 */
export function shouldExtend(
  deadline: string | number | Date,
  now: number = Date.now(),
  withinMs = 3 * 60_000,
  extendMs = 5 * 60_000,
): number | null {
  const deadlineMs = new Date(deadline).getTime()
  if (!Number.isFinite(deadlineMs)) return null
  if (deadlineMs - now > withinMs) return null
  return now + extendMs
}

/** First word of a name — used for the public winner display on past auctions. */
export function firstName(name: string | null | undefined): string | null {
  if (!name) return null
  const trimmed = name.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}
