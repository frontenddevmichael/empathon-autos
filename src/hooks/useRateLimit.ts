import { useRef, useCallback } from 'react'
import { config } from '@/lib/config'

/**
 * Simple client-side rate limiter for form submissions.
 * Prevents rapid-fire submissions within the configured interval.
 */
export function useRateLimit(intervalMs = config.rateLimit.formSubmission) {
  const lastSubmitRef = useRef<number>(0)

  const canSubmit = useCallback(() => {
    const now = Date.now()
    if (now - lastSubmitRef.current < intervalMs) {
      return false
    }
    lastSubmitRef.current = now
    return true
  }, [intervalMs])

  const reset = useCallback(() => {
    lastSubmitRef.current = 0
  }, [])

  return { canSubmit, reset }
}
