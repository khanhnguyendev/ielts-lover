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
import { FeaturePricingRepository } from "@/repositories/pricing.repository";
import { CreditTransactionRepository } from "@/repositories/transaction.repository";
import { CreditService } from "@/services/credit.service";
import { withTrace, getCurrentTraceId, Logger } from "@/lib/logger";

const logger = new Logger("UserActions");

// Dependencies Injection
const exerciseRepo = new ExerciseRepository();
const userRepo = new UserRepository();
const attemptRepo = new AttemptRepository();
const lessonRepo = new LessonRepository();
const aiService = new AIService();

const exerciseService = new ExerciseService(exerciseRepo);
const attemptService = new AttemptService(attemptRepo, userRepo, exerciseRepo, aiService);
const lessonService = new LessonService(lessonRepo);

// Credit Economy
const pricingRepo = new FeaturePricingRepository();
const transactionRepo = new CreditTransactionRepository();
const creditService = new CreditService(userRepo, pricingRepo, transactionRepo);

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
    return SubscriptionPolicy.canAccessFeature(user, feature, cost);
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

    // Check for existing in-progress attempt to resume
    const attempts = await attemptService.getUserAttempts(user.id);
    const existing = attempts.find(a => a.exercise_id === exerciseId && (a.state === "CREATED" || a.state === "IN_PROGRESS"));

    if (existing) return existing;

    return attemptService.startAttempt(user.id, exerciseId);
}

function generateTraceId() {
    return `ERR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export async function submitAttempt(attemptId: string, content: string) {
    return withTrace(async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        const attempt = await attemptService.getAttempt(attemptId);
        if (!attempt) throw new Error("Attempt not found");

        const exercise = await exerciseService.getExercise(attempt.exercise_id);
        if (!exercise) throw new Error("Exercise not found");

        const featureKey = exercise.type.startsWith("writing") ? "writing_evaluation" : "speaking_evaluation";

        try {
            await creditService.billUser(user.id, featureKey);
            await attemptService.submitAttempt(attemptId, content);
            return attemptService.getAttempt(attemptId);
        } catch (error) {
            if (error instanceof Error && error.name === "InsufficientFundsError") {
                // If insufficient credits, we still save the work but don't evaluate
                await attemptService.updateAttempt(attemptId, { content, state: "SUBMITTED" });
                return { ...(await attemptService.getAttempt(attemptId)), reason: "INSUFFICIENT_CREDITS" };
            }

            const traceId = getCurrentTraceId()!;
            logger.error(`submitAttempt Error: ${attemptId}`, { error });
            return { error: "INTERNAL_ERROR", traceId };
        }
    }, generateTraceId());
}

export async function saveAttemptDraft(attemptId: string, content: string) {
    return withTrace(async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        const attempt = await attemptService.getAttempt(attemptId);
        if (!attempt) throw new Error("Attempt not found");

        await attemptService.updateAttempt(attemptId, {
            content,
            state: "SUBMITTED",
            submitted_at: new Date().toISOString()
        });

        return { success: true };
    }, generateTraceId());
}

export async function reevaluateAttempt(attemptId: string) {
    return withTrace(async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        try {
            await creditService.billUser(user.id, "writing_evaluation");
            const result = await attemptService.reevaluate(attemptId);
            return result;
        } catch (error) {
            if (error instanceof Error && error.name === "InsufficientFundsError") {
                return { success: false, reason: "INSUFFICIENT_CREDITS", message: error.message };
            }

            const traceId = getCurrentTraceId()!;
            logger.error(`reevaluateAttempt Error: ${attemptId}`, { error });
            return { success: false, error: "INTERNAL_ERROR", traceId };
        }
    }, generateTraceId());
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
    return withTrace(async () => {
        const supabase = await createServerSupabaseClient();
        try {
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
        } catch (error) {
            const traceId = getCurrentTraceId()!;
            logger.error("signInWithGoogle Error", { error });
            throw error;
        }
    }, generateTraceId());
}

export async function signOut() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return redirect("/login");
}

export async function rewriteText(text: string) {
    return withTrace(async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        try {
            await creditService.billUser(user.id, "text_rewriter");
            const result = await aiService.rewriteContent(text);
            return { success: true, text: result.rewritten_text };
        } catch (error) {
            if (error instanceof Error && error.name === "InsufficientFundsError") {
                return { success: false, reason: "INSUFFICIENT_CREDITS" };
            }

            const traceId = getCurrentTraceId()!;
            logger.error("rewriteText Error", { error });
            return { success: false, error: "INTERNAL_ERROR", traceId };
        }
    }, generateTraceId());
}

export async function getLessonQuestions(lessonId: string) {
    return lessonService.getQuestions(lessonId);
}
