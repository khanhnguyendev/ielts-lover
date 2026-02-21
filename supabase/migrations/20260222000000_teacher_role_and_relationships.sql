-- Teacher Role, Teacher-Student Relationships, and Credit Requests
-- Adds 'teacher' role, many-to-many teacher-student links, and credit request workflow.

-- 1. Expand role constraint to include 'teacher'
ALTER TABLE ielts_lover_v1.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE ielts_lover_v1.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('user', 'admin', 'teacher'));

-- 2. Helper function: check if current user is a teacher
CREATE OR REPLACE FUNCTION ielts_lover_v1.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ielts_lover_v1.user_profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Teacher-Student relationship table (many-to-many)
CREATE TABLE ielts_lover_v1.teacher_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES ielts_lover_v1.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, student_id)
);

CREATE INDEX idx_teacher_students_teacher ON ielts_lover_v1.teacher_students(teacher_id);
CREATE INDEX idx_teacher_students_student ON ielts_lover_v1.teacher_students(student_id);

-- 4. Credit requests table
CREATE TABLE ielts_lover_v1.credit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES ielts_lover_v1.user_profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_requests_teacher ON ielts_lover_v1.credit_requests(teacher_id);
CREATE INDEX idx_credit_requests_status ON ielts_lover_v1.credit_requests(status);

-- 5. RLS for teacher_students
ALTER TABLE ielts_lover_v1.teacher_students ENABLE ROW LEVEL SECURITY;

-- Teachers, their linked students, and admins can view links
CREATE POLICY "Teacher-student links visible to participants and admins"
ON ielts_lover_v1.teacher_students FOR SELECT
USING (
    auth.uid() = teacher_id
    OR auth.uid() = student_id
    OR ielts_lover_v1.is_admin()
);

-- Only admins can manage teacher-student links
CREATE POLICY "Only admins manage teacher-student links"
ON ielts_lover_v1.teacher_students FOR INSERT
WITH CHECK (ielts_lover_v1.is_admin());

CREATE POLICY "Only admins can delete teacher-student links"
ON ielts_lover_v1.teacher_students FOR DELETE
USING (ielts_lover_v1.is_admin());

-- 6. RLS for credit_requests
ALTER TABLE ielts_lover_v1.credit_requests ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own requests, admins can see all
CREATE POLICY "Credit requests visible to teacher and admins"
ON ielts_lover_v1.credit_requests FOR SELECT
USING (
    auth.uid() = teacher_id
    OR ielts_lover_v1.is_admin()
);

-- Teachers can create requests for their linked students
CREATE POLICY "Teachers can create credit requests"
ON ielts_lover_v1.credit_requests FOR INSERT
WITH CHECK (
    auth.uid() = teacher_id
    AND ielts_lover_v1.is_teacher()
);

-- Only admins can update (approve/reject)
CREATE POLICY "Only admins can review credit requests"
ON ielts_lover_v1.credit_requests FOR UPDATE
USING (ielts_lover_v1.is_admin());

-- 7. Update user_profiles SELECT policy: teachers can see their linked students
DROP POLICY IF EXISTS "Profiles are viewable by owners and admins" ON ielts_lover_v1.user_profiles;

CREATE POLICY "Profiles are viewable by owners, teachers, and admins"
ON ielts_lover_v1.user_profiles FOR SELECT
USING (
    auth.uid() = id
    OR ielts_lover_v1.is_admin()
    OR (ielts_lover_v1.is_teacher() AND EXISTS (
        SELECT 1 FROM ielts_lover_v1.teacher_students
        WHERE teacher_id = auth.uid() AND student_id = user_profiles.id
    ))
);
