-- Enable REPLICA IDENTITY FULL so Supabase Realtime can evaluate
-- RLS policies and row-level filters on INSERT/UPDATE/DELETE events.
ALTER TABLE ielts_lover_v1.notifications REPLICA IDENTITY FULL;
