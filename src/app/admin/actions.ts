"use server";

import { LessonRepository } from "@/repositories/lesson.repository";
import { LessonService } from "@/services/lesson.service";
import { getCurrentUser } from "@/app/actions";
import { AdminPolicy } from "@/services/admin.policy";
import { Lesson, LessonQuestion } from "@/types";
import { revalidatePath } from "next/cache";

import { ExerciseRepository } from "@/repositories/exercise.repository";
import { ExerciseService } from "@/services/exercise.service";
import { Exercise, ExerciseType } from "@/types";
import { AIService } from "@/services/ai.service";
import { withTrace, getCurrentTraceId, Logger } from "@/lib/logger";

import { UserRepository } from "@/repositories/user.repository";
import { AttemptRepository } from "@/repositories/attempt.repository";
import { CreditTransactionRepository } from "@/repositories/transaction.repository";
import { CreditPackageRepository } from "@/repositories/credit-package.repository";
import { CreditPackage } from "@/types";
import { StorageService } from "@/services/storage.service";

import { traceService } from "@/lib/aop";

const logger = new Logger("AdminActions");
const creditPackageRepo = new CreditPackageRepository();
const userRepo = new UserRepository();
const attemptRepo = new AttemptRepository();
const transactionRepo = new CreditTransactionRepository();
const lessonRepo = new LessonRepository();
const exerciseRepo = new ExerciseRepository();
const _aiService = new AIService();
const aiService = traceService(_aiService, "AIService");
const lessonService = traceService(new LessonService(lessonRepo), "LessonService");
const exerciseService = traceService(new ExerciseService(exerciseRepo), "ExerciseService");
const storageService = traceService(new StorageService(), "StorageService");

export async function seedCreditPackages() {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const packages: Omit<CreditPackage, "id" | "created_at" | "updated_at">[] = [
                {
                    name: "Band Booster",
                    credits: 100,
                    bonus_credits: 0,
                    price: 5.00,
                    tagline: "Perfect for getting started.",
                    type: "starter",
                    is_active: true,
                    display_order: 1
                },
                {
                    name: "Band Climber",
                    credits: 500,
                    bonus_credits: 50,
                    price: 20.00,
                    tagline: "Best value for serious practice.",
                    type: "pro",
                    is_active: true,
                    display_order: 2
                },
                {
                    name: "Band Mastery",
                    credits: 1500,
                    bonus_credits: 200,
                    price: 50.00,
                    tagline: "Maximum power for heavy users.",
                    type: "master",
                    is_active: true,
                    display_order: 3
                }
            ];

            for (const pkg of packages) {
                await creditPackageRepo.create(pkg);
            }

            revalidatePath("/admin/credits");
            revalidatePath("/dashboard/pricing");
            logger.info("Successfully seeded credit packages");
        } catch (error) {
            logger.error("Failed to seed credit packages", { error });
            throw error;
        }
    });
}

// ... existing code ...

export async function createCreditPackage(pkg: Omit<CreditPackage, "id" | "created_at" | "updated_at">) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const result = await creditPackageRepo.create(pkg);
            revalidatePath("/admin/credits");
            revalidatePath("/dashboard/pricing");
            return result;
        } catch (error) {
            logger.error("Failed to create credit package", { error, pkg });
            throw error;
        }
    });
}

export async function updateCreditPackage(id: string, pkg: Partial<CreditPackage>) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const result = await creditPackageRepo.update(id, pkg);
            revalidatePath("/admin/credits");
            revalidatePath("/dashboard/pricing");
            return result;
        } catch (error) {
            logger.error("Failed to update credit package", { error, id, pkg });
            throw error;
        }
    });
}

export async function deleteCreditPackage(id: string) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            await creditPackageRepo.delete(id);
            revalidatePath("/admin/credits");
            revalidatePath("/dashboard/pricing");
        } catch (error) {
            logger.error("Failed to delete credit package", { error, id });
            throw error;
        }
    });
}

export async function getCreditPackages() {
    await checkAdmin();
    return creditPackageRepo.listAll();
}

async function checkAdmin() {
    const user = await getCurrentUser();
    if (!AdminPolicy.canAccessAdmin(user)) {
        throw new Error("Unauthorized");
    }
}

export async function createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const result = await lessonService.createLesson(lesson);
            revalidatePath("/admin/lessons");
            revalidatePath("/dashboard/lessons");
            return result;
        } catch (error) {
            logger.error("Failed to create lesson", { error, lesson });
            throw error;
        }
    });
}

export async function updateLesson(id: string, lesson: Partial<Lesson>) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const result = await lessonService.updateLesson(id, lesson);
            revalidatePath("/admin/lessons");
            revalidatePath(`/admin/lessons/${id}`);
            revalidatePath("/dashboard/lessons");
            revalidatePath(`/dashboard/lessons/${id}`);
            return result;
        } catch (error) {
            logger.error("Failed to update lesson", { error, id, lesson });
            throw error;
        }
    });
}

export async function deleteLesson(id: string) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            await lessonService.deleteLesson(id);
            revalidatePath("/admin/lessons");
            revalidatePath("/dashboard/lessons");
        } catch (error) {
            logger.error("Failed to delete lesson", { error, id });
            throw error;
        }
    });
}

export async function createLessonQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const result = await lessonService.createQuestion(question);
            revalidatePath(`/admin/lessons/${question.lesson_id}`);
            return result;
        } catch (error) {
            logger.error("Failed to create lesson question", { error, question });
            throw error;
        }
    });
}

export async function updateLessonQuestion(id: string, question: Partial<LessonQuestion>) {
    await checkAdmin();
    const result = await lessonService.updateQuestion(id, question);
    revalidatePath(`/admin/lessons/${result.lesson_id}`);
    return result;
}

export async function deleteLessonQuestion(id: string, lessonId: string) {
    await checkAdmin();
    await lessonService.deleteQuestion(id);
    revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function getLessonQuestions(lessonId: string) {
    await checkAdmin();
    return lessonService.getQuestions(lessonId);
}

// Exercise Actions

export async function createExercise(exercise: Omit<Exercise, "id" | "created_at" | "version">) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const result = await exerciseService.createExerciseVersion(exercise);
            revalidatePath("/admin/exercises");
            revalidatePath("/dashboard/writing");
            revalidatePath("/dashboard/speaking");
            return result;
        } catch (error) {
            logger.error("Failed to create exercise", { error, exercise });
            throw error;
        }
    });
}

export async function generateAIExercise(type: string, topic?: string, chartType?: string) {
    return withTrace(async () => {
        try {
            await checkAdmin();

            // Special handling for Writing Task 1 to generate chart
            if (type === "writing_task1") {
                // 1. Generate Data
                const chartData = await aiService.generateChartData(topic, chartType);

                // 2. Render Image
                const { ChartRenderer } = await import("@/lib/chart-renderer");
                const imageBuffer = await ChartRenderer.render(chartData.chart_config);

                // 3. Upload Image
                const imageUrl = await storageService.upload(imageBuffer);

                return {
                    title: chartData.title,
                    prompt: chartData.prompt,
                    image_url: imageUrl
                };
            }

            return await aiService.generateExerciseContent(type, topic);
        } catch (error) {
            const traceId = getCurrentTraceId();
            logger.error("generateAIExercise action failed", { error, type, topic });

            if (error instanceof Error && error.message === "Unauthorized") {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`AI Generation failed: ${errorMessage} (Trace ID: ${traceId})`);
        }
    });
}

export async function uploadImage(formData: FormData) {
    await checkAdmin();

    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file uploaded");
    }

    try {
        const url = await storageService.upload(file);
        return url;
    } catch (error) {
        logger.error("Image upload failed", { error });
        throw new Error("Failed to upload image");
    }
}

export async function getAdminStats() {
    await checkAdmin();
    const [totalUsers, premiumUsers, todayAttempts, activeExercises] = await Promise.all([
        userRepo.getTotalCount(),
        userRepo.getPremiumCount(),
        attemptRepo.getTodayCount(),
        exerciseRepo.getTotalCount()
    ]);

    return {
        totalUsers,
        premiumUsers,
        todayAttempts,
        activeExercises
    };
}

export async function adjustUserCredits(userId: string, amount: number, reason: string) {
    return withTrace(async () => {
        try {
            await checkAdmin();
            const admin = await getCurrentUser();

            // Adjust balance
            await userRepo.addCredits(userId, amount);

            // Log transaction
            await transactionRepo.create({
                user_id: userId,
                amount,
                type: "gift_code",
                description: `Admin Adjustment (${admin?.email}): ${reason}`
            });

            revalidatePath("/admin/users");
            logger.info("Admin manually adjusted user credits", { userId, amount, reason });
        } catch (error) {
            logger.error("Failed to adjust user credits", { error, userId, amount, reason });
            throw error;
        }
    });
}

export async function getAdminAttempts(limit?: number) {
    await checkAdmin();
    return attemptRepo.listAll(limit);
}

export async function getAdminUsers() {
    await checkAdmin();
    return userRepo.listAll();
}

export async function getAdminUserTransactions(userId: string) {
    await checkAdmin();
    return transactionRepo.listByUserId(userId);
}

export async function getAdminUserAttempts(userId: string) {
    await checkAdmin();
    // Use attemptRepo to list by user
    return attemptRepo.listByUserId(userId);
}
