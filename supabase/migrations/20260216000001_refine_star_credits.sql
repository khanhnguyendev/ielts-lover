-- Refine StarCredits Economy Defaults

-- 1. Update feature pricing to 1 credit per AI request
UPDATE ielts_lover_v1.feature_pricing
SET
    cost_per_unit = 1
WHERE
    feature_key IN (
        'writing_evaluation',
        'speaking_evaluation',
        'text_rewriter',
        'ai_tutor_chat'
    );

-- 2. Update default balance for new users (if needed, although usually handled by code/migration 1)
ALTER TABLE ielts_lover_v1.user_profiles
ALTER COLUMN credits_balance
SET DEFAULT 10;
-- Give 10 credits by default instead of 50

-- 3. Reset existing users to a sane default if they had high balances from previous test
-- UPDATE ielts_lover_v1.user_profiles
-- SET credits_balance = 10
-- WHERE credits_balance > 50;