/**
 * Format a Naira price for display.
 * Values ≥ 1,000,000 show as "₦5.5M", otherwise show full comma-separated value.
 * Zero or negative shows "Price on request".
 */
export function formatPrice(price: number): string {
  if (!price || price <= 0) return 'Price on request'
  if (price >= 1_000_000) return `₦${(price / 1_000_000).toFixed(1)}M`
  return `₦${price.toLocaleString()}`
}

/**
 * Format mileage with km suffix.
 */
export function formatMileage(km: number): string {
  return `${km.toLocaleString()} km`
}

/**
 * Mileage for display, or null when it was never recorded.
 * A stored 0 means "not supplied" on this lot, so it is left out rather than
 * printed as a real reading.
 */
export function mileageLabel(km: number): string | null {
  return km > 0 ? formatMileage(km) : null
}
