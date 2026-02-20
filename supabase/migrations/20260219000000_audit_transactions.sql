-- Add audit columns to credit_transactions
ALTER TABLE ielts_lover_v1.credit_transactions
ADD COLUMN IF NOT EXISTS feature_key TEXT,
ADD COLUMN IF NOT EXISTS exercise_id UUID REFERENCES ielts_lover_v1.exercises (id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS granted_by_admin TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON ielts_lover_v1.credit_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_feature_key ON ielts_lover_v1.credit_transactions (feature_key);