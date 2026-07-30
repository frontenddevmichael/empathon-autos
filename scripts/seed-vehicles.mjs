#!/usr/bin/env node
/**
 * Quick seed script — inserts sample vehicles using the anon key.
 * Run with: node scripts/seed-vehicles.mjs
 *
 * NOTE: This uses the anon key, so vehicles will be created with
 * status='draft'. The admin can then update their status.
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !anonKey) { console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'); process.exit(1) }

const supabase = createClient(url, anonKey)

const VEHICLES = [
  {
    make: 'Toyota', model: 'Camry', trim: 'SE 2.5L', year: 2024,
    price: 28500000, currency: 'NGN', mileage: 12000, condition: 'new',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Pearl White',
    body_type: 'sedan', status: 'published', is_featured: true,
    description: 'Brand new 2024 Toyota Camry SE with premium safety features.',
    features: ['Adaptive Cruise Control', 'Lane Keep Assist', 'Apple CarPlay'],
    media_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
  },
  {
    make: 'Mercedes-Benz', model: 'GLE', trim: '450 4MATIC', year: 2023,
    price: 65000000, currency: 'NGN', mileage: 28000, condition: 'used',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Obsidian Black',
    body_type: 'suv', status: 'published', is_featured: true,
    description: 'Stunning Mercedes-Benz GLE 450 with AMG Line package.',
    features: ['AMG Line Package', 'Panoramic Roof', 'MBUX Infotainment'],
    media_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
  },
  {
    make: 'BMW', model: 'X5', trim: 'xDrive40i', year: 2024,
    price: 72000000, currency: 'NGN', mileage: 5000, condition: 'new',
    transmission: 'automatic', fuel_type: 'petrol', colour: 'Mineral White',
    body_type: 'suv', status: 'published', is_featured: true,
    description: 'The 2024 BMW X5 xDrive40i — sporty dynamics and luxury.',
    features: ['xDrive AWD', 'Harman Kardon Audio', 'Head-Up Display'],
    media_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
  },
  {
    make: 'Lexus', model: 'RX', trim: '350h Luxury', year: 2024,
    price: 55000000, currency: 'NGN', mileage: 8000, condition: 'new',
    transmission: 'automatic', fuel_type: 'hybrid', colour: 'Sonic Quartz',
    body_type: 'suv', status: 'published', is_featured: true,
    description: 'The all-new Lexus RX 350h combines hybrid efficiency with luxury.',
    features: ['Hybrid Powertrain', 'Mark Levinson Audio', 'Massage Seats'],
    media_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop',
  },
]

async function seed() {
  console.log('🚗 Seeding 4 sample vehicles...\n')

  for (const v of VEHICLES) {
    const { media_url, ...vehicleData } = v
    const { data: inserted, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select('id')
      .single()

    if (error) {
      console.error(`  ✗ ${v.make} ${v.model}: ${error.message}`)
      continue
    }

    // Insert vehicle media
    if (media_url) {
      const { error: me } = await supabase.from('vehicle_media').insert({
        vehicle_id: inserted.id,
        type: 'image',
        url: media_url,
        sort_order: 0,
        is_primary: true,
        alt_text: `${v.year} ${v.make} ${v.model} ${v.colour}`,
      })
      if (me) console.error(`  ✗ Media for ${v.make} ${v.model}: ${me.message}`)
    }

    console.log(`  ✓ ${v.year} ${v.make} ${v.model} ${v.trim} (₦${(v.price / 1_000_000).toFixed(1)}M)`)
  }

  // Verify
  const { count } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
  console.log(`\n✅ Done! Total vehicles in database: ${count}`)
}

seed().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
