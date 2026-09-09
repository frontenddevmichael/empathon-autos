-- Fix recursive RLS policy on profiles table
-- The "Admins can read all profiles" policy causes infinite recursion
-- because the EXISTS subquery against profiles triggers RLS again.
-- Fix: use a security definer function to bypass RLS for the check.

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a security definer function to check admin role without RLS recursion
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

-- Re-create the policy using the security definer function
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT
  USING (public.is_admin());

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
