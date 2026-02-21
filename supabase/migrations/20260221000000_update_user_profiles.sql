-- Update user_profiles table to add metadata and remove legacy fields
ALTER TABLE ielts_lover_v1.user_profiles
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE ielts_lover_v1.user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Remove legacy quota/premium fields
ALTER TABLE ielts_lover_v1.user_profiles
DROP COLUMN IF EXISTS daily_quota_used;

ALTER TABLE ielts_lover_v1.user_profiles
DROP COLUMN IF EXISTS last_quota_reset;

ALTER TABLE ielts_lover_v1.user_profiles
DROP COLUMN IF EXISTS is_premium;