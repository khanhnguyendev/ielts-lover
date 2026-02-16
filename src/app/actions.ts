"use server";

import { ExerciseRepository } from "@/repositories/exercise.repository";
import { UserRepository } from "@/repositories/user.repository";
import { AttemptRepository } from "@/repositories/attempt.repository";
import { ExerciseService } from "@/services/exercise.service";
import { AttemptService } from "@/services/attempt.service";
import { AIService } from "@/services/ai.service";
import { ExerciseType, UserProfile } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { LessonRepository } from "@/repositories/lesson.repository";
import { LessonService } from "@/services/lesson.service";
import { SubscriptionPolicy } from "@/services/subscription.policy";

// Dependencies Injection
const exerciseRepo = new ExerciseRepository();
const userRepo = new UserRepository();
const attemptRepo = new AttemptRepository();
const lessonRepo = new LessonRepository();
const aiService = new AIService();

const exerciseService = new ExerciseService(exerciseRepo);
const attemptService = new AttemptService(attemptRepo, userRepo, exerciseRepo, aiService);
const lessonService = new LessonService(lessonRepo);

export async function getExercises(type: ExerciseType) {
    return exerciseService.listExercises(type);
}

export async function getExerciseById(id: string) {
    return exerciseService.getExercise(id);
}

export async function startAttempt(userId: string, exerciseId: string) {
    return attemptService.startAttempt(userId, exerciseId);
}

export async function checkFeatureAccess(feature: string) {
    const user = await getCurrentUser();
    if (!user) return false;
    return SubscriptionPolicy.canAccessFeature(user, feature);
}

export async function startExerciseAttempt(exerciseId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const exercise = await exerciseService.getExercise(exerciseId);
    if (!exercise) throw new Error("Exercise not found");

    // Check for premium features
    if (exercise.title.toLowerCase().includes("mock test")) {
        if (!SubscriptionPolicy.canAccessFeature(user, "mock_test")) {
            throw new Error("MOCK_TEST_PREMIUM_ONLY");
        }
    }

    // Check for evaluation limits
    if (!SubscriptionPolicy.canAccessFeature(user, "writing_evaluation")) {
        throw new Error("DAILY_LIMIT_EXCEEDED");
    }

    // Check for existing in-progress attempt to resume
    const attempts = await attemptService.getUserAttempts(user.id);
    const existing = attempts.find(a => a.exercise_id === exerciseId && (a.state === "CREATED" || a.state === "IN_PROGRESS"));

    if (existing) return existing;

    return attemptService.startAttempt(user.id, exerciseId);
}

export async function submitAttempt(attemptId: string, content: string) {
    await attemptService.submitAttempt(attemptId, content);
    // Fetch and return the updated attempt with feedback
    return attemptService.getAttempt(attemptId);
}

export async function getAttemptById(id: string) {
    return attemptService.getAttempt(id);
}

export async function getAttemptWithExercise(id: string) {
    const attempt = await attemptService.getAttempt(id);
    if (!attempt) return null;
    const exercise = await exerciseService.getExercise(attempt.exercise_id);
    return { ...attempt, exercise };
}

export async function getAllUsers() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAllAttempts() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("attempts").select(`
        *,
        user_profiles (email)
    `).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getUserAttempts() {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from("attempts")
        .select(`
            *,
            exercises (
                title,
                type
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function getLessons() {
    return lessonService.getAllLessons();
}

export async function getLessonById(id: string) {
    return lessonService.getLesson(id);
}

export async function getUserProfile(id: string) {
    return userRepo.getById(id);
}

export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Attempt to get the profile, but don't fail if it doesn't exist yet (e.g., during OAuth onboarding)
    const profile = await userRepo.getById(user.id);

    return {
        ...(profile || { id: user.id, email: user.email }),
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
    } as UserProfile;
}

export async function signInWithGoogle() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account',
            },
        },
    });

    if (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }

    if (data.url) {
        return redirect(data.url);
    }
}

export async function signOut() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return redirect("/login");
}

export async function rewriteText(text: string) {
    const result = await aiService.rewriteContent(text);
    return result.rewritten_text;
}

export async function getLessonQuestions(lessonId: string) {
    return lessonService.getQuestions(lessonId);
}
