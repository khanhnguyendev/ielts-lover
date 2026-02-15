"use server";

import { ExerciseRepository } from "@/repositories/exercise.repository";
import { UserRepository } from "@/repositories/user.repository";
import { AttemptRepository } from "@/repositories/attempt.repository";
import { ExerciseService } from "@/services/exercise.service";
import { AttemptService } from "@/services/attempt.service";
import { AIService } from "@/services/ai.service";
import { ExerciseType } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Dependencies Injection
const exerciseRepo = new ExerciseRepository();
const userRepo = new UserRepository();
const attemptRepo = new AttemptRepository();
const aiService = new AIService();

const exerciseService = new ExerciseService(exerciseRepo);
const attemptService = new AttemptService(attemptRepo, userRepo, exerciseRepo, aiService);

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

export async function getUserProfile(id: string) {
    return userRepo.getById(id);
}

export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;
    return userRepo.getById(user.id);
}
