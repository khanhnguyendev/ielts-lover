-- Admin Console Visibility & Security Policies

-- 1. Create a function to check if a user is an admin without causing recursion
CREATE OR REPLACE FUNCTION ielts_lover_v1.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ielts_lover_v1.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update user_profiles SELECT policy to allow admins to see everyone
DROP POLICY IF EXISTS "Users can view their own profile" ON ielts_lover_v1.user_profiles;

CREATE POLICY "Profiles are viewable by owners and admins" ON ielts_lover_v1.user_profiles FOR
SELECT USING (
        auth.uid () = id
        OR ielts_lover_v1.is_admin ()
    );

-- 3. Update user_profiles UPDATE policy to allow admins to update everyone
DROP POLICY IF EXISTS "Users can update their own profile" ON ielts_lover_v1.user_profiles;

CREATE POLICY "Profiles are updatable by owners and admins" ON ielts_lover_v1.user_profiles
FOR UPDATE
    USING (
        auth.uid () = id
        OR ielts_lover_v1.is_admin ()
    );