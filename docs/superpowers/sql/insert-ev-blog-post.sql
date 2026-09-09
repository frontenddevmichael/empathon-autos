-- Insert the EV guide blog post
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New Query)
-- Then the post appears at /blog/ev-guide

INSERT INTO blog_posts (title, slug, body, cover_image, author, published_at, seo_meta)
VALUES (
  'The Complete Guide to Going Electric in Nigeria',
  'ev-guide',
  E'# The Complete Guide to Going Electric in Nigeria\n' ||
  E'**Electric vehicles are no longer the future — they are the smartest choice on the market today.** At Empathon Autos, we source only the cleanest, most reliable EVs from trusted partners and handle everything from import to charging setup. Here is everything you need to know about making the switch.\n\n' ||
  E'## Why Electric Makes Sense in Nigeria Now\n' ||
  E'Fuel prices keep climbing, and generator dependence is part of daily life. An EV gives you predictable running costs, a quieter drive, and far fewer moving parts to maintain. With import-friendly channels and a growing number of charging points across Lagos and Abuja, the timing has never been better.\n\n' ||
  E'## Long Real-World Range\n' ||
  E'Modern Mercedes-Benz EQ models deliver **400–700 km on a single charge** — plenty for Lagos and beyond. A typical week of city driving and the inter-city run to Ibadan or Abeokuta fits comfortably on one charge. Real-world range depends on driving style, traffic, and climate control, but the EQ range is built for how Nigerians actually drive.\n\n' ||
  E'## Charging Infrastructure Reality\n' ||
  E'Most owners charge at home or the office overnight using a standard outlet or a wallbox. We help you plan the setup: a 7.4 kW wallbox gives a full charge in about 6–8 hours for most models. Public DC fast chargers, where available, top you up to 80% in around 30–40 minutes. It is a different rhythm from filling up at a petrol station — but one you can build your day around.\n\n' ||
  E'## Serious Performance\n' ||
  E'Instant torque is the first thing you feel. Electric drivetrains deliver full power from standstill — **0–100 km/h in under 5 seconds on flagship models** — with a green, whisper-quiet ride. No gearbox lag, no engine noise, just smooth, immediate acceleration when you need it.\n\n' ||
  E'## Lower Running Costs\n' ||
  E'No fuel bills. Charging costs a fraction of what you would spend on petrol each month, and with far fewer moving parts — no pistons, no timing belts, no oil changes — there is simply less to repair. Over a five-year ownership window, total cost of ownership typically comes in well below a comparable petrol vehicle.\n\n' ||
  E'## Tech That Leads\n' ||
  E'The EQ range is packed with the latest Mercedes-Benz technology: the **MBUX Hyperscreen**, over-the-air software updates that keep your car current without a workshop visit, and a suite of autonomous-ready driving aids — adaptive cruise, lane keep, blind-spot monitoring — that make long journeys safer and easier.\n\n' ||
  E'## Charging Made Simple\n' ||
  E'Most EV owners in Nigeria charge at home or the office. A standard household outlet works for a slow overnight top-up, while a dedicated 7.4 kW wallbox gets you a full charge in 6–8 hours. We help you plan the setup before the car arrives, so you never start at zero. Public DC fast chargers, where available, take you from 20% to 80% in around 30–40 minutes — perfect for a quick refresh between runs.\n\n' ||
  E'## Battery Health and Warranty\n' ||
  E'Every EV we import arrives with **verified battery health**, so you know exactly what you are getting. Battery care is simple: avoid letting it sit at 100% for long stretches, keep it above 20% when you can, and park out of extreme heat when possible. Follow those habits and the pack will hold strong range for years. We walk every buyer through the dos and don''ts of battery care after delivery.\n\n' ||
  E'## Quiet, Refined Ride\n' ||
  E'With no internal combustion engine, an EV is dramatically quieter at any speed. There is no gearbox lag and no vibration — just smooth, near-silent acceleration. That calm makes traffic easier, long motorway runs more relaxing, and passengers happier.\n\n' ||
  E'## Long-Term Value\n' ||
  E'Premium electric vehicles hold their value well. Demand for clean, low-maintenance cars in Nigeria keeps climbing, and with far fewer moving parts to wear out, resale buyers know they are getting a dependable car. Combined with the fuel and maintenance savings, an EV is a strong long-term investment.\n\n' ||
  E'## How We Source and Import Your EV\n' ||
  E'We bring in vehicles from North America, Europe, the Middle East, and the Far East. Every unit is inspected, the battery health is verified, and the car is prepped for Nigerian roads — speedometer conversion, charging cable set, and documentation handled. You get the vehicle, the paperwork, and honest advice on charging setup.\n\n' ||
  E'## Maintenance and Service in Lagos\n' ||
  E'Electric powertrains need less routine maintenance than petrol engines. What matters is battery care: avoid regularly charging to 100% and letting it drop below 20%, keep the car out of extreme heat when parked, and use scheduled preconditioning in the cold season. Our team walks you through it all after delivery.\n\n' ||
  E'## Next Steps\n' ||
  E'Ready to go electric? Tell us which model you are after and we will source it — with charging advice included. [Book a test drive](/contact) or [browse our EV inventory](/ev) today.',
  'https://images.unsplash.com/photo-1568559598349-dbf322d50a48?w=1200&q=80&fit=crop',
  'Empathon Autos Team',
  now(),
  '{"title":"The Complete Guide to Going Electric in Nigeria","description":"Everything you need to know about going electric in Nigeria — range, charging, battery care, running costs, performance, resale value, and how we source and import your EV."}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  cover_image = EXCLUDED.cover_image,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  seo_meta = EXCLUDED.seo_meta,
  updated_at = now();
