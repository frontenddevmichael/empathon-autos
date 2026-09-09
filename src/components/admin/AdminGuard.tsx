import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please set your environment variables.')
      setChecking(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (cancelled) return
        if (sessionError) {
          setError('Failed to verify authentication. Please try again.')
          setChecking(false)
          return
        }
        if (!session) { navigate('/admin/login'); return }
        const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (cancelled) return
        if (profileError) {
          setError('Failed to load admin profile. Please try again.')
          setChecking(false)
          return
        }
        if (!data) { navigate('/admin/login'); return }
        if (cancelled) return
        // Only super_admin and admin roles get full panel access.
        // staff/editor users see limited views — extend later if needed.
        if (data.role !== 'super_admin' && data.role !== 'admin') {
          setError('You do not have admin access. Contact the site owner to request permission.')
          setChecking(false)
          return
        }
        setChecking(false)
      } catch (err) {
        if (cancelled) return
        console.error('[AdminGuard] Unexpected error:', err)
        setError('An unexpected error occurred. Please try again.')
        setChecking(false)
      }
    })()
    return () => { cancelled = true }
  }, [navigate])

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 'var(--space-2)' }}>
        <div style={{ padding: 'var(--space-4)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Access Error</p>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{error}</p>
          <Button size="sm" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--stone)' }}>
        Verifying access...
      </div>
    )
  }

  return <>{children}</>
}