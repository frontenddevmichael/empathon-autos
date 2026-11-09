#!/usr/bin/env node
/**
 * Import car photos from the Empathon Google Drive folder into Supabase.
 *
 * Pipeline:
 *   1. Read the public Drive folder (subfolders = one car each).
 *   2. Map each folder to a vehicle using data/drive-folder-map.json.
 *   3. For each photo: download from Drive, convert HEIC/DNG → resized WebP,
 *      upload to the `vehicle-media` bucket, then insert a vehicle_media row.
 *
 * Usage:
 *   node scripts/wire-drive-images.mjs --list
 *   node scripts/wire-drive-images.mjs --map
 *   node scripts/wire-drive-images.mjs --apply --prune
 *   node scripts/wire-drive-images.mjs --apply --link     # hotlink Drive instead
 *
 * Flags:
 *   --folder=<id|url>  Drive folder (default: DRIVE_FOLDER_ID in .env)
 *   --dry-run          With --apply: download/convert but write nothing
 *   --prune            With --apply: delete a vehicle's existing media first
 *   --link             Store Drive CDN URLs instead of uploading to Storage
 *   --limit=12         Max photos per vehicle (default 12)
 *
 * Environment (.env):
 *   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DRIVE_FOLDER_ID
 *
 * Requires ImageMagick (`magick`) on PATH for HEIC/DNG conversion.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

/* ── env ──────────────────────────────────────────────────────────────── */

function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const path = resolve(ROOT, name)
    if (!existsSync(path)) continue
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(path)
      continue
    }
    for (const line of readFileSync(path, 'utf-8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  }
}
loadEnv()

/* ── args ─────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const option = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=').slice(1).join('=') : fallback
}

const MODE = flag('list') ? 'list' : flag('map') ? 'map' : flag('apply') ? 'apply' : null
const DRY_RUN = flag('dry-run') || !MODE
const PRUNE = flag('prune')
const HOTLINK = flag('link')
const LIMIT = Number(option('limit', 12))
const WIDTH = Number(option('size', 2400))

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const FOLDER_ARG = option('folder', process.env.DRIVE_FOLDER_ID || '')
const FOLDER_ID = (FOLDER_ARG.match(/[-\w]{20,}/) || [])[0] || FOLDER_ARG

const IMAGE_RE = /\.(heic|heif|jpe?g|png|webp|dng)$/i

/* ── Drive listing ────────────────────────────────────────────────────── */

const stripHtml = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

function parseFolderHtml(html) {
  const entries = []
  for (const chunk of html.split('class="flip-entry"').slice(1)) {
    const idMatch = chunk.match(/id="entry-([A-Za-z0-9_-]{10,})"/)
    const hrefMatch = chunk.match(
      /href="https:\/\/drive\.google\.com\/(?:file\/d|drive\/folders|open\?id=)\/?([A-Za-z0-9_-]{10,})/,
    )
    const titleMatch = chunk.match(/flip-entry-title[^>]*>([^<]+)</)
    const id = (idMatch && idMatch[1]) || (hrefMatch && hrefMatch[1])
    if (!id || !titleMatch) continue
    entries.push({
      id,
      name: stripHtml(titleMatch[1]).trim(),
      isFolder: /\/drive\/folders\//.test(chunk),
    })
  }
  return entries
}

async function listFolder(folderId, depth = 0) {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}#list`, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; emphaton-image-import/1.1)' },
  })
  if (!res.ok) {
    throw new Error(
      `Drive returned HTTP ${res.status} for folder ${folderId}. ` +
        'Share the folder as "Anyone with the link — Viewer" and try again.',
    )
  }
  const html = await res.text()
  if (/show-login-page|accounts\.google\.com\/ServiceLogin/.test(html)) {
    throw new Error('Drive is asking for a sign-in. Share the folder as "Anyone with the link — Viewer".')
  }
  const files = []
  for (const entry of parseFolderHtml(html)) {
    if (entry.isFolder && depth < 2) {
      for (const child of await listFolder(entry.id, depth + 1)) {
        files.push({ ...child, folder: entry.name })
      }
    } else if (!entry.isFolder) {
      files.push(entry)
    }
  }
  return files
}

const driveOriginal = (id) => `https://lh3.googleusercontent.com/d/${id}=w${WIDTH}`
const driveLink = (id) => `https://lh3.googleusercontent.com/d/${id}=w1600`

/* ── Supabase REST ────────────────────────────────────────────────────── */

function assertConfig() {
  if (!SUPABASE_URL) throw new Error('Missing VITE_SUPABASE_URL in .env')
  if (!SERVICE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example)')
}

async function rest(path, init = {}) {
  assertConfig()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path} → HTTP ${res.status}: ${await res.text()}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function uploadToStorage(path, bytes, contentType = 'image/webp') {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/vehicle-media/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: bytes,
  })
  if (!res.ok) throw new Error(`Storage upload ${path} → HTTP ${res.status}: ${await res.text()}`)
  return `${SUPABASE_URL}/storage/v1/object/public/vehicle-media/${path}`
}

/* ── Images ───────────────────────────────────────────────────────────── */

async function downloadImage(id) {
  const res = await fetch(driveOriginal(id))
  if (!res.ok) throw new Error(`Drive download ${id} → HTTP ${res.status}`)
  const type = res.headers.get('content-type') || ''
  if (!type.startsWith('image/')) throw new Error(`Drive returned ${type} for ${id}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Convert any input image (JPEG/HEIC/DNG) to a resized WebP buffer. */
function toWebp(buf) {
  return execFileSync(
    'magick',
    ['jpeg:-', '-auto-orient', '-resize', '1600x1600>', '-strip', '-quality', '82', 'webp:-'],
    { input: buf, maxBuffer: 64 * 1024 * 1024 },
  )
}

/* ── Commands ─────────────────────────────────────────────────────────── */

async function getVehicles() {
  return rest('vehicles?select=id,make,model,trim,year,colour,description&order=created_at.asc')
}

function vehicleLabel(v) {
  return `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''} (${v.colour})`
}

function buildMap(files, folderMap) {
  const folders = [...new Set(files.map((f) => f.folder).filter(Boolean))]
  const byVehicle = new Map()
  const usedFolders = new Set()

  for (const folder of folders) {
    // Keys are substrings so punctuation/spacing differences do not matter.
    const key = Object.keys(folderMap).find((k) => folder.includes(k))
    if (!key) continue
    const vehicleId = folderMap[key]
    if (!vehicleId) continue
    const images = files
      .filter((f) => f.folder === folder && IMAGE_RE.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name))
    if (!images.length) {
      console.warn(`⚠️  Folder has no images: ${folder}`)
      continue
    }
    usedFolders.add(folder)
    byVehicle.set(vehicleId, [...(byVehicle.get(vehicleId) || []), ...images])
  }

  const unmapped = folders.filter((f) => !usedFolders.has(f))
  return { byVehicle, unmapped }
}

async function main() {
  if (!FOLDER_ID) throw new Error('No Drive folder. Pass --folder=<id|url> or set DRIVE_FOLDER_ID in .env')

  console.log(`📁 Drive folder: ${FOLDER_ID}`)
  const files = await listFolder(FOLDER_ID)
  console.log(`🖼  ${files.length} file(s) in ${new Set(files.map((f) => f.folder)).size} subfolder(s)\n`)

  if (MODE === 'list' || !MODE) {
    for (const f of files) console.log(`${f.id}  ${f.folder ? `[${f.folder}] ` : ''}${f.name}`)
    if (!MODE) console.log('\nℹ️  No mode given — nothing was written. Use --map or --apply.')
    return
  }

  const folderMapPath = resolve(ROOT, 'data/drive-folder-map.json')
  if (!existsSync(folderMapPath)) throw new Error('Missing data/drive-folder-map.json')
  const folderMap = JSON.parse(readFileSync(folderMapPath, 'utf-8'))

  const { byVehicle, unmapped } = buildMap(files, folderMap)
  const vehicles = await getVehicles()
  const byId = new Map(vehicles.map((v) => [v.id, v]))

  console.log(`🚗 ${byVehicle.size}/${vehicles.length} vehicles have photos`)
  for (const [vehicleId, images] of byVehicle) {
    const v = byId.get(vehicleId)
    console.log(`   ${v ? vehicleLabel(v) : `UNKNOWN VEHICLE ${vehicleId}`} — ${images.length} photo(s)`)
  }
  if (unmapped.length) {
    console.log(`\n⚠️  ${unmapped.length} Drive folder(s) not linked to a vehicle:`)
    for (const folder of unmapped) console.log(`   ${folder}`)
  }

  if (MODE === 'map') {
    const out = {}
    for (const [vehicleId, images] of byVehicle) {
      out[vehicleId] = images.slice(0, LIMIT).map((i) => ({ id: i.id, name: i.name }))
    }
    const path = resolve(ROOT, 'data/drive-image-map.json')
    writeFileSync(path, JSON.stringify(out, null, 2) + '\n')
    console.log(`\n📝 Wrote ${path}`)
    return
  }

  // --apply
  assertConfig()
  const media = []
  let done = 0
  const total = [...byVehicle.values()].reduce((n, imgs) => n + Math.min(imgs.length, LIMIT), 0)

  for (const [vehicleId, images] of byVehicle) {
    const vehicle = byId.get(vehicleId)
    if (!vehicle) {
      console.warn(`⚠️  Skipping unknown vehicle ${vehicleId}`)
      continue
    }
    const picked = images.slice(0, LIMIT)
    if (PRUNE && !DRY_RUN) {
      await rest(`vehicle_media?vehicle_id=eq.${vehicleId}`, { method: 'DELETE' })
    }
    for (const [index, image] of picked.entries()) {
      const ext = HOTLINK ? '' : '.webp'
      const path = `${vehicleId}/${image.id}${ext}`
      let url
      if (HOTLINK) {
        url = driveLink(image.id)
      } else if (DRY_RUN) {
        url = `${SUPABASE_URL}/storage/v1/object/public/vehicle-media/${path}`
      } else {
        const buf = await downloadImage(image.id)
        url = await uploadToStorage(path, toWebp(buf))
      }
      media.push({
        vehicle_id: vehicleId,
        type: 'image',
        url,
        sort_order: index,
        is_primary: index === 0,
        alt_text: `${vehicleLabel(vehicle)} — photo ${index + 1}`,
      })
      done++
      process.stdout.write(`\r   processed ${done}/${total}`)
    }
  }
  process.stdout.write('\n')

  if (DRY_RUN) {
    console.log(`\nℹ️  Dry run — ${media.length} row(s) prepared, nothing written.`)
    console.log(JSON.stringify(media.slice(0, 3), null, 2))
    return
  }

  for (let i = 0; i < media.length; i += 100) {
    await rest('vehicle_media', { method: 'POST', body: JSON.stringify(media.slice(i, i + 100)) })
  }
  console.log(`\n🎉 Inserted ${media.length} media row(s) across ${byVehicle.size} vehicle(s)`)

  const verify = await rest(`vehicle_media?select=vehicle_id&limit=1000`)
  console.log(`   vehicle_media now holds ${verify.length} row(s)`)
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`)
  process.exit(1)
})
