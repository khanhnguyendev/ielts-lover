-- Add correction_data and is_correction_unlocked to attempts table
ALTER TABLE ielts_lover_v1.attempts
ADD COLUMN IF NOT EXISTS correction_data JSONB,
ADD COLUMN IF NOT EXISTS is_correction_unlocked BOOLEAN DEFAULT false;

-- Add detailed_correction to feature_pricing
INSERT INTO
    ielts_lover_v1.feature_pricing (feature_key, cost_per_unit)
VALUES ('detailed_correction', 15)
ON CONFLICT (feature_key) DO
UPDATE
SET
    cost_per_unit = EXCLUDED.cost_per_unit;