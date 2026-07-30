import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const isPlaceholder = (v: string) => !v || v.includes('your-project') || v.includes('your-') || v.includes('XXXXX')

const missingEnv = isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)

/**
 * Check if Supabase environment variables are configured.
 * Components can call this to show a graceful error UI instead of crashing.
 */
export function isSupabaseConfigured(): boolean {
  return !missingEnv
}

if (missingEnv) {
  console.error(
    '[Empathon Autos] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Supabase features will be unavailable. Copy .env.example to .env and fill in your credentials.'
  )
}

/**
 * Lazy-initialized client — safe to call even when env vars are missing.
 * Operations will fail gracefully at runtime instead of crashing the app at import time.
 */
export function getSupabaseClient() {
  if (missingEnv) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export const supabase = missingEnv
  ? (null as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl, supabaseAnonKey)

/**
 * Safe version exports a noop client wrapper when env is missing.
 * Components that use supabase directly should check isSupabaseConfigured() first.
 */
export function createSafeClient() {
  if (missingEnv) {
    return new Proxy({} as ReturnType<typeof createClient>, {
      get() { return async () => ({ data: null, error: new Error('Supabase not configured') }) },
    })
  }
  return supabase
}