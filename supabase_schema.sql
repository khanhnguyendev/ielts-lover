-- User Profiles
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    target_score DECIMAL DEFAULT 7.0,
    test_type TEXT CHECK (
        test_type IN ('academic', 'general')
    ) DEFAULT 'academic',
    exam_date DATE,
    is_premium BOOLEAN DEFAULT FALSE,
    daily_quota_used INTEGER DEFAULT 0,
    last_quota_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises
CREATE TABLE exercises (
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
CREATE TABLE attempts (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES user_profiles (id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises (id) ON DELETE CASCADE,
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

-- Lessons (New)
CREATE TABLE lessons (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Example for user_profiles)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE
    USING (auth.uid () = id);