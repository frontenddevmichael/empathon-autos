import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const CHECK_INTERVAL_MS = 60_000 // check every 60 seconds

/**
 * Automatically closes auction lots whose closes_at time has passed.
 * Runs on mount and periodically while the component is mounted.
 *
 * Queries for lots with status='open' or 'closing' where closes_at < now,
 * then batch-updates them to 'closed'.
 *
 * @param onClosed - Optional callback invoked after lots are auto-closed,
 *   so the parent component can re-fetch its data.
 */
export function useAutoCloseLots(onClosed?: () => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  const checkAndClose = async () => {
    if (!isSupabaseConfigured()) return

    try {
      const now = new Date().toISOString()

      // Find all lots that should be closed (open/closing status, past closes_at)
      const { data: expiredLots, error: fetchError } = await supabase
        .from('lots')
        .select('id, current_bid, reserve_price')
        .in('status', ['open', 'closing'])
        .lt('closes_at', now)

      if (fetchError) {
        console.error('[useAutoCloseLots] Failed to query expired lots:', fetchError.message)
        return
      }

      if (!expiredLots || expiredLots.length === 0) return

      // Determine final status for each lot: 'sold' if bid >= reserve, else 'unsold'
      const soldIds: string[] = []
      const unsoldIds: string[] = []
      for (const lot of expiredLots) {
        if (lot.current_bid >= lot.reserve_price && lot.reserve_price > 0) {
          soldIds.push(lot.id)
        } else {
          unsoldIds.push(lot.id)
        }
      }

      // Batch update sold lots
      if (soldIds.length > 0) {
        const { error: soldError } = await supabase
          .from('lots')
          .update({ status: 'sold' })
          .in('id', soldIds)
        if (soldError) console.error('[useAutoCloseLots] Failed to mark sold:', soldError.message)
      }

      // Batch update unsold lots
      if (unsoldIds.length > 0) {
        const { error: unsoldError } = await supabase
          .from('lots')
          .update({ status: 'unsold' })
          .in('id', unsoldIds)
        if (unsoldError) console.error('[useAutoCloseLots] Failed to mark unsold:', unsoldError.message)
      }

      console.log(`[useAutoCloseLots] Auto-closed ${soldIds.length} sold + ${unsoldIds.length} unsold lot(s)`)
      onClosedRef.current?.()
    } catch (e) {
      console.error('[useAutoCloseLots] Unexpected error:', e)
    }
  }

  useEffect(() => {
    // Run immediately on mount
    checkAndClose()

    // Then check periodically
    intervalRef.current = setInterval(checkAndClose, CHECK_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
