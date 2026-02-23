-- Add missing indexes on attempts table for query performance
-- These columns are used in dashboard queries, user attempt lookups, and state filtering

CREATE INDEX IF NOT EXISTS idx_attempts_user_id
    ON ielts_lover_v1.attempts (user_id);

CREATE INDEX IF NOT EXISTS idx_attempts_exercise_id
    ON ielts_lover_v1.attempts (exercise_id);

CREATE INDEX IF NOT EXISTS idx_attempts_state
    ON ielts_lover_v1.attempts (state);

CREATE INDEX IF NOT EXISTS idx_attempts_user_state
    ON ielts_lover_v1.attempts (user_id, state);
