/**
 * Mock order tracking engine.
 *
 * Pure client-side mock: any valid `EA-XXXXXX` reference deterministically
 * resolves to a fake order. Same reference always produces the same result,
 * so the flow feels real without any backend or persistence.
 */

export const ORDER_STAGES = [
  'Order Confirmed',
  'Sourcing',
  'Shipping',
  'Customs Clearance',
  'Ready for Pickup',
] as const

export type OrderStage = (typeof ORDER_STAGES)[number]

export interface TrackedOrder {
  reference: string
  stageIndex: number
  stage: OrderStage
  vehicle: { make: string; model: string; colour: string; year: number }
  placedDate: string
  estimatedPickup: string
}

const REFERENCE_PATTERN = /^EA-(\d{6})$/

/** Base date from which order dates are derived (kept stable across visits). */
const BASE_DATE = new Date('2026-01-15T00:00:00Z')

const VEHICLE_POOL: Array<{ make: string; model: string; colour: string; year: number }> = [
  { make: 'Toyota', model: 'Land Cruiser 300', colour: 'Pearl White', year: 2024 },
  { make: 'Mercedes-Benz', model: 'GLE 450', colour: 'Obsidian Black', year: 2023 },
  { make: 'BMW', model: 'X5 xDrive40i', colour: 'Alpine White', year: 2024 },
  { make: 'Lexus', model: 'RX 350', colour: 'Grey Metallic', year: 2023 },
  { make: 'Range Rover', model: 'Sport HSE', colour: 'Santorini Black', year: 2024 },
  { make: 'Porsche', model: 'Cayenne S', colour: 'Jet Black', year: 2023 },
  { make: 'Tesla', model: 'Model Y', colour: 'Pearl White', year: 2024 },
  { make: 'Honda', model: 'CR-V', colour: 'Lunar Silver', year: 2023 },
]

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addWeeks(base: Date, weeks: number): Date {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + weeks * 7)
  return d
}

/** Strict validation for `EA-XXXXXX`. */
export function validateReference(ref: string): boolean {
  return REFERENCE_PATTERN.test(ref.trim().toUpperCase())
}

function digitsOf(ref: string): number[] {
  const match = ref.trim().toUpperCase().match(REFERENCE_PATTERN)
  if (!match) return []
  return match[1].split('').map(Number)
}

/**
 * Deterministically derive a mock order from a valid reference.
 * Returns `null` for any reference that fails validation.
 */
export function lookupOrder(ref: string): TrackedOrder | null {
  const normalized = ref.trim().toUpperCase()
  if (!validateReference(normalized)) return null

  const digits = digitsOf(normalized)
  const sum = digits.reduce((a, b) => a + b, 0)
  const stageIndex = sum % ORDER_STAGES.length
  const vehicle = VEHICLE_POOL[digits[digits.length - 1] % VEHICLE_POOL.length]

  return {
    reference: normalized,
    stageIndex,
    stage: ORDER_STAGES[stageIndex],
    vehicle,
    placedDate: toISODate(BASE_DATE),
    estimatedPickup: toISODate(addWeeks(BASE_DATE, 9)),
  }
}
