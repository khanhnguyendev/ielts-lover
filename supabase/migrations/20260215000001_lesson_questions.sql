-- Create Lesson Questions Table
CREATE TABLE IF NOT EXISTS ielts_lover_v1.lesson_questions (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    lesson_id UUID REFERENCES ielts_lover_v1.lessons (id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Stored as JSON array of strings ["Option A", "Option B"]
    correct_answer_index INTEGER NOT NULL,
    feedback_correct TEXT,
    feedback_incorrect TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ielts_lover_v1.lesson_questions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read lesson questions (public content)
CREATE POLICY "Public read access for lesson_questions" ON ielts_lover_v1.lesson_questions FOR
SELECT USING (true);

-- Only service role/admins can insert/update/delete (handled by implicit default deny for others, but good to be explicit if we had admin users)