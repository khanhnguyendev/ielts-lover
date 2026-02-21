-- Add activity tracking to user profiles
ALTER TABLE ielts_lover_v1.user_profiles
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records
UPDATE ielts_lover_v1.user_profiles
SET
    last_seen_at = created_at
WHERE
    last_seen_at IS NULL;