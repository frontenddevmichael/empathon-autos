import { useEffect, useRef } from 'react'

const CHECK_INTERVAL_MS = 60_000 // poll every 60 seconds

/**
 * Polls for server-side auction status transitions (opened/closed by the
 * process_lots cron job) and re-fetches data. This is a refresh-only trigger —
 * it no longer performs any database writes.
 *
 * @param onRefresh - Callback invoked on mount and every 60s so the parent can re-fetch.
 */
export function useAutoCloseLots(onRefresh?: () => void) {
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    onRefreshRef.current?.()
    const id = setInterval(() => onRefreshRef.current?.(), CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
