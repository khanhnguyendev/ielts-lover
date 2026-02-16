export type UserProfile = {
    id: string;
    email: string;
    target_score: number;
    test_type: "academic" | "general";
    exam_date?: string;
    is_premium: boolean;
    role: "user" | "admin";
    daily_quota_used: number;
    last_quota_reset: string;
    created_at: string;
    avatar_url?: string;
    full_name?: string;
};

export type ExerciseType = "writing_task1" | "writing_task2" | "speaking_part1" | "speaking_part2" | "speaking_part3";

export type Exercise = {
    id: string;
    type: ExerciseType;
    title: string;
    prompt: string;
    image_url?: string;
    version: number;
    is_published: boolean;
    created_at: string;
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
    exercises?: {
        title: string;
        type: string;
    };
};
export * from "./lesson";
