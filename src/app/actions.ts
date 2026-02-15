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

export async function submitAttempt(attemptId: string, content: string) {
    return attemptService.submitAttempt(attemptId, content);
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
        .select("*")
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
