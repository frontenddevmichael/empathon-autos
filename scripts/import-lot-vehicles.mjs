#!/usr/bin/env node
/**
 * Import lot vehicles from CSV into Supabase.
 *
 * Usage:
 *   node scripts/import-lot-vehicles.mjs [path/to/file.csv]
 *
 * Defaults to data/lot_vehicles.csv if no path is provided.
 *
 * Environment:
 *   VITE_SUPABASE_URL   — Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Supabase anon key (or service role key for admin)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { config as loadEnv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Parse CSV (handles quoted fields with commas)
function parseCSV(text) {
  const result = []
  let currentRow = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(current)
      current = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      currentRow.push(current)
      current = ''
      if (currentRow.some(cell => cell.trim() !== '')) {
        result.push(currentRow)
      }
      currentRow = []
    } else {
      current += ch
    }
  }
  currentRow.push(current)
  if (currentRow.some(cell => cell.trim() !== '')) {
    result.push(currentRow)
  }
  return result
}

// Parse features string (JSON array or comma-separated)
function parseFeatures(str) {
  if (!str || str.trim() === '') return []
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) ? parsed : [str]
  } catch {
    return str.split(',').map(s => s.trim()).filter(Boolean)
  }
}

// Convert CSV row to lot object
function rowToLot(headers, row) {
  const obj = {}
  headers.forEach((h, i) => { obj[h] = (row[i] || '').trim() })

  const lot = {}

  // Text fields
  if (obj.title) lot.title = obj.title
  lot.make = obj.make
  lot.model = obj.model
  if (obj.trim) lot.trim = obj.trim
  if (obj.year) lot.year = parseInt(obj.year, 10)
  if (obj.mileage) lot.mileage = parseInt(obj.mileage, 10)
  if (obj.transmission) lot.transmission = obj.transmission
  if (obj.fuel_type) lot.fuel_type = obj.fuel_type
  if (obj.colour) lot.colour = obj.colour
  if (obj.body_type) lot.body_type = obj.body_type
  if (obj.description) lot.description = obj.description
  if (obj.features) lot.features = parseFeatures(obj.features)
  if (obj.condition_grade) lot.condition_grade = obj.condition_grade

  // Numeric fields (stored in NGN)
  if (obj.opening_bid) lot.opening_bid = parseFloat(obj.opening_bid)
  if (obj.reserve_price) lot.reserve_price = parseFloat(obj.reserve_price)
  if (obj.buy_now_price) lot.buy_now_price = parseFloat(obj.buy_now_price)
  if (obj.bid_increment) lot.bid_increment = parseFloat(obj.bid_increment)

  // Status
  if (obj.status) lot.status = obj.status

  // Timestamps
  if (obj.opens_at) lot.opens_at = obj.opens_at
  if (obj.closes_at) lot.closes_at = obj.closes_at

  return lot
}

// Main
async function main() {
  const csvPath = resolve(process.argv[2] || 'data/lot_vehicles.csv')
  console.log(`📄 Reading: ${csvPath}`)

  const text = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(text)

  if (rows.length < 2) {
    console.error('❌ CSV is empty or has no data rows')
    process.exit(1)
  }

  const headers = rows[0]
  const dataRows = rows.slice(1).filter(r => r.some(cell => cell.trim()))

  console.log(`📊 Found ${dataRows.length} vehicles to import\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const lot = rowToLot(headers, row)

    // Auto-generate title if missing
    if (!lot.title) {
      lot.title = [lot.make, lot.model, lot.trim, lot.year].filter(Boolean).join(' ')
    }

    console.log(`[${i + 1}/${dataRows.length}] ${lot.title}...`)

    const { error } = await supabase.from('lots').insert(lot)

    if (error) {
      console.error(`  ❌ Failed: ${error.message}`)
      failed++
    } else {
      console.log(`  ✅ Imported`)
      success++
    }
  }

  console.log(`\n📊 Results: ${success} imported, ${failed} failed`)
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
