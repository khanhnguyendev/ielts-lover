-- Fix infinite recursion in user_profiles RLS policy
-- By extracting the role check into a SECURITY DEFINER function
-- which bypasses RLS and prevents the recursive policy evaluation.

CREATE OR REPLACE FUNCTION ielts_lover_v1.get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM ielts_lover_v1.user_profiles WHERE id = user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = ielts_lover_v1, public;

DROP POLICY IF EXISTS "Profiles are updatable by owners and admins" ON ielts_lover_v1.user_profiles;

CREATE POLICY "Profiles are updatable by owners and admins" ON ielts_lover_v1.user_profiles
FOR UPDATE
    USING (
        auth.uid () = id
        OR ielts_lover_v1.is_admin ()
    )
WITH
    CHECK (
        -- Admins can change anything
        ielts_lover_v1.is_admin ()
        -- Non-admins: role must remain unchanged
        OR role = ielts_lover_v1.get_user_role (auth.uid ())
    );