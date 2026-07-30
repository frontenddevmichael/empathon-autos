-- ═══════════════════════════════════════════════════════════════
-- CLEAN SETUP — Creates all tables from scratch
-- No auth.sign_up() — safe to run in SQL Editor or via CLI
-- ═══════════════════════════════════════════════════════════════

-- Drop ALL existing tables (safe if they don't exist)
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS lots CASCADE;
DROP TABLE IF EXISTS pre_orders CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS content_blocks CASCADE;
DROP TABLE IF EXISTS vehicle_media CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP EXTENSION IF EXISTS pgcrypto;

-- ═══════════════════════════════════════════════════════════════
-- EXTENSION
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION pgcrypto;

-- ═══════════════════════════════════════════════════════════════
-- 1. VEHICLES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT DEFAULT '',
  year INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  mileage INTEGER NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'used' CHECK (condition IN ('new','used','certified-pre-owned')),
  transmission TEXT NOT NULL DEFAULT 'automatic' CHECK (transmission IN ('automatic','manual','semi-automatic')),
  fuel_type TEXT NOT NULL DEFAULT 'petrol' CHECK (fuel_type IN ('petrol','diesel','electric','hybrid','plug-in-hybrid')),
  colour TEXT DEFAULT '',
  body_type TEXT DEFAULT 'sedan' CHECK (body_type IN ('sedan','suv','hatchback','coupe','convertible','pickup','wagon','van','truck')),
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('walk-in','pre-order','sold','in-auction','draft','published')),
  is_corporate_only BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. VEHICLE MEDIA
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE vehicle_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image','video')),
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  alt_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. LEADS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('enquiry','test-drive','corporate-quote','pre-order','contact')),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','in-progress','won','lost')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_page TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. PRE-ORDERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE pre_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  spec_preferences JSONB DEFAULT '{}'::jsonb,
  deposit_status TEXT DEFAULT 'pending' CHECK (deposit_status IN ('pending','paid','refunded')),
  expected_availability TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. TESTIMONIALS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  photo TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 6. CONTENT BLOCKS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  title TEXT DEFAULT '',
  body TEXT DEFAULT '',
  media JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. PROFILES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin','admin','staff','editor')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. LOTS (auctions)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  opening_bid NUMERIC(12,2) NOT NULL,
  reserve_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_bid NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','open','closing','closed','sold','unsold')),
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ NOT NULL,
  extended_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 9. BIDS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(12,2) NOT NULL,
  placed_at TIMESTAMPTZ DEFAULT now(),
  outcome TEXT CHECK (outcome IN ('accepted','rejected'))
);

-- ═══════════════════════════════════════════════════════════════
-- 10. BLOG POSTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT DEFAULT '',
  cover_image TEXT,
  author TEXT DEFAULT '',
  published_at TIMESTAMPTZ,
  seo_meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 11. ADMIN ACTIVITY LOG
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_make ON vehicles(make);
CREATE INDEX idx_vehicles_featured ON vehicles(is_featured) WHERE is_featured = true;
CREATE UNIQUE INDEX idx_content_blocks_page_key_title ON content_blocks(page_key, title);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view published vehicles" ON vehicles FOR SELECT
  USING (status IN ('walk-in','pre-order','in-auction','published'));
CREATE POLICY "Public can view media" ON vehicle_media FOR SELECT USING (true);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT
  USING (is_published = true);
CREATE POLICY "Public can view content" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "Public can view lots" ON lots FOR SELECT USING (true);
CREATE POLICY "Public can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= now());

-- ═══════════════════════════════════════════════════════════════
-- AUTO-UPDATE TRIGGERS
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_pre_orders_updated_at BEFORE UPDATE ON pre_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_lots_updated_at BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_content_blocks_updated_at BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'staff')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- ✅ VERIFICATION
-- ═══════════════════════════════════════════════════════════════
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
