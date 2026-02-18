"use server";

import { ATTEMPT_STATES, DB_TABLES, FEATURE_KEYS, APP_ERROR_CODES } from "@/lib/constants";
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
import { LessonService } from "@/services/lesson.service"
import { FeaturePricingRepository } from "@/repositories/pricing.repository"
import { CreditTransactionRepository } from "@/repositories/transaction.repository";
import { SystemSettingsRepository } from "@/repositories/system-settings.repository";
import { CreditService } from "@/services/credit.service";
import { withTrace, getCurrentTraceId, Logger } from "@/lib/logger";
import { traceService, traceAction } from "@/lib/aop";

const logger = new Logger("UserActions");

// Dependencies Injection
const exerciseRepo = traceService(new ExerciseRepository(), "ExerciseRepository");
const userRepo = traceService(new UserRepository(), "UserRepository");
const attemptRepo = traceService(new AttemptRepository(), "AttemptRepository");
const lessonRepo = traceService(new LessonRepository(), "LessonRepository");
const _aiService = new AIService();
const aiService = traceService(_aiService, "AIService");

const exerciseService = traceService(new ExerciseService(exerciseRepo), "ExerciseService");
const attemptService = traceService(new AttemptService(attemptRepo, userRepo, exerciseRepo, aiService), "AttemptService");
const lessonService = traceService(new LessonService(lessonRepo), "LessonService");

// Credit Economy
const pricingRepo = traceService(new FeaturePricingRepository(), "FeaturePricingRepository");
const transactionRepo = traceService(new CreditTransactionRepository(), "CreditTransactionRepository");
const settingsRepo = traceService(new SystemSettingsRepository(), "SystemSettingsRepository");
const creditService = traceService(new CreditService(userRepo, pricingRepo, transactionRepo, settingsRepo), "CreditService");

export async function getExercises(type: ExerciseType) {
    return exerciseService.listExercises(type);
}

export async function getExerciseById(id: string) {
    return exerciseService.getExercise(id);
}

export async function startAttempt(userId: string, exerciseId: string) {
    return attemptService.startAttempt(userId, exerciseId);
}

export async function checkFeatureAccess(feature: string, cost: number = 0) {
    const user = await getCurrentUser();
    if (!user) return false;

    // If it's a mock test, we can check for special cases here if needed, 
    // but for now, we just check credits.
    return user.credits_balance >= cost;
}

export async function startExerciseAttempt(exerciseId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const exercise = await exerciseService.getExercise(exerciseId);
    if (!exercise) throw new Error("Exercise not found");

    // Check for existing in-progress attempt to resume
    const attempts = await attemptService.getUserAttempts(user.id);
    const existing = attempts.find(a => a.exercise_id === exerciseId && (a.state === ATTEMPT_STATES.CREATED || a.state === ATTEMPT_STATES.IN_PROGRESS));

    if (existing) return existing;

    return attemptService.startAttempt(user.id, exerciseId);
}

function generateTraceId() {
    return `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const submitAttempt = traceAction("submitAttempt", async (attemptId: string, content: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const attempt = await attemptService.getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const exercise = await exerciseService.getExercise(attempt.exercise_id);
    if (!exercise) throw new Error("Exercise not found");

    const featureKey = exercise.type.startsWith("writing") ? FEATURE_KEYS.WRITING_EVALUATION : FEATURE_KEYS.SPEAKING_EVALUATION;

    if (attempt.state === ATTEMPT_STATES.EVALUATED) {
        return attempt;
    }

    try {
        if (attempt.state !== ATTEMPT_STATES.SUBMITTED) {
            await creditService.billUser(user.id, featureKey);
        }
        await attemptService.submitAttempt(attemptId, content);
        return attemptService.getAttempt(attemptId);
    } catch (error) {
        if (error instanceof Error && error.name === "InsufficientFundsError") {
            // If insufficient credits, we still save the work but don't evaluate
            await attemptService.updateAttempt(attemptId, { content, state: ATTEMPT_STATES.SUBMITTED });
            return { ...(await attemptService.getAttempt(attemptId)), reason: APP_ERROR_CODES.INSUFFICIENT_CREDITS };
        }

        const traceId = getCurrentTraceId()!;
        logger.error(`submitAttempt Error: ${attemptId}`, { error });
        return { error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});

export const saveAttemptDraft = traceAction("saveAttemptDraft", async (attemptId: string, content: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const attempt = await attemptService.getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    await attemptService.updateAttempt(attemptId, {
        content,
        state: ATTEMPT_STATES.SUBMITTED,
        submitted_at: new Date().toISOString()
    });

    return { success: true };
});

export const reevaluateAttempt = traceAction("reevaluateAttempt", async (attemptId: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    try {
        await creditService.billUser(user.id, FEATURE_KEYS.WRITING_EVALUATION);
        const result = await attemptService.reevaluate(attemptId);
        return result;
    } catch (error) {
        if (error instanceof Error && error.name === "InsufficientFundsError") {
            return { success: false, reason: APP_ERROR_CODES.INSUFFICIENT_CREDITS, message: error.message };
        }

        const traceId = getCurrentTraceId()!;
        logger.error(`reevaluateAttempt Error: ${attemptId}`, { error });
        return { success: false, error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});

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
    const { data, error } = await supabase.from(DB_TABLES.USER_PROFILES).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAllAttempts() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from(DB_TABLES.ATTEMPTS).select(`
        *,
        ${DB_TABLES.USER_PROFILES} (email)
    `).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getUserAttempts() {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from(DB_TABLES.ATTEMPTS)
        .select(`
            *,
            ${DB_TABLES.EXERCISES} (
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

export const signInWithGoogle = traceAction("signInWithGoogle", async () => {
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

    if (error) throw error;
    if (data.url) return redirect(data.url);
});

export async function signOut() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return redirect("/login");
}

export const rewriteText = traceAction("rewriteText", async (text: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    try {
        await creditService.billUser(user.id, FEATURE_KEYS.TEXT_REWRITER);
        const result = await aiService.rewriteContent(text);
        return { success: true, text: result.rewritten_text };
    } catch (error) {
        if (error instanceof Error && error.name === "InsufficientFundsError") {
            return { success: false, reason: APP_ERROR_CODES.INSUFFICIENT_CREDITS };
        }

        const traceId = getCurrentTraceId()!;
        logger.error("rewriteText Error", { error });
        return { success: false, error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});

export async function getLessonQuestions(lessonId: string) {
    return lessonService.getQuestions(lessonId);
}

export const unlockCorrection = traceAction("unlockCorrection", async (attemptId: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const attempt = await attemptService.getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    if (attempt.is_correction_unlocked) {
        return { success: true, data: JSON.parse(attempt.correction_data) };
    }

    try {
        await creditService.billUser(user.id, FEATURE_KEYS.DETAILED_CORRECTION);
        const correction = await attemptService.unlockCorrection(attemptId);
        return { success: true, data: correction };
    } catch (errors) {
        const traceId = getCurrentTraceId()!;
        logger.error(`unlockCorrection Error: ${attemptId}`, { error: errors });
        return { success: false, reason: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});

export const getFeaturePrice = traceAction("getFeaturePrice", async (key: string) => {
    const pricing = await pricingRepo.getByKey(key);
    return pricing?.cost_per_unit || 0;
});
