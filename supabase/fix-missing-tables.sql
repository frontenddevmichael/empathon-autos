-- ═══════════════════════════════════════════════════════════════
-- Fix Missing Content Sections
-- Run this in your Supabase SQL Editor (one click, ~5 seconds)
-- ═══════════════════════════════════════════════════════════════

-- 1. Create the content_blocks table (stores Trusted Clients, Leadership, etc.)
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  title TEXT DEFAULT '',
  body TEXT DEFAULT '',
  media JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow multiple blocks per page (e.g. 'home' can have 'clients', 'hero', etc.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_blocks_page_key_title
  ON content_blocks(page_key, title);

UPDATE content_blocks SET updated_at = now() WHERE updated_at IS NULL;

-- 2. Public can READ content blocks (needed for the homepage to fetch them)
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view content" ON content_blocks;
CREATE POLICY "Public can view content" ON content_blocks
  FOR SELECT USING (true);

-- Admin policy (safe to run even if profiles table doesn't exist yet)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    EXECUTE 'CREATE POLICY "Admins can manage content" ON content_blocks
      FOR ALL USING (
        auth.role() = ''authenticated''
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''super_admin'',''admin'',''staff''))
      )';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage content" ON content_blocks
      FOR ALL USING (auth.role() = ''authenticated'')';
  END IF;
END;
$$;

-- 3. Create the testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
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

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published testimonials" ON testimonials;
CREATE POLICY "Public can view published testimonials" ON testimonials
  FOR SELECT USING (is_published = true);

-- Admin policy (safe to run even if profiles table doesn't exist yet)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    EXECUTE 'CREATE POLICY "Admins can manage testimonials" ON testimonials
      FOR ALL USING (
        auth.role() = ''authenticated''
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''super_admin'',''admin'',''staff''))
      )';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage testimonials" ON testimonials
      FOR ALL USING (auth.role() = ''authenticated'')';
  END IF;
END;
$$;

-- 4. 🔥 Seed default content so sections appear immediately
INSERT INTO content_blocks (page_key, title, body) VALUES
('home', 'clients',
  '[{"name": "Radisson Blu Hotel"}, {"name": "Johnvents Group"}, {"name": "Dangote Industries"}, {"name": "MTN Nigeria"}, {"name": "Access Bank"}]')
ON CONFLICT (page_key, title) DO NOTHING;

INSERT INTO content_blocks (page_key, title, body) VALUES
('about', 'leadership',
  '[{"name": "Chinwe Okafor", "role": "Managing Director"}, {"name": "Tunde Balogun", "role": "Head of Operations"}, {"name": "Amara Obi", "role": "Finance Director"}, {"name": "Femi Adeleke", "role": "Sales & Marketing Lead"}]')
ON CONFLICT (page_key, title) DO NOTHING;

INSERT INTO content_blocks (page_key, title, body) VALUES
('corporate', 'clients',
  '[{"name": "Radisson Blu Hotel", "desc": "Fleet partner since 2021"}, {"name": "Johnvents Group", "desc": "Corporate account"}, {"name": "Dangote Industries", "desc": "Executive fleet provider"}]')
ON CONFLICT (page_key, title) DO NOTHING;

-- 5. Seed a sample testimonial so the "What Our Customers Say" section appears
INSERT INTO testimonials (name, company, rating, quote, is_published) VALUES
('Chioma Eze', 'Lagos Business School', 5,
  'Empathon Autos made my first car purchase seamless. From selection to delivery, every step was transparent and professional.',
  true)
ON CONFLICT DO NOTHING;
