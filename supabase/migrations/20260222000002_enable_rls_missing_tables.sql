-- Enable RLS on exercises, attempts, and lessons
-- These 3 tables were missing RLS since initial_schema.sql

-- ============================================================
-- 1. EXERCISES — public read, admin-only write
-- ============================================================
ALTER TABLE ielts_lover_v1.exercises ENABLE ROW LEVEL SECURITY;

-- Anyone can read published exercises
CREATE POLICY "Exercises are publicly readable" ON ielts_lover_v1.exercises FOR
SELECT USING (
        is_published = true
        OR ielts_lover_v1.is_admin ()
    );

-- Only admins (or service role) can insert/update/delete exercises
CREATE POLICY "Only admins can insert exercises" ON ielts_lover_v1.exercises FOR INSERT
WITH
    CHECK (ielts_lover_v1.is_admin ());

CREATE POLICY "Only admins can update exercises" ON ielts_lover_v1.exercises
FOR UPDATE
    USING (ielts_lover_v1.is_admin ());

CREATE POLICY "Only admins can delete exercises" ON ielts_lover_v1.exercises FOR DELETE USING (ielts_lover_v1.is_admin ());

-- ============================================================
-- 2. ATTEMPTS — owner read/insert, admin read-all
-- ============================================================
ALTER TABLE ielts_lover_v1.attempts ENABLE ROW LEVEL SECURITY;

-- Users can see their own attempts; admins and teachers (linked) can see all
CREATE POLICY "Attempts visible to owner, teachers, and admins" ON ielts_lover_v1.attempts FOR
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
                    AND student_id = attempts.user_id
            )
        )
    );

-- Service role inserts attempts (server action creates them)
CREATE POLICY "Service can insert attempts" ON ielts_lover_v1.attempts FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Users can update their own in-progress attempts (submit answer)
CREATE POLICY "Users can update own attempts" ON ielts_lover_v1.attempts
FOR UPDATE
    USING (auth.uid () = user_id);

-- ============================================================
-- 3. LESSONS — public read, admin-only write
-- ============================================================
ALTER TABLE ielts_lover_v1.lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can read lessons
CREATE POLICY "Lessons are publicly readable" ON ielts_lover_v1.lessons FOR
SELECT USING (true);

-- Only admins can manage lessons
CREATE POLICY "Only admins can insert lessons" ON ielts_lover_v1.lessons FOR INSERT
WITH
    CHECK (ielts_lover_v1.is_admin ());

CREATE POLICY "Only admins can update lessons" ON ielts_lover_v1.lessons
FOR UPDATE
    USING (ielts_lover_v1.is_admin ());

CREATE POLICY "Only admins can delete lessons" ON ielts_lover_v1.lessons FOR DELETE USING (ielts_lover_v1.is_admin ());