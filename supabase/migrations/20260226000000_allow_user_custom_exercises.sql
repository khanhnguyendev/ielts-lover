-- Allow authenticated users to create their own exercises
-- (custom tasks created from the writing hub, not just admins)
-- The RLS check ensures the user can only insert rows where they are the creator.

CREATE POLICY "Authenticated users can insert own exercises" ON ielts_lover_v1.exercises FOR INSERT
WITH
    CHECK (auth.uid () = created_by);