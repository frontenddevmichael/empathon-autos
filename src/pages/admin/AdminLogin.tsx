import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'

export function AdminLogin() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    if (!isSupabaseConfigured()) {
      showToast('Authentication is not available. Please configure Supabase first.', 'error')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { showToast('Invalid credentials', 'error'); return }
    navigate('/admin')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--paper)', padding: 'var(--space-3)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <form onSubmit={handleLogin} style={{ padding: 'var(--space-4)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: 'var(--space-2)' }}>
          <div style={{ marginBottom: 'var(--space-3)', textAlign: 'center' }}>
            <img src="/Empathon logo.png" alt="Empathon Autos" width="150" height="150" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain', marginBottom: 'var(--space-1)' }} />
            <h2 style={{ fontSize: 'var(--text-xl)' }}>Admin Login</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>Empathon Autos dashboard</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <div style={{ position: 'relative' }}>
              <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" loading={loading} fullWidth style={{ marginTop: 'var(--space-2)' }}>Sign In</Button>
        </form>

        <div style={{ padding: 'var(--space-3)', background: 'var(--navy-light)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,51,102,0.1)', fontSize: 'var(--text-xs)', color: 'var(--navy)', lineHeight: 1.7 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>How to get admin access:</p>
          <ol style={{ paddingLeft: 14, margin: 0 }}>
            <li>Go to your Supabase dashboard → <strong>Authentication → Users</strong></li>
            <li>Click <strong>Add User</strong> and create an admin account with email + password</li>
            <li>Go to <strong>SQL Editor</strong> and run:
              <code style={{ display: 'block', margin: '6px 0', padding: '8px 10px', background: 'rgba(0,51,102,0.06)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', whiteSpace: 'pre-wrap' }}>UPDATE profiles SET role = 'super_admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin@email.com' LIMIT 1);</code>
            </li>
            <li>Log in here with that email + password</li>
          </ol>
        </div>
      </div>
    </div>
  )
}