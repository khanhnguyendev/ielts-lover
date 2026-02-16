-- Migrate to StarCredits Economy

-- 1. Update user_profiles table with credit fields
ALTER TABLE ielts_lover_v1.user_profiles
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS last_daily_grant_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create feature_pricing table for dynamic cost management
CREATE TABLE IF NOT EXISTS ielts_lover_v1.feature_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    feature_key TEXT UNIQUE NOT NULL,
    cost_per_unit INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create credit_transactions table for auditing
CREATE TABLE IF NOT EXISTS ielts_lover_v1.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES ielts_lover_v1.user_profiles (id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for grants/rewards, negative for usage
    type TEXT NOT NULL, -- 'daily_grant', 'usage', 'reward', 'gift_code'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on new tables
ALTER TABLE ielts_lover_v1.feature_pricing ENABLE ROW LEVEL SECURITY;

ALTER TABLE ielts_lover_v1.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Pricing is readable by all authenticated users
CREATE POLICY "Pricing is readable by all" ON ielts_lover_v1.feature_pricing FOR
SELECT USING (
        auth.role () = 'authenticated'
    );

-- Transactions are readable only by the owner
CREATE POLICY "Users can view their own transactions" ON ielts_lover_v1.credit_transactions FOR
SELECT USING (auth.uid () = user_id);

-- 6. Initial Pricing Data
INSERT INTO
    ielts_lover_v1.feature_pricing (feature_key, cost_per_unit)
VALUES ('writing_evaluation', 10),
    ('speaking_evaluation', 10),
    ('text_rewriter', 5),
    ('ai_tutor_chat', 2)
ON CONFLICT (feature_key) DO
UPDATE
SET
    cost_per_unit = EXCLUDED.cost_per_unit;

-- 7. Atomic Credit Functions
CREATE OR REPLACE FUNCTION ielts_lover_v1.deduct_credits(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE ielts_lover_v1.user_profiles
    SET credits_balance = credits_balance - amount
    WHERE id = user_id AND credits_balance >= amount;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient credits balance or user not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION ielts_lover_v1.add_credits(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE ielts_lover_v1.user_profiles
    SET credits_balance = credits_balance + amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;