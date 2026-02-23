"use server";

import { ATTEMPT_STATES, FEATURE_KEYS, APP_ERROR_CODES, SKILL_TYPES, ERROR_CATEGORIES, SkillType } from "@/lib/constants";
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
import { SAMPLE_REPORTS } from "@/lib/sample-data";
import { MistakeRepository } from "@/repositories/mistake.repository";
import { ActionPlanRepository } from "@/repositories/action-plan.repository";
import { ImprovementService } from "@/services/improvement.service";
import { AIUsageMetadata } from "@/services/ai.service";
import { AICostService } from "@/services/ai-cost.service";
import { AIUsageRepository } from "@/repositories/ai-usage.repository";
import { evaluateLimiter, simpleAiLimiter, checkRateLimit } from "@/lib/ratelimit";
import { acquireLock } from "@/lib/distributed-lock";
import { submitAttemptSchema, rewriteTextSchema, improveSentenceSchema, saveAttemptDraftSchema, updateUserProfileSchema } from "@/lib/validations";
import { notificationService } from "@/lib/notification-client";
import { NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } from "@/lib/constants";

const logger = new Logger("UserActions");

/** Returns the appropriate error code if the error is a billing-related rejection. */
function getBillingErrorCode(error: unknown): string | null {
    if (!(error instanceof Error)) return null;
    if (error.name === "InsufficientFundsError") return APP_ERROR_CODES.INSUFFICIENT_CREDITS;
    if (error.name === "MonthlyLimitError") return APP_ERROR_CODES.MONTHLY_LIMIT_REACHED;
    return null;
}

/** Fire-and-forget notification after an AI action completes. */
function notifyAIComplete(
    userId: string,
    title: string,
    body: string,
    deepLink?: string,
    entityId?: string,
) {
    notificationService.notify(
        userId,
        NOTIFICATION_TYPES.EVALUATION_COMPLETE,
        title,
        body,
        {
            deepLink,
            entityId,
            entityType: entityId ? NOTIFICATION_ENTITY_TYPES.ATTEMPT : undefined,
        }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));
}

/** Finds the sentence containing a substring from fullText. Splits on sentence boundaries (.!?) */
function findContainingSentence(fullText: string | null | undefined, substring: string): string | undefined {
    if (!fullText || !substring) return undefined;
    // Split on sentence-ending punctuation, keeping the delimiter
    const sentences = fullText.split(/(?<=[.!?])\s+/);
    const found = sentences.find(s => s.includes(substring));
    return found?.trim() || undefined;
}

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

// Mistake Bank
const mistakeRepo = traceService(new MistakeRepository(), "MistakeRepository");
const actionPlanRepo = traceService(new ActionPlanRepository(), "ActionPlanRepository");
const improvementService = traceService(new ImprovementService(mistakeRepo, actionPlanRepo, creditService, _aiService), "ImprovementService");

// AI Cost Accounting
const aiUsageRepo = new AIUsageRepository();
const aiCostService = new AICostService(aiUsageRepo);

function recordAICost(usage: AIUsageMetadata | undefined, userId: string | null, featureKey: string, aiMethod: string, creditsCharged: number, traceId?: string) {
    if (!usage) return;
    aiCostService.recordUsage({
        userId,
        featureKey,
        modelName: usage.modelName,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        aiMethod,
        creditsCharged,
        traceId,
        durationMs: usage.durationMs,
    }).catch((err) => logger.error("AI cost recording failed (non-blocking)", { error: err }));
}

export async function getExercises(type: ExerciseType) {
    return exerciseService.listExercises(type);
}

export async function getExerciseById(id: string) {
    return exerciseService.getExercise(id);
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
    const parsed = submitAttemptSchema.safeParse({ attemptId, content });
    if (!parsed.success) {
        return { error: APP_ERROR_CODES.CONTENT_TOO_LONG, message: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const rateResult = await checkRateLimit(evaluateLimiter, user.id);
    if (!rateResult.success) return { error: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "Too many evaluations right now. Try again in a minute." };

    const attempt = await attemptService.getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const exercise = await exerciseService.getExercise(attempt.exercise_id);
    if (!exercise) throw new Error("Exercise not found");

    const featureKey = exercise.type.startsWith("writing") ? FEATURE_KEYS.WRITING_EVALUATION : FEATURE_KEYS.SPEAKING_EVALUATION;

    if (attempt.state === ATTEMPT_STATES.EVALUATED) {
        return attempt;
    }

    // Idempotency guard: prevent concurrent billing+evaluation for the same attempt
    const release = await acquireLock(`evaluate:${attemptId}`);
    if (!release) {
        return { error: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "This attempt is already being evaluated." };
    }

    const traceId = crypto.randomUUID();
    let billed = false;
    try {
        // Re-check state after acquiring lock (another request may have completed)
        const freshAttempt = await attemptService.getAttempt(attemptId);
        if (freshAttempt?.state === ATTEMPT_STATES.EVALUATED) {
            return freshAttempt;
        }

        if (attempt.state !== ATTEMPT_STATES.SUBMITTED) {
            await creditService.billUser(user.id, featureKey, attempt.exercise_id, traceId);
            billed = true;
        }
        const usage = await attemptService.submitAttempt(attemptId, content);
        const evaluatedAttempt = await attemptService.getAttempt(attemptId);

        const aiMethod = exercise.type.startsWith("writing") ? "generateWritingReport" : "generateFeedback";
        recordAICost(usage, user.id, featureKey, aiMethod, 1, traceId);

        notifyAIComplete(
            user.id,
            "Evaluation Ready",
            `Your ${exercise.type.startsWith("writing") ? "writing" : "speaking"} submission has been evaluated.`,
            `/dashboard/reports/${attemptId}`,
            attemptId,
        );

        return evaluatedAttempt;
    } catch (error) {
        const billingCode = getBillingErrorCode(error);
        if (billingCode) {
            // If insufficient credits or monthly cap, save work but don't evaluate
            await attemptService.updateAttempt(attemptId, { content, state: ATTEMPT_STATES.SUBMITTED });
            return { ...(await attemptService.getAttempt(attemptId)), reason: billingCode };
        }

        // Refund credits if billing succeeded but AI call failed
        if (billed) {
            creditService.refundUser(user.id, featureKey, traceId).catch(err =>
                logger.error("Credit refund failed", { error: err, attemptId, traceId })
            );
        }

        logger.error(`submitAttempt Error: ${attemptId}`, { error });
        return { error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    } finally {
        await release();
    }
});

export const saveAttemptDraft = traceAction("saveAttemptDraft", async (attemptId: string, content: string) => {
    const parsed = saveAttemptDraftSchema.safeParse({ attemptId, content });
    if (!parsed.success) throw new Error("Invalid input");

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

    const rateResult = await checkRateLimit(evaluateLimiter, user.id);
    if (!rateResult.success) return { success: false, reason: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "Rate limit exceeded" };

    // Idempotency guard: prevent concurrent re-evaluation for the same attempt
    const release = await acquireLock(`evaluate:${attemptId}`);
    if (!release) {
        return { success: false, reason: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "This attempt is already being evaluated." };
    }

    const traceId = crypto.randomUUID();
    let billed = false;
    try {
        const attempt = await attemptService.getAttempt(attemptId);
        if (!attempt) throw new Error("Attempt not found");

        await creditService.billUser(user.id, FEATURE_KEYS.WRITING_EVALUATION, attempt.exercise_id, traceId);
        billed = true;
        const result = await attemptService.reevaluate(attemptId);
        recordAICost(result.usage, user.id, FEATURE_KEYS.WRITING_EVALUATION, "generateWritingReport", 1, traceId);

        notifyAIComplete(user.id, "Re-evaluation Complete", "Your submission has been re-evaluated with fresh AI analysis.", `/dashboard/reports/${attemptId}`, attemptId);

        return result;
    } catch (error) {
        const billingCode = getBillingErrorCode(error);
        if (billingCode) {
            return { success: false, reason: billingCode, message: (error as Error).message };
        }

        if (billed) {
            creditService.refundUser(user.id, FEATURE_KEYS.WRITING_EVALUATION, traceId).catch(err =>
                logger.error("Credit refund failed", { error: err, attemptId, traceId })
            );
        }

        logger.error(`reevaluateAttempt Error: ${attemptId}`, { error });
        return { success: false, error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    } finally {
        await release();
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
    return userRepo.listAll();
}

export async function getAllAttempts() {
    return attemptRepo.listAll();
}

export async function getUserAttempts() {
    const user = await getCurrentUser();
    if (!user) return [];
    return attemptRepo.listWritingAttemptsByUserId(user.id);
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

export async function updateUserProfile(data: {
    full_name?: string;
    target_score?: number;
    test_type?: "academic" | "general";
    exam_date?: string;
}) {
    const parsed = updateUserProfileSchema.safeParse(data);
    if (!parsed.success) throw new Error("Invalid input");

    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Only allow safe fields
    const allowed: Partial<UserProfile> = {};
    if (data.full_name !== undefined) allowed.full_name = data.full_name;
    if (data.target_score !== undefined) allowed.target_score = data.target_score;
    if (data.test_type !== undefined) allowed.test_type = data.test_type;
    if (data.exam_date !== undefined) allowed.exam_date = data.exam_date;

    await userRepo.update(user.id, allowed);
    return { success: true };
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
    const parsed = rewriteTextSchema.safeParse({ text });
    if (!parsed.success) {
        return { success: false, reason: APP_ERROR_CODES.CONTENT_TOO_LONG, message: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const rateResult = await checkRateLimit(simpleAiLimiter, user.id);
    if (!rateResult.success) return { success: false, reason: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "Rate limit exceeded" };

    const traceId = crypto.randomUUID();
    let billed = false;
    try {
        await creditService.billUser(user.id, FEATURE_KEYS.TEXT_REWRITER, undefined, traceId);
        billed = true;
        const result = await aiService.rewriteContent(text);
        recordAICost(result.usage, user.id, FEATURE_KEYS.TEXT_REWRITER, "rewriteContent", 1, traceId);

        notifyAIComplete(user.id, "Text Rewrite Ready", "Your IELTS text has been rewritten and polished.");

        return { success: true, text: result.data.rewritten_text };
    } catch (error) {
        if (getBillingErrorCode(error)) {
            return { success: false, reason: getBillingErrorCode(error)! };
        }

        if (billed) {
            creditService.refundUser(user.id, FEATURE_KEYS.TEXT_REWRITER, traceId).catch(err =>
                logger.error("Credit refund failed", { error: err, traceId })
            );
        }

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

    // Handle sample reports
    if (attemptId.startsWith("sample-")) {
        const id = parseInt(attemptId.replace("sample-", ""));
        const sample = SAMPLE_REPORTS[id];
        if (sample) {
            return {
                success: true,
                data: { edits: (sample as any).feedbackCards || [] }
            };
        }
    }

    const rateResult = await checkRateLimit(evaluateLimiter, user.id);
    if (!rateResult.success) return { success: false, reason: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "Rate limit exceeded" };

    const attempt = await attemptService.getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    if (attempt.is_correction_unlocked) {
        return { success: true, data: JSON.parse(attempt.correction_data) };
    }

    const traceId = crypto.randomUUID();
    let billed = false;
    try {
        await creditService.billUser(user.id, FEATURE_KEYS.DETAILED_CORRECTION, attempt.exercise_id, traceId);
        billed = true;
        const { data: correction, usage } = await attemptService.unlockCorrection(attemptId);
        recordAICost(usage, user.id, FEATURE_KEYS.DETAILED_CORRECTION, "generateCorrection", 1, traceId);

        // Extract mistakes from corrections for the Mistake Bank
        try {
            if (correction?.edits && Array.isArray(correction.edits)) {
                const mistakes = correction.edits
                    .filter((edit: any) => edit.original_substring && edit.suggested_fix)
                    .map((edit: any) => ({
                        user_id: user.id,
                        source_attempt_id: attemptId,
                        skill_type: SKILL_TYPES.WRITING as SkillType,
                        error_category: edit.error_type === 'grammar' ? ERROR_CATEGORIES.GRAMMAR
                            : edit.error_type === 'vocabulary' ? ERROR_CATEGORIES.VOCABULARY
                                : edit.error_type === 'spelling' ? ERROR_CATEGORIES.GRAMMAR
                                    : ERROR_CATEGORIES.COHERENCE,
                        original_context: edit.original_substring,
                        correction: edit.suggested_fix,
                        explanation: edit.explanation,
                        source_sentence: findContainingSentence(attempt.content, edit.original_substring),
                    }));

                if (mistakes.length > 0) {
                    await mistakeRepo.saveMistakes(mistakes);
                }
            }
        } catch (extractError) {
            logger.error('Correction mistake extraction failed (non-blocking)', { error: extractError });
        }

        notifyAIComplete(user.id, "Detailed Correction Ready", "Your sentence-by-sentence correction is now available.", `/dashboard/reports/${attemptId}`, attemptId);

        return { success: true, data: correction };
    } catch (errors: any) {
        if (getBillingErrorCode(errors)) {
            return { success: false, reason: getBillingErrorCode(errors)! };
        }

        if (billed) {
            creditService.refundUser(user.id, FEATURE_KEYS.DETAILED_CORRECTION, traceId).catch(err =>
                logger.error("Credit refund failed", { error: err, attemptId, traceId })
            );
        }

        logger.error(`unlockCorrection Error: ${attemptId}`, { error: errors });

        // Handle Generative AI Overload (503)
        if (errors?.message?.includes('503') || errors?.message?.includes('Service Unavailable') || errors?.message?.includes('high demand')) {
            return { success: false, reason: APP_ERROR_CODES.AI_SERVICE_BUSY, traceId };
        }

        return { success: false, reason: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});

export const improveSentence = traceAction("improveSentence", async (sentence: string, targetScore?: number) => {
    const parsed = improveSentenceSchema.safeParse({ sentence, targetScore });
    if (!parsed.success) {
        return { success: false, error: APP_ERROR_CODES.CONTENT_TOO_LONG, message: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const rateResult = await checkRateLimit(simpleAiLimiter, user.id);
    if (!rateResult.success) return { success: false, error: APP_ERROR_CODES.AI_SERVICE_BUSY, message: "Rate limit exceeded" };

    let billed = false;
    try {
        await creditService.billUser(user.id, FEATURE_KEYS.SENTENCE_IMPROVE);
        billed = true;
        // Use provided target score or fallback to user profile or 9.0
        const scoreToUse = targetScore || user.target_score || 9.0;
        const result = await aiService.improveSentence(sentence, scoreToUse);
        recordAICost(result.usage, user.id, FEATURE_KEYS.SENTENCE_IMPROVE, "improveSentence", 1);

        notifyAIComplete(user.id, "Sentence Improved", "Your improved sentence is ready to review.");

        return { success: true, data: { improved_sentence: result.data } };
    } catch (error) {
        if (getBillingErrorCode(error)) {
            return { success: false, error: getBillingErrorCode(error)! };
        }

        if (billed) {
            creditService.refundUser(user.id, FEATURE_KEYS.SENTENCE_IMPROVE).catch(err =>
                logger.error("Credit refund failed", { error: err })
            );
        }

        const traceId = getCurrentTraceId()!;
        logger.error("improveSentence Error", { error });
        return { success: false, error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});

export const getFeaturePrice = traceAction("getFeaturePrice", async (key: string) => {
    const pricing = await pricingRepo.getByKey(key);
    return pricing?.cost_per_unit || 0;
});

// ─── Recent Activity ─────────────────────────────────────────

export async function getRecentActivity() {
    const user = await getCurrentUser();
    if (!user) return [];
    return transactionRepo.getRecentByUserId(user.id, 5);
}

// ─── Mistake Bank & Improvement ───────────────────────────────

export const getMistakeDashboardData = traceAction("getMistakeDashboardData", async (skillFilter?: SkillType) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const data = await improvementService.getMistakeDashboard(user.id, skillFilter);
    return {
        ...data,
        target_score: user.target_score
    };
});

export const generateWeaknessAnalysis = traceAction("generateWeaknessAnalysis", async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const rateResult = await checkRateLimit(evaluateLimiter, user.id);
    if (!rateResult.success) return { success: false, error: APP_ERROR_CODES.AI_SERVICE_BUSY };

    const traceId = crypto.randomUUID();
    try {
        const { plan, usage } = await improvementService.generateAIActionPlan(user.id, traceId);
        recordAICost(usage, user.id, FEATURE_KEYS.WEAKNESS_ANALYSIS, "analyzeWeaknesses", 1, traceId);

        notifyAIComplete(user.id, "Weakness Analysis Ready", "Your personalized AI action plan is available.", "/dashboard/improvement");

        return { success: true, data: plan };
    } catch (error) {
        if (getBillingErrorCode(error)) {
            return { success: false, error: getBillingErrorCode(error)! };
        }

        // Refund: billing happens before AI call inside generateAIActionPlan
        creditService.refundUser(user.id, FEATURE_KEYS.WEAKNESS_ANALYSIS, traceId).catch(err =>
            logger.error("Credit refund failed", { error: err, traceId })
        );

        logger.error("generateWeaknessAnalysis Error", { error });
        return { success: false, error: APP_ERROR_CODES.INTERNAL_ERROR, traceId };
    }
});
