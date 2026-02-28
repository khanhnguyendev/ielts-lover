-- Rename attempts → writing_attempts
-- Continuation of the module-specific table split (exercises → writing_exercises was step 1).
-- No column changes — table rename, FK fix, index renames, and RLS policy recreation only.

-- 1. Rename the table
ALTER TABLE ielts_lover_v1.attempts RENAME TO writing_attempts;

-- 2. Fix foreign key to reference writing_exercises (was pointing at old "exercises" table name,
--    which PostgreSQL auto-followed, but the constraint name is stale)
ALTER TABLE ielts_lover_v1.writing_attempts
    DROP CONSTRAINT attempts_exercise_id_fkey;

ALTER TABLE ielts_lover_v1.writing_attempts
    ADD CONSTRAINT writing_attempts_exercise_id_fkey
    FOREIGN KEY (exercise_id)
    REFERENCES ielts_lover_v1.writing_exercises(id)
    ON DELETE CASCADE;

-- 3. Rename indexes for consistency (schema-qualified — indexes live in ielts_lover_v1)
ALTER INDEX ielts_lover_v1.idx_attempts_user_id     RENAME TO idx_writing_attempts_user_id;
ALTER INDEX ielts_lover_v1.idx_attempts_exercise_id RENAME TO idx_writing_attempts_exercise_id;
ALTER INDEX ielts_lover_v1.idx_attempts_state       RENAME TO idx_writing_attempts_state;
ALTER INDEX ielts_lover_v1.idx_attempts_user_state  RENAME TO idx_writing_attempts_user_state;

-- 4. Recreate RLS policies with updated names
--    (ALTER POLICY cannot rename, so DROP + CREATE each one)

DROP POLICY IF EXISTS "Attempts visible to owner, teachers, and admins" ON ielts_lover_v1.writing_attempts;
CREATE POLICY "Writing attempts visible to owner, teachers, and admins" ON ielts_lover_v1.writing_attempts FOR
SELECT USING (
        auth.uid () = user_id
        OR ielts_lover_v1.is_admin ()
        OR (
            ielts_lover_v1.is_teacher ()
            AND EXISTS (
                SELECT 1
                FROM ielts_lover_v1.teacher_students
                WHERE
                    teacher_id = auth.uid ()
                    AND student_id = writing_attempts.user_id
            )
        )
    );

DROP POLICY IF EXISTS "Service can insert attempts" ON ielts_lover_v1.writing_attempts;
CREATE POLICY "Service can insert writing attempts" ON ielts_lover_v1.writing_attempts FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own attempts" ON ielts_lover_v1.writing_attempts;
CREATE POLICY "Users can update own writing attempts" ON ielts_lover_v1.writing_attempts
FOR UPDATE
    USING (auth.uid () = user_id);
