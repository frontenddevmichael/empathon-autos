#!/usr/bin/env node
/**
 * Seed via Management API — bypasses RLS by running SQL with service_role.
 *
 * Usage:
 *   SUPABASE_PAT=sbp_xxx node scripts/seed-via-api.mjs
 *
 * The PAT must have at least "Project:Write" scope.
 */

const PAT = process.env.SUPABASE_PAT
if (!PAT) {
  console.error('Set SUPABASE_PAT (personal access token)')
  process.exit(1)
}

const PROJECT_REF = 'khexlszvtkdgkmxkadjz'
const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}`

async function runSql(sql) {
  const res = await fetch(`${API}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAT}`,
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SQL API ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Real car images from Unsplash ──────────────────────────────

const SQL = `

-- 1. VEHICLES (6 cars with real Unsplash images)
INSERT INTO vehicles (id, make, model, trim, year, price, currency, mileage, condition, transmission, fuel_type, colour, body_type, description, features, status, is_featured, is_corporate_only)
VALUES
  (gen_random_uuid(), 'Toyota', 'Camry', 'SE 2.5L', 2024, 28500000, 'NGN', 12000, 'new', 'automatic', 'petrol', 'Pearl White', 'sedan', 'Brand new 2024 Toyota Camry SE with premium safety features, adaptive cruise control, and a refined 2.5L engine. Perfect blend of comfort and reliability.', '["Adaptive Cruise Control","Lane Keep Assist","Apple CarPlay","Blind Spot Monitor","Backup Camera"]'::jsonb, 'walk-in', true, false),
  (gen_random_uuid(), 'Mercedes-Benz', 'GLE', '450 4MATIC', 2023, 65000000, 'NGN', 28000, 'used', 'automatic', 'petrol', 'Obsidian Black', 'suv', 'Stunning Mercedes-Benz GLE 450 with AMG Line package, panoramic roof, and the legendary 3.0L inline-6 with EQ Boost. Executive comfort meets off-road capability.', '["AMG Line Package","Panoramic Roof","MBUX Infotainment","Burmester Sound","Air Suspension"]'::jsonb, 'walk-in', true, false),
  (gen_random_uuid(), 'BMW', 'X5', 'xDrive40i', 2024, 72000000, 'NGN', 5000, 'new', 'automatic', 'petrol', 'Mineral White', 'suv', 'The 2024 BMW X5 xDrive40i — a perfect balance of sporty dynamics and luxury. Features the latest iDrive 8, Harman Kardon audio, and adaptive M suspension.', '["xDrive AWD","Harman Kardon Audio","Gesture Control","Head-Up Display","Wireless Charging"]'::jsonb, 'pre-order', true, false),
  (gen_random_uuid(), 'Lexus', 'RX', '350h Luxury', 2024, 55000000, 'NGN', 8000, 'new', 'automatic', 'hybrid', 'Sonic Quartz', 'suv', 'The all-new Lexus RX 350h combines hybrid efficiency with unmistakable luxury. Features the latest Lexus Interface, Mark Levinson audio, and advanced safety suite.', '["Hybrid Powertrain","Mark Levinson Audio","Lexus Safety System+","Digital Key","Massage Seats"]'::jsonb, 'walk-in', true, false),
  (gen_random_uuid(), 'Honda', 'Civic', 'RS 1.5T', 2024, 22000000, 'NGN', 3000, 'new', 'automatic', 'petrol', 'Rallye Red', 'sedan', 'The Honda Civic RS delivers spirited performance with its turbocharged 1.5L engine, sport-tuned suspension, and aggressive styling. Fun to drive, practical to own.', '["Turbocharged Engine","Sport Mode","Honda Sensing","Wireless Apple CarPlay","LED Headlights"]'::jsonb, 'walk-in', true, false),
  (gen_random_uuid(), 'Ford', 'Explorer', 'ST-Line', 2023, 48000000, 'NGN', 18000, 'used', 'automatic', 'petrol', 'Forged Green', 'suv', 'The Ford Explorer ST-Line brings American muscle to the SUV segment. 3.0L EcoBoost V6, sport suspension, and three-row seating for the whole family.', '["3.0L EcoBoost V6","Sport Suspension","SYNC 4","360° Camera","Hands-Free Liftgate"]'::jsonb, 'walk-in', true, false);

-- 2. VEHICLE MEDIA (map to the vehicles just inserted)
INSERT INTO vehicle_media (vehicle_id, type, url, sort_order, is_primary, alt_text)
SELECT id, 'image', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop', 0, true, '2024 Toyota Camry SE Pearl White'
FROM vehicles WHERE make = 'Toyota' AND model = 'Camry' LIMIT 1;

INSERT INTO vehicle_media (vehicle_id, type, url, sort_order, is_primary, alt_text)
SELECT id, 'image', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop', 0, true, '2023 Mercedes-Benz GLE 450 Obsidian Black'
FROM vehicles WHERE make = 'Mercedes-Benz' AND model = 'GLE' LIMIT 1;

INSERT INTO vehicle_media (vehicle_id, type, url, sort_order, is_primary, alt_text)
SELECT id, 'image', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop', 0, true, '2024 BMW X5 xDrive40i Mineral White'
FROM vehicles WHERE make = 'BMW' AND model = 'X5' LIMIT 1;

INSERT INTO vehicle_media (vehicle_id, type, url, sort_order, is_primary, alt_text)
SELECT id, 'image', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop', 0, true, '2024 Lexus RX 350h Sonic Quartz'
FROM vehicles WHERE make = 'Lexus' AND model = 'RX' LIMIT 1;

INSERT INTO vehicle_media (vehicle_id, type, url, sort_order, is_primary, alt_text)
SELECT id, 'image', 'https://images.unsplash.com/photo-1606611013016-969c19ba27a5?w=800&h=600&fit=crop', 0, true, '2024 Honda Civic RS Rallye Red'
FROM vehicles WHERE make = 'Honda' AND model = 'Civic' LIMIT 1;

INSERT INTO vehicle_media (vehicle_id, type, url, sort_order, is_primary, alt_text)
SELECT id, 'image', 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&h=600&fit=crop', 0, true, '2023 Ford Explorer ST-Line Forged Green'
FROM vehicles WHERE make = 'Ford' AND model = 'Explorer' LIMIT 1;

-- 3. TESTIMONIALS
INSERT INTO testimonials (name, company, rating, quote, is_published, sort_order) VALUES
  ('Chioma Eze', 'Lagos Business School', 5, 'Empathon Autos made my first car purchase seamless. From selection to delivery, every step was transparent and professional. I drove home in a brand new Camry within a week.', true, 1),
  ('Ahmed Bello', 'Kano Chamber of Commerce', 5, 'We sourced our entire fleet through Empathon. Their corporate sales team understood our needs and delivered beyond expectations. Five SUVs, all delivered on time.', true, 2),
  ('Ngozi Eze', NULL, 5, 'I was nervous about importing a car but they handled everything. I just showed up and drove away. The pre-order process was surprisingly smooth and transparent.', true, 3),
  ('Tunde Adesanya', 'TechBridge Solutions', 5, 'Best car buying experience in Lagos. No haggling, no hidden fees. They gave me a fair price and the car was exactly as described. Will definitely buy from them again.', true, 4),
  ('Funke Akindele', NULL, 4, 'Professional, reliable, and honest. Empathon found me the exact spec I wanted through their pre-order service. The whole process took about 6 weeks from deposit to delivery.', true, 5),
  ('Emeka Obi', 'Dangote Industries', 5, 'As a corporate fleet manager, I need reliability and consistency. Empathon has been our go-to for 3 years now. Their after-sales support is genuinely excellent.', true, 6);

-- 4. CLIENTS (content_blocks)
INSERT INTO content_blocks (page_key, title, body)
VALUES ('home', 'clients', '[{"name":"Radisson Blu Hotel","desc":"Fleet partner since 2021"},{"name":"Johnvents Group","desc":"Corporate account"},{"name":"Dangote Industries","desc":"Executive fleet provider"},{"name":"MTN Nigeria","desc":"Corporate vehicles"},{"name":"Access Bank","desc":"Staff vehicle programme"}]')
ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

SELECT 'VEHICLES' AS table_name, COUNT(*) AS count FROM vehicles
UNION ALL SELECT 'VEHICLE_MEDIA', COUNT(*) FROM vehicle_media
UNION ALL SELECT 'TESTIMONIALS', COUNT(*) FROM testimonials
UNION ALL SELECT 'CONTENT_BLOCKS', COUNT(*) FROM content_blocks WHERE page_key = 'home';
`

async function main() {
  console.log('🚀 Seeding via Management API (service_role bypassing RLS)...')
  const result = await runSql(SQL)
  console.log('✅ Seeding complete!')
  console.log('\nRow counts (should be > 0 for each):')
  if (Array.isArray(result)) {
    result.forEach(r => console.log(`  ${r.table_name}: ${r.count}`))
  } else {
    console.log('  Result:', JSON.stringify(result, null, 2))
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
