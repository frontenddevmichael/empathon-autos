-- CMS Migration: Move hardcoded UI data to content_blocks table
-- Run this SQL in your Supabase SQL Editor to populate the CMS

-- ============================================================
-- HOME PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('home', 'hero_title', 'Your Next Drive Starts Here.'),
('home', 'hero_subtitle', 'Premium vehicles sourced from four continents — inspected, imported, and delivered to your doorstep in Lagos.'),
('home', 'hero_image', '/heroimg.jpg'),
('home', 'hero_label', 'Lagos . Since 2019'),
('home', 'stats', '[{"label":"Vehicles Imported","target":500,"suffix":"+"},{"label":"Happy Clients","target":300,"suffix":"+"},{"label":"Years in Business","target":7,"suffix":""},{"label":"Countries Sourced","target":4,"suffix":""}]'),
('home', 'featured_section_label', 'Collection'),
('home', 'featured_section_title', 'Featured Vehicles'),
('home', 'featured_section_desc', 'Handpicked vehicles from Japan, Dubai, Europe, and the US — inspected, imported, and ready to drive.'),
('home', 'learning_section_label', 'Learning Centre'),
('home', 'learning_section_title', 'Drive Smarter'),
('home', 'learning_section_desc', 'Tips, guides, and insights from the Empathon Autos team.'),
('home', 'ev_teaser_label', 'Electric Vehicles'),
('home', 'ev_teaser_title', 'Go Electric. Go Green.'),
('home', 'ev_teaser_desc', 'The future of driving is here. Explore our range of premium electric vehicles — from city commuters to luxury SUVs.'),
('home', 'how_to_buy_label', 'How to Buy'),
('home', 'how_to_buy_title', 'Two Ways to Drive'),
('home', 'walkin_title', 'Walk-In Purchase'),
('home', 'walkin_desc', 'Browse our current inventory and drive home today. Every vehicle is inspected, priced transparently, and ready for immediate delivery.'),
('home', 'preorder_title', 'Pre-Order'),
('home', 'preorder_desc', 'Can''t find what you want? Tell us your dream car and we''ll source it from our global network — Japan, Dubai, Europe, or the US.'),
('home', 'who_we_serve_label', 'Who We Serve'),
('home', 'who_we_serve_title', 'Tailored for You'),
('home', 'individual_title', 'Individual Buyers'),
('home', 'individual_desc', 'Your first car, your dream car, or your next upgrade — we help you find the right fit without the dealer runaround.'),
('home', 'corporate_title', 'Corporate & Fleet'),
('home', 'corporate_desc', 'Building a fleet? We offer volume pricing, dedicated account management, and fleet maintenance support.'),
('home', 'clients_label', 'Trusted By'),
('home', 'clients_title', 'Our Clients'),
('home', 'clients_desc', 'Organisations that trust us with their vehicle needs.'),
('home', 'testimonials_label', 'Testimonials'),
('home', 'testimonials_title', 'What Our Clients Say'),
('home', 'cta_title', 'Ready to Find Your Car?'),
('home', 'cta_desc', 'Whether you''re buying your first car or building a fleet, we''re here to help. No pressure — just honest guidance.')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- ABOUT PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('about', 'hero_title', 'Premium Vehicles, Sourced Globally.'),
('about', 'hero_subtitle', 'From Tokyo to Lagos — we bring the world''s finest vehicles to your driveway. No shortcuts, no surprises.'),
('about', 'hero_image', '/heroimg.jpg'),
('about', 'stats', '[{"value":7,"suffix":"+","label":"Years Active"},{"value":500,"suffix":"+","label":"Vehicles Delivered"},{"value":4,"suffix":"","label":"Countries Sourced"},{"value":98,"suffix":"%","label":"Client Satisfaction"}]'),
('about', 'process_steps', '[{"title":"Source","desc":"We scout Japan, Dubai, Europe, and the US for the best vehicles at the right price."},{"title":"Inspect","desc":"Every vehicle goes through rigorous inspection before it''s approved for import."},{"title":"Import","desc":"We handle logistics, customs, and documentation — end to end."},{"title":"Deliver","desc":"You get your car with full paperwork, warranty, and a team behind you."}]'),
('about', 'why_us', '[{"heading":"Global Sourcing, Local Trust","desc":"We have direct relationships with exporters in Japan, Dubai, Europe, and the US. No middlemen, no markups — just honest pricing on quality vehicles.","image":"/heroimg2.jpg"},{"heading":"Every Vehicle, Verified","desc":"Before any car reaches our lot, it passes through multi-point inspections. We don''t cut corners — because our reputation depends on every vehicle we deliver.","image":"/heroimg4.jpg"}]'),
('about', 'parallax_quote', '"We don''t just sell cars — we build relationships that last longer than any warranty."'),
('about', 'cta_title', 'Ready to Find Your Next Car?'),
('about', 'cta_desc', 'Whether you''re buying your first car or building a fleet, we''re here to help. No pressure — just honest guidance.')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- CORPORATE PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('corporate', 'hero_title', 'Corporate & Fleet Solutions'),
('corporate', 'hero_subtitle', 'Volume pricing, dedicated support, and fleet management for organisations across Nigeria.'),
('corporate', 'hero_image', '/heroimg2.jpg'),
('corporate', 'fleet_deals', '[{"sector":"Hospital & Health","vehicles":"Toyota Camry, Honda Accord, Hyundai Tucson","price":"From N18M per unit","volumePricing":"5+ units: 10% discount","benefits":["Patient transport vehicles","Staff shuttle fleet","Executive cars for management"]},{"sector":"Police / Security / Government","vehicles":"Toyota Hilux, Ford Ranger, Land Cruiser Prado","price":"From N25M per unit","volumePricing":"10+ units: 15% discount","benefits":["Armored vehicle options","Fleet tracking integration","Government procurement compliant"]},{"sector":"Banks & Finance","vehicles":"Mercedes-Benz E-Class, BMW 5 Series, Lexus ES","price":"From N35M per unit","volumePricing":"5+ units: 12% discount","benefits":["Executive fleet solutions","Client meeting vehicles","Branch delivery vehicles"]},{"sector":"Logistics & Transport","vehicles":"Toyota Hiace, Ford Transit, Mercedes Sprinter","price":"From N22M per unit","volumePricing":"10+ units: 18% discount","benefits":["Cargo van configurations","Last-mile delivery vehicles","Temperature-controlled options"]},{"sector":"Hospitality","vehicles":"Toyota Camry, Hyundai Sonata, Mercedes C-Class","price":"From N20M per unit","volumePricing":"5+ units: 10% discount","benefits":["Guest transfer vehicles","VIP shuttle fleet","Airport pickup vehicles"]},{"sector":"Oil & Gas / Energy","vehicles":"Toyota Land Cruiser, Ford Ranger, Hilux","price":"From N30M per unit","volumePricing":"10+ units: 15% discount","benefits":["Off-road capable vehicles","Field operation fleet","Executive travel vehicles"]},{"sector":"Real Estate & Construction","vehicles":"Toyota Hilux, Ford Ranger, Mitsubishi L200","price":"From N22M per unit","volumePricing":"5+ units: 12% discount","benefits":["Site inspection vehicles","Material transport","Project management fleet"]},{"sector":"Manufacturing & Industrial","vehicles":"Toyota Hiace, Hyundai H1, Ford Transit","price":"From N20M per unit","volumePricing":"10+ units: 18% discount","benefits":["Worker shuttle vehicles","Parts delivery","Executive sedan fleet"]}]'),
('corporate', 'why_choose_us', '[{"title":"Dedicated Account Manager","desc":"A single point of contact for all your fleet needs — from sourcing to maintenance."},{"title":"Pre-Delivery Inspection","desc":"Every vehicle undergoes rigorous inspection before it reaches your fleet."},{"title":"24/7 Support Line","desc":"Round-the-clock support for fleet issues, breakdowns, and emergency replacements."},{"title":"Fleet Management Portal","desc":"Track your vehicles, maintenance schedules, and costs in one dashboard."}]'),
('corporate', 'volume_tiers', '[{"units":"1-4 units","discount":"Standard pricing"},{"units":"5-9 units","discount":"8-12% discount"},{"units":"10-19 units","discount":"12-18% discount"},{"units":"20+ units","discount":"Custom quote","featured":true}]')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- ELECTRIC VEHICLES PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('ev', 'hero_title', 'Electric Vehicles'),
('ev', 'hero_subtitle', 'Premium EVs sourced from global markets — zero emissions, zero compromise.'),
('ev', 'hero_image', '/heroimg5.jpg'),
('ev', 'ev_brands', '[{"name":"Mercedes-Benz","models":8,"tagline":"Luxury meets electric"},{"name":"BMW","models":5,"tagline":"Ultimate electric driving machine"},{"name":"Tesla","models":4,"tagline":"Leading the electric revolution"},{"name":"Audi","models":3,"tagline":"Vorsprung durch Technik"},{"name":"Porsche","models":2,"tagline":"Electric performance"},{"name":"Hyundai","models":3,"tagline":"Electric for everyone"}]'),
('ev', 'ev_models', '[{"name":"Mercedes-Benz EQS","range":"680 km","power":"516 hp","tag":"Luxury Sedan","price":"N85M+"},{"name":"Mercedes-Benz EQE","range":"620 km","power":"288 hp","tag":"Executive Sedan","price":"N65M+"},{"name":"BMW iX","range":"600 km","power":"516 hp","tag":"Luxury SUV","price":"N75M+"},{"name":"Tesla Model S","range":"650 km","power":"670 hp","tag":"Performance Sedan","price":"N80M+"},{"name":"Mercedes-Benz EQB","range":"440 km","power":"215 hp","tag":"Family SUV","price":"N55M+"},{"name":"BMW i4","range":"520 km","power":"335 hp","tag":"Sport Sedan","price":"N60M+"}]'),
('ev', 'cost_savings', '[{"title":"Fuel Savings","desc":"Save up to N2M annually on fuel costs compared to petrol vehicles.","amount":"N2M+/year"},{"title":"Maintenance Savings","desc":"Fewer moving parts means significantly lower maintenance costs.","amount":"N500K+/year"},{"title":"Time Savings","desc":"Home charging means no more fuel station queues.","amount":"100+ hrs/year"},{"title":"Total Cost of Ownership","desc":"EVs cost 30-40% less to own over 5 years compared to equivalent petrol vehicles.","amount":"30-40% less"}]'),
('ev', 'benefits', '[{"title":"Long Real-World Range","desc":"Modern EVs deliver 400-700 km on a single charge — more than enough for daily driving and road trips."},{"title":"Serious Performance","desc":"Instant torque delivery means 0-100 km/h times that rival sports cars."},{"title":"Zero Emissions","desc":"No tailpipe emissions, no carbon footprint, cleaner air for Lagos."},{"title":"Tech That Leads","desc":"Over-the-air updates, autonomous driving features, and cutting-edge infotainment."},{"title":"Charging Made Simple","desc":"Home charging, workplace charging, and a growing network of public chargers across Nigeria."},{"title":"Battery Health & Warranty","desc":"8-year battery warranties and advanced thermal management for long-term peace of mind."},{"title":"Quiet, Refined Ride","desc":"No engine noise means a peaceful cabin and a more comfortable drive."},{"title":"Long-Term Value","desc":"EVs hold their value better as demand grows and fuel costs rise."}]')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- PRE-ORDER PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('pre-order', 'hero_title', 'Pre-Order Your Dream Car'),
('pre-order', 'hero_subtitle', 'Can''t find what you want in our inventory? Tell us your dream car and we''ll source it.'),
('pre-order', 'hero_image', '/heroimg4.jpg'),
('pre-order', 'steps', '[{"title":"Tell Us What You Want","desc":"Share your dream car — make, model, colour, specs. We''ll find it in our global network."},{"title":"Secure It With a Deposit","desc":"A refundable deposit locks in your order and starts the sourcing process."},{"title":"We Handle Everything","desc":"Sourcing, inspection, shipping, customs — we manage the entire import process."},{"title":"Inspect & Drive Away","desc":"Inspect your car at our Lagos lot, complete paperwork, and drive away happy."}]'),
('pre-order', 'cta_title', 'Ready to Pre-Order?'),
('pre-order', 'cta_desc', 'Tell us what you''re looking for and we''ll get back to you within 24 hours with a quote.')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- CONTACT PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('contact', 'hero_title', 'Let''s Talk'),
('contact', 'hero_subtitle', 'Have a question, need a quote, or just want to talk cars? We''d love to hear from you.'),
('contact', 'hero_image', '/heroimg5.jpg'),
('contact', 'form_title', 'Send a Message'),
('contact', 'form_subtitle', 'We''ll get back to you within 24 hours.')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- INVENTORY PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('inventory', 'hero_title', 'Browse Our Collection'),
('inventory', 'hero_subtitle', 'Real cars. Real prices. Ready to drive.'),
('inventory', 'hero_image', '/heroimg3.jpg'),
('inventory', 'empty_title', 'No vehicles found'),
('inventory', 'empty_desc', 'Try adjusting your filters or check back soon — new inventory arrives weekly.')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- BLOG PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('blog', 'hero_title', 'Latest Articles'),
('blog', 'hero_subtitle', 'Insights, tips, and stories from the Empathon Autos team.'),
('blog', 'hero_image', '/heroimg3.jpg'),
('blog', 'cta_title', 'Have a topic in mind?'),
('blog', 'cta_desc', 'Tell us what you''d like us to cover — buying guides, import insights, EV deep-dives. We read every request.')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- KYC REGISTRATION PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('kyc', 'hero_title', 'Register to Bid'),
('kyc', 'hero_subtitle', 'Create your account to participate in live auctions and access premium inventory.'),
('kyc', 'hero_image', '/heroimg2.jpg'),
('kyc', 'benefits', '["Participate in live auctions and place bids","Receive personalised vehicle recommendations","Get priority access to new inventory","Our team can reach out for corporate opportunities","Track your bidding history and status"]')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- AUCTIONS PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('auctions', 'hero_title', 'Live Auctions'),
('auctions', 'hero_subtitle', 'Bid on premium vehicles at competitive prices. Register to participate.'),
('auctions', 'hero_image', '/heroimg.jpg')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;

-- ============================================================
-- USER DASHBOARD PAGE
-- ============================================================

INSERT INTO content_blocks (page_key, title, body) VALUES
('dashboard', 'hero_title', 'My Dashboard'),
('dashboard', 'hero_subtitle', 'Track your bids, orders, and account activity.'),
('dashboard', 'hero_image', '/heroimg3.jpg')

ON CONFLICT (page_key, title) DO UPDATE SET body = EXCLUDED.body;
