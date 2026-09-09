-- ═══════════════════════════════════════════════════════════════
-- Create Admin User + Set Super Admin Role
-- Run this in your Supabase SQL Editor (one click)
-- ═══════════════════════════════════════════════════════════════

-- 1. Create the user via Supabase Auth
-- This automatically creates a corresponding row in the profiles table
-- via the on_auth_user_created trigger (defined in the migration)
SELECT auth.sign_up(
  jsonb_build_object(
    'email', 'admin@emphatonautos.com',
    'password', 'empathonautos@123.com',
    'email_confirm', true
  )
);

-- 2. Wait briefly for the trigger to create the profile
SELECT pg_sleep(0.5);

-- 3. Set the user's role to super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@emphatonautos.com'
  LIMIT 1
);

-- 4. Verify it worked
SELECT email, role FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@emphatonautos.com';
