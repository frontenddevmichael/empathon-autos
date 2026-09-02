import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DecoOrb } from '@/components/deco/DecoOrb'
import { DecoBlob } from '@/components/deco/DecoBlob'
import { useToast } from '@/context/ToastContext'

export function AdminLogin() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      showToast(error.message, 'error')
      return
    }
    navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <DecoOrb size={350} color="rgba(196,168,130,0.05)" top="-20%" right="-15%" blur={120} />
      <DecoBlob variant={3} width={200} height={200} bottom="-15%" left="-10%" color="var(--ink)" opacity={0.03} />
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 'var(--space-1)' }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--clay-deep)', marginBottom: 4 }}>Admin</p>
          <h2>Sign In</h2>
        </div>
        <div>
          <label htmlFor="al-email" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
          <Input id="al-email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@empathonautos.com" required autoFocus />
        </div>
        <div>
          <label htmlFor="al-password" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Password</label>
          <Input id="al-password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter your password" required />
        </div>
        <Button type="submit" loading={loading} fullWidth>Sign In</Button>
      </form>
    </div>
  )
}
