#!/usr/bin/env node
/**
 * Seed with service_role key — bypasses RLS.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=eyJ... node scripts/seed-service.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
if (!url) { console.error('Set VITE_SUPABASE_URL'); process.exit(1) }
const key = process.env.SUPABASE_SERVICE_KEY
if (!key) { console.error('Set SUPABASE_SERVICE_KEY'); process.exit(1) }
const svc = createClient(url, key)

// ─── Real car images from Unsplash ──────────────────────────────
const VEHICLES = [
  {
    make: 'Toyota', model: 'Camry', trim: 'SE 2.5L', year: 2024,
    price: 28500000, currency: 'NGN', mileage: 12000, condition: 'new',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Pearl White',
    body_type: 'sedan', status: 'walk-in', is_featured: true, is_corporate_only: false,
    description: 'Brand new 2024 Toyota Camry SE with premium safety features, adaptive cruise control, and a refined 2.5L engine. Perfect blend of comfort and reliability.',
    features: ['Adaptive Cruise Control', 'Lane Keep Assist', 'Apple CarPlay', 'Blind Spot Monitor', 'Backup Camera'],
    media: [{ url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop', is_primary: true, alt_text: '2024 Toyota Camry SE Pearl White' }],
  },
  {
    make: 'Mercedes-Benz', model: 'GLE', trim: '450 4MATIC', year: 2023,
    price: 65000000, currency: 'NGN', mileage: 28000, condition: 'used',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Obsidian Black',
    body_type: 'suv', status: 'walk-in', is_featured: true, is_corporate_only: false,
    description: 'Stunning Mercedes-Benz GLE 450 with AMG Line package, panoramic roof, and the legendary 3.0L inline-6 with EQ Boost. Executive comfort meets off-road capability.',
    features: ['AMG Line Package', 'Panoramic Roof', 'MBUX Infotainment', 'Burmester Sound', 'Air Suspension'],
    media: [{ url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop', is_primary: true, alt_text: '2023 Mercedes-Benz GLE 450 Obsidian Black' }],
  },
  {
    make: 'BMW', model: 'X5', trim: 'xDrive40i', year: 2024,
    price: 72000000, currency: 'NGN', mileage: 5000, condition: 'new',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Mineral White',
    body_type: 'suv', status: 'pre-order', is_featured: true, is_corporate_only: false,
    description: 'The 2024 BMW X5 xDrive40i — a perfect balance of sporty dynamics and luxury. Features the latest iDrive 8, Harman Kardon audio, and adaptive M suspension.',
    features: ['xDrive AWD', 'Harman Kardon Audio', 'Gesture Control', 'Head-Up Display', 'Wireless Charging'],
    media: [{ url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop', is_primary: true, alt_text: '2024 BMW X5 xDrive40i Mineral White' }],
  },
  {
    make: 'Lexus', model: 'RX', trim: '350h Luxury', year: 2024,
    price: 55000000, currency: 'NGN', mileage: 8000, condition: 'new',
    transmission: 'automatic', fuel_type: 'hybrid', colour: 'Sonic Quartz',
    body_type: 'suv', status: 'walk-in', is_featured: true, is_corporate_only: false,
    description: 'The all-new Lexus RX 350h combines hybrid efficiency with unmistakable luxury. Features the latest Lexus Interface, Mark Levinson audio, and advanced safety suite.',
    features: ['Hybrid Powertrain', 'Mark Levinson Audio', 'Lexus Safety System+', 'Digital Key', 'Massage Seats'],
    media: [{ url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop', is_primary: true, alt_text: '2024 Lexus RX 350h Sonic Quartz' }],
  },
  {
    make: 'Honda', model: 'Civic', trim: 'RS 1.5T', year: 2024,
    price: 22000000, currency: 'NGN', mileage: 3000, condition: 'new',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Rallye Red',
    body_type: 'sedan', status: 'walk-in', is_featured: true, is_corporate_only: false,
    description: 'The Honda Civic RS delivers spirited performance with its turbocharged 1.5L engine, sport-tuned suspension, and aggressive styling. Fun to drive, practical to own.',
    features: ['Turbocharged Engine', 'Sport Mode', 'Honda Sensing', 'Wireless Apple CarPlay', 'LED Headlights'],
    media: [{ url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop', is_primary: true, alt_text: '2024 Honda Civic RS Rallye Red' }],
  },
  {
    make: 'Ford', model: 'Explorer', trim: 'ST-Line', year: 2023,
    price: 48000000, currency: 'NGN', mileage: 18000, condition: 'used',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Forged Green',
    body_type: 'suv', status: 'walk-in', is_featured: true, is_corporate_only: false,
    description: 'The Ford Explorer ST-Line brings American muscle to the SUV segment. 3.0L EcoBoost V6, sport suspension, and three-row seating for the whole family.',
    features: ['3.0L EcoBoost V6', 'Sport Suspension', 'SYNC 4', '360° Camera', 'Hands-Free Liftgate'],
    media: [{ url: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&h=600&fit=crop', is_primary: true, alt_text: '2023 Ford Explorer ST-Line Forged Green' }],
  },
]

const TESTIMONIALS = [
  { name: 'Chioma Eze', company: 'Lagos Business School', rating: 5, quote: 'Empathon Autos made my first car purchase seamless. From selection to delivery, every step was transparent and professional.', is_published: true, sort_order: 1 },
  { name: 'Ahmed Bello', company: 'Kano Chamber of Commerce', rating: 5, quote: 'We sourced our entire fleet through Empathon. Their corporate sales team delivered beyond expectations. Five SUVs, all delivered on time.', is_published: true, sort_order: 2 },
  { name: 'Ngozi Eze', company: null, rating: 5, quote: 'I was nervous about importing but they handled everything. I just showed up and drove away. The pre-order process was surprisingly smooth.', is_published: true, sort_order: 3 },
  { name: 'Tunde Adesanya', company: 'TechBridge Solutions', rating: 5, quote: 'Best car buying experience in Lagos. No haggling, no hidden fees. Fair price, car exactly as described. Will definitely buy again.', is_published: true, sort_order: 4 },
  { name: 'Funke Akindele', company: null, rating: 4, quote: 'Professional, reliable, and honest. Empathon found the exact spec I wanted through pre-order. About 6 weeks from deposit to delivery.', is_published: true, sort_order: 5 },
  { name: 'Emeka Obi', company: 'Dangote Industries', rating: 5, quote: 'As a fleet manager I need reliability. Empathon has been our go-to for 3 years. Their after-sales support is genuinely excellent.', is_published: true, sort_order: 6 },
]

const CLIENTS = [
  { name: 'Radisson Blu Hotel', desc: 'Fleet partner since 2021' },
  { name: 'Johnvents Group', desc: 'Corporate account' },
  { name: 'Dangote Industries', desc: 'Executive fleet provider' },
  { name: 'MTN Nigeria', desc: 'Corporate vehicles' },
  { name: 'Access Bank', desc: 'Staff vehicle programme' },
]

async function seed() {
  // First clean existing data to avoid duplicates on re-run
  console.log('🧹 Cleaning existing data...')
  await svc.from('vehicle_media').delete().neq('id', '00000000-0000-0000-0000-000000000000') // delete all
  await svc.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('🚗 Seeding 6 vehicles with real Unsplash images...')
  for (const v of VEHICLES) {
    const { media, ...vehicleData } = v
    const { data: inserted, error } = await svc.from('vehicles').insert(vehicleData).select('id').single()
    if (error) { console.error(`  ✗ ${v.make} ${v.model}:`, error.message); continue }
    if (media?.length) {
      const mediaRows = media.map((m, i) => ({
        vehicle_id: inserted.id, type: 'image', url: m.url,
        sort_order: i, is_primary: m.is_primary, alt_text: m.alt_text,
      }))
      const { error: me } = await svc.from('vehicle_media').insert(mediaRows)
      if (me) console.error(`  ✗ Media for ${v.make} ${v.model}:`, me.message)
    }
    console.log(`  ✓ ${v.year} ${v.make} ${v.model} ${v.trim}`)
  }

  console.log('\n💬 Seeding 6 testimonials...')
  await svc.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  for (const t of TESTIMONIALS) {
    const { error } = await svc.from('testimonials').insert(t)
    if (error) { console.error(`  ✗ ${t.name}:`, error.message); continue }
    console.log(`  ✓ ${t.name} (${t.rating}★)`)
  }

  console.log('\n🏢 Seeding client logos in content_blocks...')
  const existing = await svc.from('content_blocks').select('id').eq('page_key', 'home').eq('title', 'clients').single()
  if (existing.data) {
    const { error } = await svc.from('content_blocks').update({ body: JSON.stringify(CLIENTS) }).eq('id', existing.data.id)
    if (error) console.error('  ✗ Update clients:', error.message); else console.log('  ✓ Updated clients block')
  } else {
    const { error } = await svc.from('content_blocks').insert({ page_key: 'home', title: 'clients', body: JSON.stringify(CLIENTS) })
    if (error) console.error('  ✗ Insert clients:', error.message); else console.log('  ✓ Created clients block')
  }

  // Verify counts
  const { count: vCount } = await svc.from('vehicles').select('*', { count: 'exact', head: true })
  const { count: tCount } = await svc.from('testimonials').select('*', { count: 'exact', head: true })
  const { count: mCount } = await svc.from('vehicle_media').select('*', { count: 'exact', head: true })
  console.log(`\n✅ Done! Vehicles: ${vCount}, Media: ${mCount}, Testimonials: ${tCount}`)
}

seed().catch(err => { console.error('Fatal:', err); process.exit(1) })
