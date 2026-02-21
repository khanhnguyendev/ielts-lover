-- Block role self-escalation on user_profiles
-- Users can update their own profile, but cannot change their own role.
-- Only admins can change roles.

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
        OR role = (
            SELECT role
            FROM ielts_lover_v1.user_profiles
            WHERE
                id = auth.uid ()
        )
    );