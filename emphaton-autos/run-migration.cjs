/**
 * Run the Supabase migration SQL against the database.
 *
 * Usage:
 *   SUPABASE_DB_HOST="db.xxxxx.supabase.co" \
 *   SUPABASE_DB_PASSWORD="your-service-role-key" \
 *   node run-migration.cjs
 *
 * IMPORTANT: Never hardcode database credentials. Always use environment variables.
 * Prefer running migrations via the Supabase Dashboard SQL editor instead.
 */
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '001_schema.sql'), 'utf-8')

const host = process.env.SUPABASE_DB_HOST
const password = process.env.SUPABASE_DB_PASSWORD

if (!host || !password) {
  console.error('ERROR: Set SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD environment variables.')
  console.error('Example:')
  console.error('  SUPABASE_DB_HOST="db.xxxxx.supabase.co" SUPABASE_DB_PASSWORD="sbr_..." node run-migration.cjs')
  process.exit(1)
}

const client = new Client({
  host,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  try {
    await client.connect()
    console.log('Connected')
    await client.query(sql)
    console.log('Migration completed successfully')
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await client.end()
  }
}
main()
