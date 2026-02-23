-- Add example essay fields to attempts
ALTER TABLE ielts_lover_v1.attempts
ADD COLUMN IF NOT EXISTS example_essay_data JSONB,
ADD COLUMN IF NOT EXISTS is_example_essay_unlocked BOOLEAN DEFAULT false;

-- Seed feature pricing for example essay generation
INSERT INTO ielts_lover_v1.feature_pricing (feature_key, cost_per_unit, is_active)
VALUES ('example_essay', 2, true)
ON CONFLICT (feature_key) DO NOTHING;
