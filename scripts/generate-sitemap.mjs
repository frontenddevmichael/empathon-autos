/**
 * Build-time sitemap generator for Empathon Autos.
 * Run after `vite build` to produce an up-to-date sitemap.xml
 * that includes every vehicle in the inventory.
 *
 * Usage: node scripts/generate-sitemap.mjs
 *
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Load env vars directly from .env (simple parser — no dotenv dependency)
let supabaseUrl = process.env.VITE_SUPABASE_URL
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const env = readFileSync(resolve(root, '.env'), 'utf-8')
    for (const line of env.split('\n')) {
      const [k, ...v] = line.split('=')
      if (k === 'VITE_SUPABASE_URL') supabaseUrl = v.join('=').trim()
      if (k === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = v.join('=').trim()
    }
  } catch {}
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠  No Supabase credentials found. Using static sitemap.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const base = 'https://www.emphatonautos.com'

const staticPages = [
  { loc: '/', priority: 1.0 },
  { loc: '/inventory', priority: 0.9 },
  { loc: '/auctions', priority: 0.8 },
  { loc: '/pre-order', priority: 0.7 },
  { loc: '/corporate', priority: 0.7 },
  { loc: '/about', priority: 0.6 },
  { loc: '/contact', priority: 0.6 },
  { loc: '/privacy', priority: 0.3 },
  { loc: '/terms', priority: 0.3 },
]

async function main() {
  const entries = [...staticPages]

  // Fetch all published vehicles for dynamic vehicle pages
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, updated_at')
    .neq('status', 'draft')

  if (vehicles) {
    for (const v of vehicles) {
      entries.push({
        loc: `/inventory/${v.id}`,
        priority: 0.8,
        lastmod: v.updated_at,
      })
    }
  }

  // Fetch active auction lots
  const { data: lots } = await supabase
    .from('lots')
    .select('id')
    .in('status', ['scheduled', 'open', 'closing'])

  if (lots) {
    for (const l of lots) {
      entries.push({
        loc: `/auctions/${l.id}`,
        priority: 0.7,
      })
    }
  }

  const urls = entries
    .map(e => {
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''
      return `  <url>\n    <loc>${base}${e.loc}</loc>${lastmod}\n    <priority>${e.priority}</priority>\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

  writeFileSync(resolve(root, 'dist', 'sitemap.xml'), xml, 'utf-8')
  console.log(`✓ Sitemap generated with ${entries.length} URLs → dist/sitemap.xml`)
}

main().catch(err => {
  console.error('Sitemap generation failed:', err.message)
  process.exit(1)
})
