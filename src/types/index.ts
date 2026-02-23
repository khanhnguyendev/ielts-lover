export type UserProfile = {
    id: string;
    email: string;
    target_score: number;
    test_type: "academic" | "general";
    exam_date?: string;
    role: "user" | "admin" | "teacher";
    credits_balance: number;
    last_daily_grant_at: string;
    created_at: string;
    avatar_url?: string;
    full_name?: string;
    last_seen_at: string;
};

export type ExerciseType = "writing_task1" | "writing_task2" | "speaking_part1" | "speaking_part2" | "speaking_part3";

export type Exercise = {
    id: string;
    type: ExerciseType;
    title: string;
    prompt: string;
    image_url?: string;
    chart_data?: any;
    version: number;
    is_published: boolean;
    created_at: string;
    created_by?: string;
    creator?: { full_name?: string; email: string; role: string };
};

export type AttemptState = "CREATED" | "IN_PROGRESS" | "SUBMITTED" | "EVALUATED";

export type Attempt = {
    id: string;
    user_id: string;
    exercise_id: string;
    state: AttemptState;
    content: string; // text for writing, audio_url for speaking
    score?: number;
    feedback?: string; // JSON string for structured feedback
    created_at: string;
    submitted_at?: string;
    evaluated_at?: string;
    correction_data?: any;
    is_correction_unlocked?: boolean;
    example_essay_data?: any;
    is_example_essay_unlocked?: boolean;
    exercises?: {
        title: string;
        type: string;
    };
};
export type CreditPackage = {
    id: string;
    name: string;
    credits: number;
    bonus_credits: number;
    price: number;
    tagline: string;
    type: "starter" | "pro" | "master";
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
};

export type TeacherStudent = {
    id: string;
    teacher_id: string;
    student_id: string;
    assigned_by?: string;
    created_at: string;
};

export type CreditRequest = {
    id: string;
    teacher_id: string;
    student_id: string;
    amount: number;
    reason: string;
    status: "pending" | "approved" | "rejected";
    reviewed_by?: string;
    reviewed_at?: string;
    admin_note?: string;
    created_at: string;
    student?: { email: string; full_name?: string };
    teacher?: { email: string; full_name?: string };
};

export * from "./lesson";
export * from "./writing";
