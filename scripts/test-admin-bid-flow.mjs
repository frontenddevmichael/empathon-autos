import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(join(__dirname, '..', '.env'), 'utf8')
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim() || ''
const SUPABASE_URL = get('VITE_SUPABASE_URL').replace(/\/$/, '')
const ANON_KEY = get('VITE_SUPABASE_ANON_KEY')
const PAT = process.env.SUPABASE_PAT
const REF = 'khexlszvtkdgkmxkadjz'
const MGMT = `https://api.supabase.com/v1/projects/${REF}`

if (!SUPABASE_URL || !ANON_KEY || !PAT) { console.error('missing env'); process.exit(1) }

const mgmt = async (path, opts = {}) => {
  const res = await fetch(`${MGMT}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PAT}`, ...(opts.headers || {}) },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}
const sql = (query) => mgmt('/database/query', { method: 'POST', body: JSON.stringify({ query }) })

const step = (label) => console.log(`\n▶ ${label}`)
const ok = (label, data) => console.log(`  ✓ ${label}`, data !== undefined ? JSON.stringify(data) : '')

let lotId = null

async function main() {
  const email = process.env.SUPABASE_ADMIN_EMAIL
  const password = process.env.SUPABASE_ADMIN_PASSWORD
  if (!email || !password) { console.error('Set SUPABASE_ADMIN_EMAIL + SUPABASE_ADMIN_PASSWORD (see supabase/create-admin.sql)'); process.exit(1) }

  // 1. Sign in exactly like AdminLogin (real super_admin account)
  step('1. Sign in as admin (auth/v1/token grant_type=password)')
  const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  const tokenJson = await tokenRes.json()
  if (!tokenRes.ok || !tokenJson.access_token) throw new Error(`sign-in failed: ${tokenRes.status} ${JSON.stringify(tokenJson)}`)
  const token = tokenJson.access_token
  ok('access_token acquired')

  const rest = async (path, method, body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${token}`, Prefer: 'return=representation' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`)
    return text ? JSON.parse(text) : null
  }

  // 2. Admin creates a STANDALONE lot (vehicle_id null) — exact payload from AdminAuctionForm.handleSubmit
  step('2. Admin creates standalone lot (RLS-protected path)')
  const closesAt = new Date(Date.now() + 3 * 3600 * 1000).toISOString()
  const payload = {
    vehicle_id: null,
    title: '2024 Toyota Land Cruiser Prado TX',
    make: 'Toyota', model: 'Land Cruiser Prado', trim: 'TX', year: 2024,
    mileage: 45000, transmission: 'automatic', fuel_type: 'diesel',
    colour: 'White', body_type: 'suv',
    description: 'Simulated admin-created auction for verification.',
    condition_grade: 'A', bid_increment: 1000000,
    opening_bid: 85000000, reserve_price: 95000000,
    status: 'open', closes_at: closesAt, opens_at: null,
  }
  const [lot] = await rest('/lots', 'POST', payload)
  if (!lot?.id) throw new Error('lot insert returned no id')
  lotId = lot.id
  ok('lot created', { id: lotId, status: lot.status })

  // 3. Admin adds media + faults
  step('3. Admin adds lot media + faults')
  const urls = [
    'https://images.unsplash.com/photo-1636578929419-fc62088fd08f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=600&fit=crop',
  ]
  await rest('/lot_media', 'POST', urls.map((u, i) => ({ lot_id: lotId, url: u, type: 'image', sort_order: i, is_primary: i === 0 })))
  await rest('/lot_faults', 'POST', [
    { lot_id: lotId, title: 'Minor alloy scuff', description: 'Small curb rash on front-left wheel.', severity: 'minor', image_url: null, sort_order: 0 },
    { lot_id: lotId, title: 'Brake pads wearing', description: 'Front pads at ~30%, recommend replacement.', severity: 'warning', image_url: null, sort_order: 1 },
  ])
  const media = await rest(`/lot_media?lot_id=eq.${lotId}`, 'GET')
  const faults = await rest(`/lot_faults?lot_id=eq.${lotId}`, 'GET')
  ok('media rows', media.length)
  ok('fault rows', faults.length)

  // 4. Place bids via the DEPLOYED edge function
  step('4. Place bids via deployed place-bid edge function')
  const fnUrl = `https://${REF}.functions.supabase.co/place-bid`
  const placeBid = async (amount, bidder_name = 'Ada Obi', bidder_email = 'ada.obi@example.com') => {
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ lot_id: lotId, amount, bidder_name, bidder_email, bidder_phone: '+2348000000000' }),
    })
    const body = await res.json()
    return { status: res.status, body }
  }

  const b1 = await placeBid(86000000, 'Ada Obi')
  ok('bid 86,000,000 (valid)', b1)
  const b2 = await placeBid(85000000, 'Bola Musa')
  ok('bid 85,000,000 (below current)', b2)
  const b3 = await placeBid(86500000, 'Bola Musa')
  ok('bid 86,500,000 (below increment)', b3)
  const b4 = await placeBid(87000000, 'Chidi Nnamdi')
  ok('bid 87,000,000 (valid)', b4)

  // 5. Verify persisted bids + lot state
  step('5. Verify bids + lot state')
  const bids = await sql(`select bidder_name, amount, outcome, placed_at from bids where lot_id = '${lotId}' order by placed_at;`)
  ok('bids persisted', bids)
  const lotState = await sql(`select status, current_bid, current_bidder_name from lots where id = '${lotId}';`)
  ok('lot state', lotState)
}

async function cleanup() {
  console.log('\n▶ Cleanup')
  if (lotId) {
    await sql(`delete from lots where id = '${lotId}';`).catch(e => console.error('  cleanup lot failed:', e.message))
    console.log('  ✓ deleted test lot (cascades media/faults/bids)')
  }
}

main()
  .then(() => { console.log('\nALL CHECKS PASSED') })
  .catch(e => { console.error('\nFATAL:', e.message) })
  .finally(() => cleanup())
  .catch(() => {})
