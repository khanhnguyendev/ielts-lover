-- Mistake Bank: user_mistakes + user_action_plans
-- Tracks individual errors from Writing/Speaking evaluations
-- and stores AI-generated improvement plans.

-- 1. User Mistakes table
CREATE TABLE IF NOT EXISTS ielts_lover_v1.user_mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    source_attempt_id UUID REFERENCES ielts_lover_v1.attempts (id) ON DELETE SET NULL,
    skill_type TEXT NOT NULL CHECK (
        skill_type IN ('writing', 'speaking')
    ),
    error_category TEXT NOT NULL CHECK (
        error_category IN (
            'grammar',
            'vocabulary',
            'coherence',
            'pronunciation'
        )
    ),
    original_context TEXT NOT NULL,
    correction TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Action Plans table
CREATE TABLE IF NOT EXISTS ielts_lover_v1.user_action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    mistakes_analyzed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX idx_user_mistakes_user_id ON ielts_lover_v1.user_mistakes (user_id);

CREATE INDEX idx_user_mistakes_skill_type ON ielts_lover_v1.user_mistakes (user_id, skill_type);

CREATE INDEX idx_user_action_plans_user_id ON ielts_lover_v1.user_action_plans (user_id);

-- 4. RLS
ALTER TABLE ielts_lover_v1.user_mistakes ENABLE ROW LEVEL SECURITY;

ALTER TABLE ielts_lover_v1.user_action_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own mistakes
CREATE POLICY "Users can view own mistakes" ON ielts_lover_v1.user_mistakes FOR
SELECT USING (auth.uid () = user_id);

-- Service role inserts mistakes (server-side only)
CREATE POLICY "Service can insert mistakes" ON ielts_lover_v1.user_mistakes FOR INSERT
WITH
    CHECK (true);

-- Users can read their own action plans
CREATE POLICY "Users can view own action plans" ON ielts_lover_v1.user_action_plans FOR
SELECT USING (auth.uid () = user_id);

-- Service role inserts action plans
CREATE POLICY "Service can insert action plans" ON ielts_lover_v1.user_action_plans FOR INSERT
WITH
    CHECK (true);

-- 5. Register weakness_analysis in feature_pricing
INSERT INTO
    ielts_lover_v1.feature_pricing (
        feature_key,
        cost_per_unit,
        is_active
    )
VALUES ('weakness_analysis', 30, true)
ON CONFLICT (feature_key) DO NOTHING;