-- Add source_sentence column to user_mistakes
-- Stores the full clause/sentence that contains the mistake
ALTER TABLE ielts_lover_v1.user_mistakes
ADD COLUMN IF NOT EXISTS source_sentence TEXT;