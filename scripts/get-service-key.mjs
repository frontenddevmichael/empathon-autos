const PAT = process.env.SUPABASE_PAT
const ref = process.env.SUPABASE_PROJECT_REF || 'khexlszvtkdgkmxkadjz'
if (!PAT) { console.error('Set SUPABASE_PAT'); process.exit(1) }

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
  headers: { Authorization: `Bearer ${PAT}` }
})
if (!res.ok) {
  console.error('Status:', res.status, await res.text())
  process.exit(1)
}
const data = await res.json()
// Find the service_role key
const svc = data.find(k => k.name === 'service_role')
if (svc) {
  console.log('SUPABASE_SERVICE_KEY=' + svc.api_key)
} else {
  console.log('All keys:', JSON.stringify(data.map(k => k.name + ': ' + k.api_key.slice(0,20)+'...'), null, 2))
}
