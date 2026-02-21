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
import { FEATURE_KEYS, APP_ERROR_CODES } from "@/lib/constants";

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

export const generateTeacherAIExercise = traceAction("generateTeacherAIExercise", async (type: string, topic?: string, chartType?: string) => {
    await checkTeacher();

    if (type === "writing_task1") {
        const chartData = await aiService.generateChartData(topic, chartType);
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

    return await aiService.generateExerciseContent(type, topic);
});

export async function uploadTeacherImage(formData: FormData) {
    await checkTeacher();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");
    return storageService.upload(file);
}

export const analyzeTeacherChartImage = traceAction("analyzeTeacherChartImage", async (imageBase64: string, mimeType: string) => {
    const user = await checkTeacher();

    try {
        await creditService.billUser(user.id, FEATURE_KEYS.CHART_IMAGE_ANALYSIS);
    } catch (error) {
        if (error instanceof Error && error.name === "InsufficientFundsError") {
            return { success: false, error: APP_ERROR_CODES.INSUFFICIENT_CREDITS };
        }
        throw error;
    }

    const analysis = await aiService.analyzeChartImage(imageBase64, mimeType);
    return { success: true, data: analysis };
});

export async function getTeacherExercises() {
    await checkTeacher();
    const types = ["writing_task1", "writing_task2", "speaking_part1", "speaking_part2", "speaking_part3"] as const;
    const { getExercises } = await import("@/app/actions");
    const allExercises = await Promise.all(types.map((t) => getExercises(t)));
    return allExercises.flat();
}
