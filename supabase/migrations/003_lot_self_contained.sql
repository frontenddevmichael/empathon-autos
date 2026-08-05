-- Lot self-contained listing upgrade.
-- Makes lots standalone listings: vehicle_id becomes optional, lots carry their
-- own spec snapshot, condition grade, winner info, plus new lot_media and
-- lot_faults tables (unlimited images with a primary, color-coded faults).

-- 1. LOTS — optional vehicle link + spec snapshot + grade + winner
ALTER TABLE lots
  ALTER COLUMN vehicle_id DROP NOT NULL;

ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS make TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS trim TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transmission TEXT DEFAULT 'automatic'
    CHECK (transmission IN ('automatic','manual','semi-automatic')),
  ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'petrol'
    CHECK (fuel_type IN ('petrol','diesel','electric','hybrid','plug-in-hybrid')),
  ADD COLUMN IF NOT EXISTS colour TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS body_type TEXT DEFAULT 'sedan'
    CHECK (body_type IN ('sedan','suv','hatchback','coupe','convertible','pickup','wagon','van','truck')),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS condition_grade TEXT CHECK (condition_grade IN ('A','B','C','D')),
  ADD COLUMN IF NOT EXISTS bid_increment NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS winner_name TEXT,
  ADD COLUMN IF NOT EXISTS winner_email TEXT,
  ADD COLUMN IF NOT EXISTS winner_phone TEXT,
  ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

-- A vehicle can back at most one lot.
CREATE UNIQUE INDEX IF NOT EXISTS lots_unique_vehicle ON lots(vehicle_id) WHERE vehicle_id IS NOT NULL;

-- 2. LOT MEDIA — unlimited images, one primary
CREATE TABLE IF NOT EXISTS lot_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image','video')),
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  alt_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lot_media_lot ON lot_media(lot_id);

-- 3. LOT FAULTS — color-coded condition report items with optional proof image
CREATE TABLE IF NOT EXISTS lot_faults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor','warning','critical')),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lot_faults_lot ON lot_faults(lot_id);

-- 4. ROW LEVEL SECURITY (mirrors vehicle_media / lots patterns)

ALTER TABLE lot_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view lot media" ON lot_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage lot media" ON lot_media FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff')))
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff')));

ALTER TABLE lot_faults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view lot faults" ON lot_faults FOR SELECT USING (true);
CREATE POLICY "Admins can manage lot faults" ON lot_faults FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff')))
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','staff')));
