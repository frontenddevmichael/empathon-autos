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
