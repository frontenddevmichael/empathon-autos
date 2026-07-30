import { useEffect, useCallback, useRef } from 'react'

/**
 * Warns users when they try to navigate away (browser back/close/reload) or
 * use in-app navigation with unsaved form changes.
 * 
 * @param isDirty - Whether the form has unsaved changes
 * @param message - Optional custom message
 * 
 * @example
 * ```tsx
 * const [isDirty, setIsDirty] = useState(false)
 * useUnsavedChanges(isDirty)
 * ```
 */
export function useUnsavedChanges(
  isDirty: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) {
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  // Warn on browser back/close/reload
  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, message])
}

/**
 * Wraps a navigation callback with an unsaved-changes confirmation dialog.
 * Call this instead of direct navigation when the form is dirty.
 */
export function useSafeNavigate(isDirty: boolean, message?: string) {
  const msg = message ?? 'You have unsaved changes. Are you sure you want to leave?'

  const safeNavigate = useCallback(
    (navigateFn: () => void) => {
      if (isDirty) {
        const confirmed = window.confirm(msg)
        if (!confirmed) return
      }
      navigateFn()
    },
    [isDirty, msg]
  )

  return safeNavigate
}
