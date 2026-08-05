#!/usr/bin/env node
/**
 * Run a SQL file against the Supabase project via the Management API (bypasses RLS).
 *
 * Usage:
 *   SUPABASE_PAT=sbp_xxx node scripts/run-sql.mjs [path/to/file.sql]
 *
 * Defaults to the EV guide blog post. The PAT must have at least "Project:Write" scope.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PAT = process.env.SUPABASE_PAT
if (!PAT) {
  console.error('Set SUPABASE_PAT (personal access token)')
  process.exit(1)
}

const PROJECT_REF = 'khexlszvtkdgkmxkadjz'
const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}`

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultFile = join(__dirname, '..', 'docs', 'superpowers', 'sql', 'insert-ev-blog-post.sql')
const file = process.argv[2] ? join(process.cwd(), process.argv[2]) : defaultFile

let sql
try {
  sql = readFileSync(file, 'utf8')
} catch (err) {
  console.error(`Could not read SQL file: ${file}`)
  console.error(err.message)
  process.exit(1)
}

async function runSql(query) {
  const res = await fetch(`${API}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAT}`,
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SQL API ${res.status}: ${text}`)
  }
  return res.json()
}

async function main() {
  console.log(`Running SQL from: ${file}`)
  const result = await runSql(sql)
  console.log('✅ SQL executed successfully.')
  if (result && JSON.stringify(result).length > 2) {
    console.log('Result:', JSON.stringify(result, null, 2))
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
