/**
 * Hero image resolution for pages whose image lives in `content_blocks`.
 *
 * The CMS value wins, with one exception: rows that still hold the paths the
 * site shipped with are treated as unset, so a page can move to its own
 * photograph without a database migration. Pick any other image in the admin
 * panel and that value is used as-is.
 */
const SHIPPED_DEFAULTS: Record<string, string[]> = {
  about: ['/heroimg.jpg'],
  contact: ['/heroimg5.jpg'],
  'pre-order': ['/heroimg4.jpg', '/heroimg5.jpg'],
  ev: ['/heroimg5.jpg', '/heroimg.jpg'],
}

export function resolveHeroImage(
  pageKey: string,
  cmsValue: string | null | undefined,
  fallback: string,
): string {
  if (!cmsValue) return fallback
  const shipped = SHIPPED_DEFAULTS[pageKey] ?? []
  return shipped.includes(cmsValue) ? fallback : cmsValue
}
