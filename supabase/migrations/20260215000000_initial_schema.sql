-- Create Schema
CREATE SCHEMA IF NOT EXISTS ielts_lover_v1;

-- User Profiles
CREATE TABLE ielts_lover_v1.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    target_score DECIMAL DEFAULT 7.0,
    test_type TEXT CHECK (
        test_type IN ('academic', 'general')
    ) DEFAULT 'academic',
    exam_date DATE,
    is_premium BOOLEAN DEFAULT FALSE,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    daily_quota_used INTEGER DEFAULT 0,
    last_quota_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises
CREATE TABLE ielts_lover_v1.exercises (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT,
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attempts
CREATE TABLE ielts_lover_v1.attempts (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES ielts_lover_v1.user_profiles (id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES ielts_lover_v1.exercises (id) ON DELETE CASCADE,
    state TEXT CHECK (
        state IN (
            'CREATED',
            'IN_PROGRESS',
            'SUBMITTED',
            'EVALUATED'
        )
    ) DEFAULT 'CREATED',
    content TEXT,
    score DECIMAL,
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    evaluated_at TIMESTAMP WITH TIME ZONE
);

-- Lessons
CREATE TABLE ielts_lover_v1.lessons (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ielts_lover_v1.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON ielts_lover_v1.user_profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update their own profile" ON ielts_lover_v1.user_profiles
FOR UPDATE
    USING (auth.uid () = id);