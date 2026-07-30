import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const TOAST_DURATION = 4000

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error'
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer) { clearTimeout(timer); timersRef.current.delete(id) }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    const timer = setTimeout(() => removeToast(id), TOAST_DURATION)
    timersRef.current.set(id, timer)
  }, [removeToast])

  useEffect(() => {
    return () => { timersRef.current.forEach(t => clearTimeout(t)) }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 84,
        right: 'var(--space-3)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1-5)',
              padding: 'var(--space-1-5) var(--space-2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              background: t.type === 'success' ? 'rgba(21,128,61,0.12)' : 'rgba(197,48,48,0.12)',
              color: t.type === 'success' ? 'var(--success)' : 'var(--error)',
              border: `1px solid ${t.type === 'success' ? 'rgba(21,128,61,0.25)' : 'rgba(197,48,48,0.25)'}`,
              boxShadow: '0 4px 12px rgba(10,10,10,0.08)',
              backdropFilter: 'blur(12px)',
              animation: 'slideInRight 300ms var(--ease-out)',
              maxWidth: 380,
              pointerEvents: 'auto',
            }}
            role="alert"
          >
            {t.type === 'success' ? (
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={16} style={{ flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                opacity: 0.5,
                cursor: 'pointer',
                transition: 'opacity 150ms var(--ease-out)',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5' }}
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
