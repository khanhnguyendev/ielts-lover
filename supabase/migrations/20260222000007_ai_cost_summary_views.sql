-- =============================================================
-- AI Cost Summary Views (7-day and 30-day rolling windows)
-- Pre-aggregated views for admin dashboard KPI cards
-- =============================================================

CREATE OR REPLACE VIEW ielts_lover_v1.ai_cost_summary_7_days AS
SELECT
    COUNT(*) AS total_calls,
    COALESCE(SUM(prompt_tokens), 0) AS total_prompt_tokens,
    COALESCE(SUM(completion_tokens), 0) AS total_completion_tokens,
    COALESCE(SUM(total_tokens), 0) AS total_tokens,
    COALESCE(SUM(total_cost_usd), 0) AS total_cost_usd,
    COALESCE(SUM(credits_charged), 0) AS total_credits_charged,
    COALESCE(AVG(duration_ms)::INTEGER, 0) AS avg_duration_ms
FROM ielts_lover_v1.ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '7 days';

CREATE OR REPLACE VIEW ielts_lover_v1.ai_cost_summary_30_days AS
SELECT
    COUNT(*) AS total_calls,
    COALESCE(SUM(prompt_tokens), 0) AS total_prompt_tokens,
    COALESCE(SUM(completion_tokens), 0) AS total_completion_tokens,
    COALESCE(SUM(total_tokens), 0) AS total_tokens,
    COALESCE(SUM(total_cost_usd), 0) AS total_cost_usd,
    COALESCE(SUM(credits_charged), 0) AS total_credits_charged,
    COALESCE(AVG(duration_ms)::INTEGER, 0) AS avg_duration_ms
FROM ielts_lover_v1.ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days';
