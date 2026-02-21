-- =============================================================
-- AI Cost Accounting System
-- Track real USD cost behind every Gemini API call
-- =============================================================

-- 1. Model pricing reference table (admin-configurable)
CREATE TABLE IF NOT EXISTS ielts_lover_v1.ai_model_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL UNIQUE,
    input_price_per_million NUMERIC(10, 4) NOT NULL,
    output_price_per_million NUMERIC(10, 4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Per-call AI usage log
CREATE TABLE IF NOT EXISTS ielts_lover_v1.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE SET NULL,
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
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for analytics queries
CREATE INDEX idx_ai_usage_logs_created_at ON ielts_lover_v1.ai_usage_logs(created_at);
CREATE INDEX idx_ai_usage_logs_feature_key ON ielts_lover_v1.ai_usage_logs(feature_key);
CREATE INDEX idx_ai_usage_logs_user_id ON ielts_lover_v1.ai_usage_logs(user_id);

-- 4. RLS
ALTER TABLE ielts_lover_v1.ai_model_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_lover_v1.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Model pricing readable by authenticated"
    ON ielts_lover_v1.ai_model_pricing FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "AI usage logs insert via service role"
    ON ielts_lover_v1.ai_usage_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "AI usage logs readable by owner"
    ON ielts_lover_v1.ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 5. Seed initial model pricing (Gemini models as of 2025)
INSERT INTO ielts_lover_v1.ai_model_pricing (model_name, input_price_per_million, output_price_per_million)
VALUES
    ('gemini-1.5-flash', 0.0750, 0.3000),
    ('gemini-2.0-flash', 0.1000, 0.4000),
    ('gemini-1.5-pro', 1.2500, 5.0000),
    ('gemini-flash-lite-latest', 0.0750, 0.3000)
ON CONFLICT (model_name) DO NOTHING;

-- 6. Aggregation view for admin dashboard
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
