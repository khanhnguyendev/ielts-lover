-- Add RLS policies for admin management of credit packages
-- Allows INSERT, UPDATE, DELETE for users with the 'admin' role

CREATE POLICY "Admins can manage credit packages" ON ielts_lover_v1.credit_packages FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM ielts_lover_v1.user_profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM ielts_lover_v1.user_profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );