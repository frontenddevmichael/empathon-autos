-- Fix recursive RLS on ALL admin tables
-- The EXISTS(SELECT 1 FROM profiles WHERE ...) pattern causes infinite recursion
-- because profiles has its own RLS that re-triggers the check.
-- Fix: SECURITY DEFINER functions bypass RLS.

-- 1. Helper: check if user is admin or staff (for write operations)
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'staff')
  );
END;
$$;

-- 2. Helper: check if user is admin only (for profile management)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  );
END;
$$;

-- 3. Helper: check if user is super_admin only
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- 4. Drop and recreate all policies using the helper functions

-- VEHICLES
DROP POLICY IF EXISTS "Public can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can manage vehicles" ON vehicles;
CREATE POLICY "Public can view vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles" ON vehicles FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- VEHICLE MEDIA
DROP POLICY IF EXISTS "Public can view media" ON vehicle_media;
DROP POLICY IF EXISTS "Admins can manage media" ON vehicle_media;
CREATE POLICY "Public can view media" ON vehicle_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON vehicle_media FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- TESTIMONIALS
DROP POLICY IF EXISTS "Public can view published testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT
  USING (is_published = true);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- CONTENT BLOCKS
DROP POLICY IF EXISTS "Public can view content" ON content_blocks;
DROP POLICY IF EXISTS "Admins can manage content" ON content_blocks;
CREATE POLICY "Public can view content" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON content_blocks FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- LOTS
DROP POLICY IF EXISTS "Public can view lots" ON lots;
DROP POLICY IF EXISTS "Admins can manage lots" ON lots;
CREATE POLICY "Public can view lots" ON lots FOR SELECT USING (true);
CREATE POLICY "Admins can manage lots" ON lots FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- BIDS
DROP POLICY IF EXISTS "Public can view bids" ON bids;
DROP POLICY IF EXISTS "Authenticated users can insert bids" ON bids;
DROP POLICY IF EXISTS "Admins can manage bids" ON bids;
CREATE POLICY "Public can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert bids" ON bids FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage bids" ON bids FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- LEADS
DROP POLICY IF EXISTS "Admins can read leads" ON leads;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;
DROP POLICY IF EXISTS "Admins can update leads" ON leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON leads;
CREATE POLICY "Admins can read leads" ON leads FOR SELECT
  USING (public.is_staff_or_admin());
CREATE POLICY "Public can insert leads" ON leads FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can update leads" ON leads FOR UPDATE
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());
CREATE POLICY "Admins can delete leads" ON leads FOR DELETE
  USING (public.is_staff_or_admin());

-- PRE_ORDERS
DROP POLICY IF EXISTS "Admins can manage pre_orders" ON pre_orders;
CREATE POLICY "Admins can manage pre_orders" ON pre_orders FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- BLOG POSTS
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Admins can manage blog posts" ON blog_posts FOR ALL
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- PROFILES
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage profiles" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT
  USING (public.is_admin());
CREATE POLICY "Super admins can manage profiles" ON profiles FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ADMIN ACTIVITY LOG
DROP POLICY IF EXISTS "Admins can view activity log" ON admin_activity_log;
DROP POLICY IF EXISTS "System can insert activity log" ON admin_activity_log;
CREATE POLICY "Admins can view activity log" ON admin_activity_log FOR SELECT
  USING (public.is_admin());
CREATE POLICY "System can insert activity log" ON admin_activity_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Verify
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
