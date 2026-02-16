-- Create Credit Packages Table
CREATE TABLE IF NOT EXISTS ielts_lover_v1.credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL,
    tagline TEXT,
    type TEXT NOT NULL, -- 'starter', 'pro', 'master'
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ielts_lover_v1.credit_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Packages are readable by all authenticated users
CREATE POLICY "Packages are readable by all" ON ielts_lover_v1.credit_packages FOR
SELECT USING (
        auth.role () = 'authenticated'
    );

-- Initial Data
INSERT INTO ielts_lover_v1.credit_packages (name, credits, bonus_credits, price, tagline, type, display_order)
VALUES 
    ('Band Booster', 100, 0, 5.00, 'Perfect for getting started.', 'starter', 1),
    ('Band Climber', 500, 50, 20.00, 'Best value for serious practice.', 'pro', 2),
    ('Band Mastery', 1500, 200, 50.00, 'Maximum power for heavy users.', 'master', 3)
ON CONFLICT DO NOTHING;