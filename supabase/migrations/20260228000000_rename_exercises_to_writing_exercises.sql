-- Rename exercises → writing_exercises
-- Preparation for module-specific tables (future: speaking_exercises)
-- Indexes and foreign keys auto-follow the table rename in PostgreSQL.

ALTER TABLE ielts_lover_v1.exercises RENAME TO writing_exercises;

-- RLS policies reference the old table name internally.
-- ALTER POLICY cannot rename, so we DROP + CREATE each one.

DROP POLICY IF EXISTS "Exercises are publicly readable" ON ielts_lover_v1.writing_exercises;
CREATE POLICY "Writing exercises are publicly readable" ON ielts_lover_v1.writing_exercises FOR
SELECT USING (
        is_published = true
        OR ielts_lover_v1.is_admin ()
    );

DROP POLICY IF EXISTS "Only admins can insert exercises" ON ielts_lover_v1.writing_exercises;
CREATE POLICY "Only admins can insert writing exercises" ON ielts_lover_v1.writing_exercises FOR INSERT
WITH
    CHECK (ielts_lover_v1.is_admin ());

DROP POLICY IF EXISTS "Only admins can update exercises" ON ielts_lover_v1.writing_exercises;
CREATE POLICY "Only admins can update writing exercises" ON ielts_lover_v1.writing_exercises
FOR UPDATE
    USING (ielts_lover_v1.is_admin ());

DROP POLICY IF EXISTS "Only admins can delete exercises" ON ielts_lover_v1.writing_exercises;
CREATE POLICY "Only admins can delete writing exercises" ON ielts_lover_v1.writing_exercises FOR DELETE USING (ielts_lover_v1.is_admin ());

DROP POLICY IF EXISTS "Authenticated users can insert own exercises" ON ielts_lover_v1.writing_exercises;
CREATE POLICY "Authenticated users can insert own writing exercises" ON ielts_lover_v1.writing_exercises FOR INSERT
WITH
    CHECK (auth.uid () = created_by);
