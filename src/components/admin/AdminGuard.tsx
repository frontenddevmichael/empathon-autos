import { useEffect, useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AdminGuard() {
  const navigate = useNavigate()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/admin/login', { replace: true }); return }
      setOk(true)
    }).catch(() => navigate('/admin/login', { replace: true }))
  }, [navigate])

  if (!ok) return null
  return <Outlet />
}
