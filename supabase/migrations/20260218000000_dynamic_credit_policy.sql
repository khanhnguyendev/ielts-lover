-- Create system_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS ielts_lover_v1.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ielts_lover_v1.system_settings ENABLE ROW LEVEL SECURITY;

-- Select policy (readable by admins)
CREATE POLICY "Admins can manage system settings" ON ielts_lover_v1.system_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM ielts_lover_v1.user_profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- Readable by authenticated users (for policy logic)
CREATE POLICY "Settings are readable by all authenticated users" ON ielts_lover_v1.system_settings FOR
SELECT USING (
        auth.role () = 'authenticated'
    );

-- Seed current CreditPolicy values
INSERT INTO
    ielts_lover_v1.system_settings (
        setting_key,
        setting_value,
        description
    )
VALUES (
        'DAILY_GRANT_FREE',
        '5',
        'Standard daily StarCredits replenishment (every 24h)'
    ),
    (
        'INVITE_FRIEND_BONUS',
        '10',
        'Credits given to both parties when a referral is successful'
    ),
    (
        'EVENT_BONUS_DEFAULT',
        '5',
        'Default credits for special events'
    ),
    (
        'GIFT_CODE_DEFAULT',
        '20',
        'Default value for gift codes'
    ),
    (
        'SYSTEM_GRANT_WELCOME',
        '10',
        'Welcome bonus credits for new users'
    ),
    (
        'MAX_CARRY_OVER',
        '100',
        'Maximum credits a user can accumulate via daily grants'
    )
ON CONFLICT (setting_key) DO NOTHING;