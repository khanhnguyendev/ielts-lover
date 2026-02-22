-- =============================================================
-- Add Trace ID for Activity Correlation
-- =============================================================

-- 1. Update credit_transactions
ALTER TABLE ielts_lover_v1.credit_transactions
ADD COLUMN IF NOT EXISTS trace_id TEXT;

-- 2. Update ai_usage_logs
ALTER TABLE ielts_lover_v1.ai_usage_logs
ADD COLUMN IF NOT EXISTS trace_id TEXT;

-- 3. Optimization: Indexes for trace lookup
CREATE INDEX IF NOT EXISTS idx_credit_transactions_trace_id ON ielts_lover_v1.credit_transactions (trace_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_trace_id ON ielts_lover_v1.ai_usage_logs (trace_id);