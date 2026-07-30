-- Fix profiles RLS: add policies for authenticated users to read their own profile
-- This is needed for the AdminGuard to work correctly

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to read all profiles (for admin panel)
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Verify the policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
