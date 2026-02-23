-- Add attempt_id to credit_transactions for direct linking from transaction details
ALTER TABLE ielts_lover_v1.credit_transactions
ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES ielts_lover_v1.attempts (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_credit_transactions_attempt_id
    ON ielts_lover_v1.credit_transactions (attempt_id)
    WHERE attempt_id IS NOT NULL;
