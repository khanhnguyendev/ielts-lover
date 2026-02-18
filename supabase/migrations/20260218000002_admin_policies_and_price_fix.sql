-- Add UPDATE policies for admin-managed tables
-- Feature Pricing
CREATE POLICY "Admins can update pricing" ON ielts_lover_v1.feature_pricing
FOR UPDATE
    USING (
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

-- System Settings
CREATE POLICY "Admins can update settings" ON ielts_lover_v1.system_settings
FOR UPDATE
    USING (
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

-- Fix current prices to match intended defaults if they were reset
UPDATE ielts_lover_v1.feature_pricing
SET
    cost_per_unit = 10
WHERE
    feature_key = 'writing_evaluation';

UPDATE ielts_lover_v1.feature_pricing
SET
    cost_per_unit = 10
WHERE
    feature_key = 'speaking_evaluation';

UPDATE ielts_lover_v1.feature_pricing
SET
    cost_per_unit = 5
WHERE
    feature_key = 'text_rewriter';

UPDATE ielts_lover_v1.feature_pricing
SET
    cost_per_unit = 2
WHERE
    feature_key = 'ai_tutor_chat';

UPDATE ielts_lover_v1.feature_pricing
SET
    cost_per_unit = 15
WHERE
    feature_key = 'detailed_correction';