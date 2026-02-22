"use server";

import { getCurrentUser } from "@/app/actions";
import { AdminPolicy } from "@/services/admin.policy";
import { TeacherService } from "@/services/teacher.service";
import { TeacherStudentRepository } from "@/repositories/teacher-student.repository";
import { CreditRequestRepository } from "@/repositories/credit-request.repository";
import { AttemptRepository } from "@/repositories/attempt.repository";
import { UserRepository } from "@/repositories/user.repository";
import { CreditTransactionRepository } from "@/repositories/transaction.repository";
import { FeaturePricingRepository } from "@/repositories/pricing.repository";
import { SystemSettingsRepository } from "@/repositories/system-settings.repository";
import { CreditService } from "@/services/credit.service";
import { ExerciseRepository } from "@/repositories/exercise.repository";
import { ExerciseService } from "@/services/exercise.service";
import { AIService } from "@/services/ai.service";
import { StorageService } from "@/services/storage.service";
import { traceService, traceAction } from "@/lib/aop";
import { revalidatePath } from "next/cache";
import { Exercise } from "@/types";
import { FEATURE_KEYS, APP_ERROR_CODES, AI_METHODS, NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } from "@/lib/constants";
import { notificationService } from "@/lib/notification-client";
import { AICostService } from "@/services/ai-cost.service";
import { AIUsageRepository } from "@/repositories/ai-usage.repository";
import { Logger } from "@/lib/logger";

const teacherStudentRepo = traceService(new TeacherStudentRepository(), "TeacherStudentRepository");
const creditRequestRepo = traceService(new CreditRequestRepository(), "CreditRequestRepository");
const attemptRepo = traceService(new AttemptRepository(), "AttemptRepository");
const userRepo = traceService(new UserRepository(), "UserRepository");
const transactionRepo = traceService(new CreditTransactionRepository(), "CreditTransactionRepository");
const pricingRepo = traceService(new FeaturePricingRepository(), "FeaturePricingRepository");
const settingsRepo = traceService(new SystemSettingsRepository(), "SystemSettingsRepository");
const creditService = traceService(new CreditService(userRepo, pricingRepo, transactionRepo, settingsRepo), "CreditService");
const exerciseRepo = traceService(new ExerciseRepository(), "ExerciseRepository");
const exerciseService = traceService(new ExerciseService(exerciseRepo), "ExerciseService");
const _aiService = new AIService();
const aiService = traceService(_aiService, "AIService");
const storageService = traceService(new StorageService(), "StorageService");

const teacherService = traceService(
    new TeacherService(teacherStudentRepo, creditRequestRepo, attemptRepo, userRepo, creditService),
    "TeacherService"
);

const logger = new Logger("TeacherActions");
const aiUsageRepo = new AIUsageRepository();
const aiCostService = new AICostService(aiUsageRepo);

async function checkTeacher() {
    const user = await getCurrentUser();
    if (!AdminPolicy.canAccessTeacher(user)) {
        throw new Error("Unauthorized");
    }
    return user!;
}

export async function getMyStudents() {
    const user = await checkTeacher();
    return teacherService.getStudentsWithProgress(user.id);
}

export async function getStudentProgress(studentId: string) {
    const user = await checkTeacher();
    return teacherService.getStudentDetail(user.id, studentId);
}

export async function createCreditRequest(studentId: string, amount: number, reason: string) {
    const user = await checkTeacher();
    const result = await teacherService.requestCredits(user.id, studentId, amount, reason);

    // Notify admins about new credit request — notify the teacher as confirmation
    notificationService.notify(
        user.id,
        NOTIFICATION_TYPES.CREDIT_REQUEST_NEW,
        "Credit Request Submitted",
        `Your request for ${amount} credits has been submitted and is pending review.`,
        {
            deepLink: "/teacher/credit-requests",
            entityId: result.id,
            entityType: NOTIFICATION_ENTITY_TYPES.CREDIT_REQUEST,
        }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    revalidatePath("/teacher/credit-requests");
    return result;
}

export async function getMyCreditRequests() {
    const user = await checkTeacher();
    return teacherService.getMyCreditRequests(user.id);
}

export async function getTeacherStats() {
    const user = await checkTeacher();
    const students = await teacherService.getStudentsWithProgress(user.id);
    const requests = await teacherService.getMyCreditRequests(user.id);
    const pendingRequests = requests.filter((r) => r.status === "pending");

    return {
        studentCount: students.length,
        pendingRequestCount: pendingRequests.length,
        totalAttempts: students.reduce((sum, s) => sum + s.attempt_count, 0),
    };
}

// ── Exercise Management ──

export const createTeacherExercise = traceAction("createTeacherExercise", async (exercise: Omit<Exercise, "id" | "created_at" | "version">) => {
    const user = await checkTeacher();
    const result = await exerciseService.createExerciseVersion({ ...exercise, created_by: user.id });
    revalidatePath("/teacher/exercises");
    revalidatePath("/admin/exercises");
    revalidatePath("/dashboard/writing");
    revalidatePath("/dashboard/speaking");
    return result;
});

export const deleteTeacherExercise = traceAction("deleteTeacherExercise", async (id: string) => {
    await checkTeacher();
    await exerciseService.deleteExercise(id);
    revalidatePath("/teacher/exercises");
    revalidatePath("/dashboard/writing");
    revalidatePath("/dashboard/speaking");
});

export const generateTeacherAIExercise = traceAction("generateTeacherAIExercise", async (type: string, topic?: string, chartType?: string) => {
    await checkTeacher();

    const traceId = crypto.randomUUID();

    if (type === "writing_task1") {
        const chartResult = await aiService.generateChartData(topic, chartType);
        const chartData = chartResult.data;

        aiCostService.recordUsage({
            userId: null, featureKey: "exercise_generation", modelName: chartResult.usage.modelName,
            promptTokens: chartResult.usage.promptTokens, completionTokens: chartResult.usage.completionTokens,
            aiMethod: AI_METHODS.GENERATE_CHART_DATA, creditsCharged: 0, durationMs: chartResult.usage.durationMs,
            traceId,
        }).catch((err) => logger.error("AI cost recording failed", { error: err }));

        const { ChartRenderer } = await import("@/lib/chart-renderer");
        const imageBuffer = await ChartRenderer.render(chartData.chart_config);
        const imageUrl = await storageService.upload(imageBuffer);

        return {
            title: chartData.title,
            prompt: chartData.prompt,
            image_url: imageUrl,
            chart_data: chartData.chart_config,
        };
    }

    const result = await aiService.generateExerciseContent(type, topic);

    aiCostService.recordUsage({
        userId: null, featureKey: "exercise_generation", modelName: result.usage.modelName,
        promptTokens: result.usage.promptTokens, completionTokens: result.usage.completionTokens,
        aiMethod: AI_METHODS.GENERATE_EXERCISE, creditsCharged: 0, durationMs: result.usage.durationMs,
        traceId,
    }).catch((err) => logger.error("AI cost recording failed", { error: err }));

    return result.data;
});

export async function uploadTeacherImage(formData: FormData) {
    await checkTeacher();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");
    return storageService.upload(file);
}

export const analyzeTeacherChartImage = traceAction("analyzeTeacherChartImage", async (imageBase64: string, mimeType: string) => {
    const user = await checkTeacher();

    const traceId = crypto.randomUUID();

    try {
        await creditService.billUser(user.id, FEATURE_KEYS.CHART_IMAGE_ANALYSIS, undefined, traceId);
    } catch (error) {
        if (error instanceof Error && error.name === "InsufficientFundsError") {
            return { success: false, error: APP_ERROR_CODES.INSUFFICIENT_CREDITS };
        }
        throw error;
    }

    const result = await aiService.analyzeChartImage(imageBase64, mimeType);

    aiCostService.recordUsage({
        userId: user.id, featureKey: FEATURE_KEYS.CHART_IMAGE_ANALYSIS, modelName: result.usage.modelName,
        promptTokens: result.usage.promptTokens, completionTokens: result.usage.completionTokens,
        aiMethod: AI_METHODS.ANALYZE_CHART_IMAGE, creditsCharged: 1, durationMs: result.usage.durationMs,
        traceId,
    }).catch((err) => logger.error("AI cost recording failed", { error: err }));

    return { success: true, data: result.data };
});

export async function getStudentRecentActivity() {
    const user = await checkTeacher();
    const students = await teacherStudentRepo.getStudentsByTeacher(user.id);
    const studentIds = students.map(s => s.id);
    if (studentIds.length === 0) return [];
    return transactionRepo.getRecentByUserIds(studentIds, 10);
}

export async function getTeacherExercises() {
    await checkTeacher();
    const types = ["writing_task1", "writing_task2", "speaking_part1", "speaking_part2", "speaking_part3"] as const;
    const { getExercises } = await import("@/app/actions");
    const allExercises = await Promise.all(types.map((t) => getExercises(t)));
    return allExercises.flat();
}
