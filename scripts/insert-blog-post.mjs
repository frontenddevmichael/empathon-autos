#!/usr/bin/env node
/**
 * Insert the EV guide blog post via the Management API (bypasses RLS).
 *
 * Usage:
 *   SUPABASE_PAT=sbp_xxx node scripts/insert-blog-post.mjs
 *
 * The PAT must have at least "Project:Write" scope.
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
const sql = readFileSync(join(__dirname, '..', 'docs', 'superpowers', 'sql', 'insert-ev-blog-post.sql'), 'utf8')

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
  console.log('Inserting EV guide blog post...')
  const result = await runSql(sql)
  console.log('✅ Blog post inserted successfully.')
  if (result && JSON.stringify(result).length > 2) {
    console.log('Result:', JSON.stringify(result, null, 2))
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
