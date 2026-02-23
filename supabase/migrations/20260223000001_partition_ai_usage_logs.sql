-- =============================================================
-- Partition ai_usage_logs by month on created_at
-- Improves query performance for time-range analytics and
-- enables efficient archival of old partitions.
-- =============================================================

-- 1. Rename the existing table
ALTER TABLE ielts_lover_v1.ai_usage_logs RENAME TO ai_usage_logs_old;

-- 2. Drop old indexes (they reference the old table)
DROP INDEX IF EXISTS ielts_lover_v1.idx_ai_usage_logs_created_at;
DROP INDEX IF EXISTS ielts_lover_v1.idx_ai_usage_logs_feature_key;
DROP INDEX IF EXISTS ielts_lover_v1.idx_ai_usage_logs_user_id;
DROP INDEX IF EXISTS ielts_lover_v1.idx_ai_usage_logs_trace_id;

-- 3. Create the partitioned table (partition key must be in PK)
CREATE TABLE ielts_lover_v1.ai_usage_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    feature_key TEXT NOT NULL,
    model_name TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    input_cost_usd NUMERIC(10, 8) NOT NULL DEFAULT 0,
    output_cost_usd NUMERIC(10, 8) NOT NULL DEFAULT 0,
    total_cost_usd NUMERIC(10, 8) NOT NULL DEFAULT 0,
    credits_charged INTEGER NOT NULL DEFAULT 0,
    ai_method TEXT NOT NULL,
    trace_id TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 4. Create partitions: past months, current, and future
CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_01
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_02
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_03
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_04
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_05
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_06
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_07
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_08
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_09
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_10
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_11
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE ielts_lover_v1.ai_usage_logs_2026_12
    PARTITION OF ielts_lover_v1.ai_usage_logs
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Default partition for any data outside defined ranges
CREATE TABLE ielts_lover_v1.ai_usage_logs_default
    PARTITION OF ielts_lover_v1.ai_usage_logs DEFAULT;

-- 5. Recreate indexes on the partitioned table (auto-propagate to partitions)
CREATE INDEX idx_ai_usage_logs_created_at ON ielts_lover_v1.ai_usage_logs (created_at);
CREATE INDEX idx_ai_usage_logs_feature_key ON ielts_lover_v1.ai_usage_logs (feature_key);
CREATE INDEX idx_ai_usage_logs_user_id ON ielts_lover_v1.ai_usage_logs (user_id);
CREATE INDEX idx_ai_usage_logs_trace_id ON ielts_lover_v1.ai_usage_logs (trace_id) WHERE trace_id IS NOT NULL;

-- 6. Copy existing data from old table to partitioned table
INSERT INTO ielts_lover_v1.ai_usage_logs (
    id, user_id, feature_key, model_name,
    prompt_tokens, completion_tokens, total_tokens,
    input_cost_usd, output_cost_usd, total_cost_usd,
    credits_charged, ai_method, trace_id, duration_ms, created_at
)
SELECT
    id, user_id, feature_key, model_name,
    prompt_tokens, completion_tokens, total_tokens,
    input_cost_usd, output_cost_usd, total_cost_usd,
    credits_charged, ai_method, trace_id, duration_ms, created_at
FROM ielts_lover_v1.ai_usage_logs_old;

-- 7. Re-enable RLS on the partitioned table
ALTER TABLE ielts_lover_v1.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI usage logs insert via service role"
    ON ielts_lover_v1.ai_usage_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "AI usage logs readable by owner"
    ON ielts_lover_v1.ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 8. Recreate the daily summary view (references the partitioned table)
CREATE OR REPLACE VIEW ielts_lover_v1.ai_cost_summary_daily AS
SELECT
    date_trunc('day', created_at) AS day,
    feature_key,
    model_name,
    COUNT(*) AS call_count,
    SUM(prompt_tokens) AS total_prompt_tokens,
    SUM(completion_tokens) AS total_completion_tokens,
    SUM(total_tokens) AS total_tokens,
    SUM(total_cost_usd) AS total_cost_usd,
    SUM(credits_charged) AS total_credits_charged,
    AVG(duration_ms)::INTEGER AS avg_duration_ms
FROM ielts_lover_v1.ai_usage_logs
GROUP BY date_trunc('day', created_at), feature_key, model_name;

-- 9. Drop the old table
DROP TABLE ielts_lover_v1.ai_usage_logs_old;

-- =============================================================
-- To add future year partitions, run:
--
-- CREATE TABLE ielts_lover_v1.ai_usage_logs_2027_01
--     PARTITION OF ielts_lover_v1.ai_usage_logs
--     FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
--
-- To archive old partitions:
--
-- ALTER TABLE ielts_lover_v1.ai_usage_logs
--     DETACH PARTITION ielts_lover_v1.ai_usage_logs_2026_01;
-- =============================================================
