/**
 * Run the Supabase migration SQL against the database (ESM version with IPv6 resolution).
 *
 * Usage:
 *   SUPABASE_DB_HOST="db.xxxxx.supabase.co" \
 *   SUPABASE_DB_PASSWORD="your-service-role-key" \
 *   node run-migration.mjs
 *
 * IMPORTANT: Never hardcode database credentials. Always use environment variables.
 * Prefer running migrations via the Supabase Dashboard SQL editor instead.
 */
import pg from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dns from 'dns/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'supabase', 'migrations', '001_schema.sql'), 'utf-8')

const host = process.env.SUPABASE_DB_HOST
const password = process.env.SUPABASE_DB_PASSWORD

if (!host || !password) {
  console.error('ERROR: Set SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD environment variables.')
  console.error('Example:')
  console.error('  SUPABASE_DB_HOST="db.xxxxx.supabase.co" SUPABASE_DB_PASSWORD="sbr_..." node run-migration.mjs')
  process.exit(1)
}

let client

try {
  const [ipv6] = await dns.resolve6(host)
  client = new pg.Client({
    host: ipv6,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
  })
} catch {
  // Fallback to hostname if IPv6 resolution fails
  client = new pg.Client({
    host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
  })
}

try {
  await client.connect()
  console.log('Connected!')
  await client.query(sql)
  console.log('Migration complete!')
} catch (err) {
  console.error('Error:', err.message)
} finally {
  await client.end()
}
