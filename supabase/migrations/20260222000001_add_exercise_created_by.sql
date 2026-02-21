-- Add created_by column to exercises table
ALTER TABLE ielts_lover_v1.exercises
ADD COLUMN created_by UUID REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE SET NULL;
