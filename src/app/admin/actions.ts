"use server";

import { TRANSACTION_TYPES, TransactionType, FEATURE_KEYS, APP_ERROR_CODES } from "@/lib/constants";
import { ActivityDetail, AIUsageLog } from "@/repositories/interfaces";
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
import { SystemSettingsRepository } from "@/repositories/system-settings.repository";
import { FeaturePricingRepository } from "@/repositories/pricing.repository";
import { TeacherStudentRepository } from "@/repositories/teacher-student.repository";
import { CreditRequestRepository } from "@/repositories/credit-request.repository";
import { CreditPackage } from "@/types";
import { StorageService } from "@/services/storage.service";
import { CreditService } from "@/services/credit.service";
import { TeacherService } from "@/services/teacher.service";

import { traceService, traceAction } from "@/lib/aop";
import { setMaintenanceMode } from "@/lib/maintenance";
import { USER_ROLES, UserRole, NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } from "@/lib/constants";
import { AICostService } from "@/services/ai-cost.service";
import { AIUsageRepository } from "@/repositories/ai-usage.repository";
import { AI_METHODS } from "@/lib/constants";
import { notificationService } from "@/lib/notification-client";

const logger = new Logger("AdminActions");
const creditPackageRepo = traceService(new CreditPackageRepository(), "CreditPackageRepository");
const userRepo = traceService(new UserRepository(), "UserRepository");
const attemptRepo = traceService(new AttemptRepository(), "AttemptRepository");
const transactionRepo = traceService(new CreditTransactionRepository(), "CreditTransactionRepository");
const lessonRepo = traceService(new LessonRepository(), "LessonRepository");
const exerciseRepo = traceService(new ExerciseRepository(), "ExerciseRepository");
const settingsRepo = traceService(new SystemSettingsRepository(), "SystemSettingsRepository");
const pricingRepo = traceService(new FeaturePricingRepository(), "FeaturePricingRepository");
const _aiService = new AIService();
const aiService = traceService(_aiService, "AIService");
const lessonService = traceService(new LessonService(lessonRepo), "LessonService");
const exerciseService = traceService(new ExerciseService(exerciseRepo), "ExerciseService");
const storageService = traceService(new StorageService(), "StorageService");
const creditService = traceService(new CreditService(userRepo, pricingRepo, transactionRepo, settingsRepo), "CreditService");
const teacherStudentRepo = traceService(new TeacherStudentRepository(), "TeacherStudentRepository");
const creditRequestRepo = traceService(new CreditRequestRepository(), "CreditRequestRepository");
const teacherService = traceService(
    new TeacherService(teacherStudentRepo, creditRequestRepo, attemptRepo, userRepo, creditService),
    "TeacherService"
);

// AI Cost Accounting
const aiUsageRepo = traceService(new AIUsageRepository(), "AIUsageRepository");
const aiCostService = new AICostService(aiUsageRepo);

export const seedCreditPackages = traceAction("seedCreditPackages", async () => {
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
});

export const generateAndSeedPackages = traceAction("generateAndSeedPackages", async (
    tiers: { credits: number; price: number }[]
) => {
    await checkAdmin();

    // 1. Generate AI content for package names and taglines
    const aiService = new AIService();
    const aiResult = await aiService.generatePackageContent(tiers);

    // Log AI usage
    const aiUsageRepo = traceService(new AIUsageRepository(), "AIUsageRepository");
    const currentUser = await getCurrentUser();
    await aiUsageRepo.logUsage({
        user_id: currentUser?.id ?? null,
        feature_key: "generate_package_content",
        ai_method: "generate_package_content",
        model_name: aiResult.usage.modelName,
        prompt_tokens: aiResult.usage.promptTokens,
        completion_tokens: aiResult.usage.completionTokens,
        total_tokens: aiResult.usage.totalTokens,
        input_cost_usd: 0,
        output_cost_usd: 0,
        total_cost_usd: 0,
        duration_ms: aiResult.usage.durationMs,
        credits_charged: 0,
    });

    // 2. Delete all existing packages
    const existingPackages = await creditPackageRepo.listAll();
    for (const pkg of existingPackages) {
        await creditPackageRepo.delete(pkg.id);
    }

    // 3. Create new packages with AI-generated content
    const typeMap: ("starter" | "pro" | "master")[] = ["starter", "pro", "master"];
    const generatedContent = aiResult.data;

    for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        const content = generatedContent[i];
        await creditPackageRepo.create({
            name: content.name,
            credits: tier.credits,
            bonus_credits: content.bonus_credits || 0,
            price: Number(tier.price.toFixed(2)),
            tagline: content.tagline,
            type: typeMap[i] || "starter",
            is_active: true,
            display_order: i + 1,
        });
    }

    revalidatePath("/admin/credits");
    revalidatePath("/dashboard/credits");
    revalidatePath("/dashboard/pricing");
    logger.info("Successfully generated and seeded credit packages with AI content", { tiers: tiers.length });
});

// ... existing code ...

export const createCreditPackage = traceAction("createCreditPackage", async (pkg: Omit<CreditPackage, "id" | "created_at" | "updated_at">) => {
    await checkAdmin();
    const result = await creditPackageRepo.create(pkg);
    revalidatePath("/admin/credits");
    revalidatePath("/dashboard/pricing");
    return result;
});

export const updateCreditPackage = traceAction("updateCreditPackage", async (id: string, pkg: Partial<CreditPackage>) => {
    await checkAdmin();
    const result = await creditPackageRepo.update(id, pkg);
    revalidatePath("/admin/credits");
    revalidatePath("/dashboard/pricing");
    return result;
});

export const deleteCreditPackage = traceAction("deleteCreditPackage", async (id: string) => {
    await checkAdmin();
    await creditPackageRepo.delete(id);
    revalidatePath("/admin/credits");
    revalidatePath("/dashboard/pricing");
});

export async function getCreditPackages() {
    await checkAdmin();
    return creditPackageRepo.listAll();
}

async function checkAdmin() {
    const user = await getCurrentUser();
    if (!AdminPolicy.canAccessAdmin(user)) {
        throw new Error("Unauthorized");
    }
    return user!;
}

export const createLesson = traceAction("createLesson", async (lesson: Omit<Lesson, 'id' | 'created_at'>) => {
    await checkAdmin();
    const result = await lessonService.createLesson(lesson);
    revalidatePath("/admin/lessons");
    revalidatePath("/dashboard/lessons");
    return result;
});

export const updateLesson = traceAction("updateLesson", async (id: string, lesson: Partial<Lesson>) => {
    await checkAdmin();
    const result = await lessonService.updateLesson(id, lesson);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${id}`);
    revalidatePath("/dashboard/lessons");
    revalidatePath(`/dashboard/lessons/${id}`);
    return result;
});

export const deleteLesson = traceAction("deleteLesson", async (id: string) => {
    await checkAdmin();
    await lessonService.deleteLesson(id);
    revalidatePath("/admin/lessons");
    revalidatePath("/dashboard/lessons");
});

export const createLessonQuestion = traceAction("createLessonQuestion", async (question: Omit<LessonQuestion, 'id' | 'created_at'>) => {
    await checkAdmin();
    const result = await lessonService.createQuestion(question);
    revalidatePath(`/admin/lessons/${question.lesson_id}`);
    return result;
});

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

export const createExercise = traceAction("createExercise", async (
    exercise: Omit<Exercise, "id" | "created_at" | "version">,
    sourceExerciseId?: string
) => {
    const user = await checkAdmin();
    const result = await exerciseService.createExerciseVersion({ ...exercise, created_by: user.id }, sourceExerciseId);
    revalidatePath("/admin/exercises");
    revalidatePath("/dashboard/writing");
    revalidatePath("/dashboard/speaking");
    return result;
});

export const deleteExercise = traceAction("deleteExercise", async (id: string) => {
    await checkAdmin();
    await exerciseService.deleteExercise(id);
    revalidatePath("/admin/exercises");
    revalidatePath("/dashboard/writing");
    revalidatePath("/dashboard/speaking");
});

export const generateAIExercise = traceAction("generateAIExercise", async (type: string, topic?: string, chartType?: string) => {
    const admin = await checkAdmin();
    const adminUserId = admin.id;

    const traceId = crypto.randomUUID();

    // Special handling for Writing Task 1 to generate chart
    if (type === "writing_task1") {
        // 1. Generate Data
        const chartResult = await aiService.generateChartData(topic, chartType);
        const chartData = chartResult.data;

        aiCostService.recordUsage({
            userId: adminUserId, featureKey: "exercise_generation", modelName: chartResult.usage.modelName,
            promptTokens: chartResult.usage.promptTokens, completionTokens: chartResult.usage.completionTokens,
            aiMethod: AI_METHODS.GENERATE_CHART_DATA, creditsCharged: 0, durationMs: chartResult.usage.durationMs,
            traceId
        }).catch((err) => logger.error("AI cost recording failed", { error: err }));

        // 2. Render Image (returns null for non-renderable types like process_diagram, map, table)
        const { ChartRenderer } = await import("@/lib/chart-renderer");
        const imageBuffer = await ChartRenderer.render(chartData.chart_config);

        // 3. Upload Image only if rendering succeeded
        const imageUrl = imageBuffer ? await storageService.upload(imageBuffer) : undefined;

        return {
            title: chartData.title,
            prompt: chartData.prompt,
            ...(imageUrl && { image_url: imageUrl }),
            chart_data: chartData.chart_config
        };
    }

    const result = await aiService.generateExerciseContent(type, topic);

    aiCostService.recordUsage({
        userId: adminUserId, featureKey: "exercise_generation", modelName: result.usage.modelName,
        promptTokens: result.usage.promptTokens, completionTokens: result.usage.completionTokens,
        aiMethod: AI_METHODS.GENERATE_EXERCISE, creditsCharged: 0, durationMs: result.usage.durationMs,
        traceId,
    }).catch((err) => logger.error("AI cost recording failed", { error: err }));

    return result.data;
});

export const bulkGenerateExercises = traceAction("bulkGenerateExercises", async (params: {
    type: string;
    count: number;
    chartType?: string;
    topic?: string;
}) => {
    const admin = await checkAdmin();
    const { type, count, chartType, topic } = params;

    const succeeded: Array<{ index: number; title: string }> = [];
    const failed: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < count; i++) {
        try {
            const generated = await generateAIExercise(type, topic, chartType === "auto" ? undefined : chartType);
            if (!generated) throw new Error("No data returned");

            await createExercise({
                title: (generated as any).title,
                type: type as ExerciseType,
                prompt: (generated as any).prompt,
                image_url: (generated as any).image_url,
                chart_data: (generated as any).chart_data,
                is_published: true,
            });

            succeeded.push({ index: i, title: (generated as any).title });
        } catch (err: any) {
            logger.error(`bulkGenerateExercises: item ${i} failed`, { error: err });
            failed.push({ index: i, error: err?.message || "Unknown error" });
        }
    }

    revalidatePath("/admin/exercises");
    revalidatePath("/dashboard/writing");
    revalidatePath("/dashboard/speaking");

    return { succeeded, failed, total: count };
});

export const analyzeChartImage = traceAction("analyzeChartImage", async (imageBase64: string, mimeType: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const traceId = crypto.randomUUID();
    // Bill user for chart analysis (anti-spam)
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
    const [totalUsers, todayAttempts, activeExercises] = await Promise.all([
        userRepo.getTotalCount(),
        attemptRepo.getTodayCount(),
        exerciseRepo.getTotalCount()
    ]);

    return {
        totalUsers,
        todayAttempts,
        activeExercises
    };
}

export const adjustUserCredits = traceAction("adjustUserCredits", async (userId: string, amount: number, reason: string) => {
    const admin = await checkAdmin();

    await creditService.rewardUser(
        userId,
        amount,
        TRANSACTION_TYPES.GIFT_CODE,
        reason || "Manual Credit Adjustment",
        admin.id
    );

    // Notify user about credits received
    notificationService.notify(
        userId,
        NOTIFICATION_TYPES.CREDITS_RECEIVED,
        "Credits Received",
        `You received ${amount} credits${reason ? `: ${reason}` : "."}`,
        {
            deepLink: "/dashboard",
            entityType: NOTIFICATION_ENTITY_TYPES.CREDIT_TRANSACTION,
        }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    revalidatePath("/admin/users");
    logger.info("Admin manually adjusted user credits", { userId, amount, reason });
});

export async function getAdminAttempts(limit?: number) {
    await checkAdmin();
    return attemptRepo.listAll(limit);
}

export async function getAdminUsers() {
    await checkAdmin();
    return userRepo.listAll();
}

export async function getUserLastActivityMap() {
    await checkAdmin();
    return transactionRepo.getLastActivityMap();
}

export async function getRecentPlatformActivity() {
    await checkAdmin();
    return transactionRepo.getRecentAll(10);
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
export const getSystemSettings = traceAction("getSystemSettings", async () => {
    await checkAdmin();
    return settingsRepo.listAll();
});

export const updateSystemSetting = traceAction("updateSystemSetting", async (key: string, value: unknown) => {
    await checkAdmin();
    await settingsRepo.updateSetting(key, value as any);
    revalidatePath("/admin/settings");
});

export const toggleMaintenanceMode = traceAction("toggleMaintenanceMode", async (enabled: boolean) => {
    await checkAdmin();
    await settingsRepo.updateSetting("MAINTENANCE_MODE", enabled);
    await setMaintenanceMode(enabled);
    revalidatePath("/admin/settings");
});

export const getFeaturePricing = traceAction("getFeaturePricing", async () => {
    await checkAdmin();
    return pricingRepo.listAll();
});

export const updateFeaturePricing = traceAction("updateFeaturePricing", async (key: string, cost: number) => {
    await checkAdmin();
    await pricingRepo.updatePricing(key, cost);
    revalidatePath("/admin/settings");
});

// ── Teacher Management ──

export const setUserRole = traceAction("setUserRole", async (userId: string, role: string) => {
    await checkAdmin();

    const validRoles = Object.values(USER_ROLES) as string[];
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
    }

    const targetUser = await userRepo.getById(userId);
    if (targetUser?.role === USER_ROLES.ADMIN) {
        throw new Error("Cannot change the role of an admin account");
    }

    await userRepo.update(userId, { role: role as UserRole });

    const roleLabel = role === USER_ROLES.TEACHER ? "Teacher" : role === USER_ROLES.ADMIN ? "Admin" : "User";
    notificationService.notify(
        userId,
        NOTIFICATION_TYPES.SYSTEM,
        "Role Updated",
        `Your account role has been changed to ${roleLabel}.`,
        { deepLink: "/dashboard" }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    revalidatePath("/admin/users");
    logger.info("Admin changed user role", { userId, role });
});

export const assignTeacherStudent = traceAction("assignTeacherStudent", async (teacherId: string, studentId: string) => {
    const admin = await getCurrentUser();
    if (!AdminPolicy.canAccessAdmin(admin)) throw new Error("Unauthorized");

    await teacherService.assignStudent(teacherId, studentId, admin!.id);

    const teacher = await userRepo.getById(teacherId);
    notificationService.notify(
        studentId,
        NOTIFICATION_TYPES.SYSTEM,
        "Teacher Assigned",
        `You have been assigned to ${teacher?.full_name || "a teacher"} for guided practice.`,
        { deepLink: "/dashboard" }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    notificationService.notify(
        teacherId,
        NOTIFICATION_TYPES.SYSTEM,
        "New Student Assigned",
        "A new student has been assigned to you.",
        { deepLink: "/teacher" }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    revalidatePath("/admin/users");
    logger.info("Admin assigned teacher-student link", { teacherId, studentId });
});

export const unassignTeacherStudent = traceAction("unassignTeacherStudent", async (teacherId: string, studentId: string) => {
    await checkAdmin();
    await teacherService.unassignStudent(teacherId, studentId);

    notificationService.notify(
        studentId,
        NOTIFICATION_TYPES.SYSTEM,
        "Teacher Unassigned",
        "You have been unassigned from your teacher.",
        { deepLink: "/dashboard" }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    notificationService.notify(
        teacherId,
        NOTIFICATION_TYPES.SYSTEM,
        "Student Removed",
        "A student has been removed from your roster.",
        { deepLink: "/teacher" }
    ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

    revalidatePath("/admin/users");
    logger.info("Admin removed teacher-student link", { teacherId, studentId });
});

export async function getTeacherStudents(teacherId: string) {
    await checkAdmin();
    return teacherStudentRepo.getStudentsByTeacher(teacherId);
}

export async function getAllUsers() {
    await checkAdmin();
    return userRepo.listAll();
}

// ── Credit Request Management ──

export async function getPendingCreditRequests() {
    await checkAdmin();
    return teacherService.getPendingCreditRequests();
}

export async function getAllCreditRequests() {
    await checkAdmin();
    return teacherService.getAllCreditRequests();
}

export const approveCreditRequest = traceAction("approveCreditRequest", async (requestId: string, adminNote?: string) => {
    const admin = await getCurrentUser();
    if (!AdminPolicy.canAccessAdmin(admin)) throw new Error("Unauthorized");

    // Fetch request before approval to get teacher_id, student_id, amount
    const request = await creditRequestRepo.getById(requestId);
    await teacherService.approveCreditRequest(requestId, admin!.id, adminNote);

    if (request) {
        // Notify teacher: request approved
        notificationService.notify(
            request.teacher_id,
            NOTIFICATION_TYPES.CREDIT_REQUEST_APPROVED,
            "Credit Request Approved",
            `Your request for ${request.amount} credits has been approved.`,
            {
                deepLink: "/teacher/credit-requests",
                entityId: requestId,
                entityType: NOTIFICATION_ENTITY_TYPES.CREDIT_REQUEST,
            }
        ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));

        // Notify student: credits received
        notificationService.notify(
            request.student_id,
            NOTIFICATION_TYPES.CREDITS_RECEIVED,
            "Credits Received",
            `You received ${request.amount} credits from your teacher.`,
            {
                deepLink: "/dashboard",
                entityType: NOTIFICATION_ENTITY_TYPES.CREDIT_TRANSACTION,
            }
        ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));
    }

    revalidatePath("/admin/credit-requests");
    revalidatePath("/teacher/credit-requests");
    logger.info("Admin approved credit request", { requestId });
});

export const rejectCreditRequest = traceAction("rejectCreditRequest", async (requestId: string, adminNote?: string) => {
    const admin = await getCurrentUser();
    if (!AdminPolicy.canAccessAdmin(admin)) throw new Error("Unauthorized");

    // Fetch request before rejection to get teacher_id
    const request = await creditRequestRepo.getById(requestId);
    await teacherService.rejectCreditRequest(requestId, admin!.id, adminNote);

    if (request) {
        // Notify teacher: request rejected
        notificationService.notify(
            request.teacher_id,
            NOTIFICATION_TYPES.CREDIT_REQUEST_REJECTED,
            "Credit Request Rejected",
            `Your request for ${request.amount} credits was rejected.${adminNote ? ` Note: ${adminNote}` : ""}`,
            {
                deepLink: "/teacher/credit-requests",
                entityId: requestId,
                entityType: NOTIFICATION_ENTITY_TYPES.CREDIT_REQUEST,
            }
        ).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));
    }

    revalidatePath("/admin/credit-requests");
    revalidatePath("/teacher/credit-requests");
    logger.info("Admin rejected credit request", { requestId });
});

// ── AI Cost Analytics ──

export async function getAICostAnalytics(days?: number) {
    await checkAdmin();
    return aiCostService.getCostAnalytics(days);
}

export async function getModelPricingList() {
    await checkAdmin();
    return aiCostService.getModelPricingList();
}

export const updateModelPricing = traceAction("updateModelPricing", async (id: string, data: { input_price_per_million?: number; output_price_per_million?: number; is_active?: boolean }) => {
    await checkAdmin();
    await aiCostService.updateModelPricing(id, data);
    revalidatePath("/admin/ai-costs");
    logger.info("Admin updated model pricing", { id, data });
});

export async function getRollingAICostSummaries() {
    await checkAdmin();
    return aiUsageRepo.getRollingSummaries();
}

// ── Activity Detail ──

export const getActivityDetail = traceAction("getActivityDetail", async (id: string): Promise<ActivityDetail | null> => {
    await checkAdmin();

    const transaction = await transactionRepo.getById(id);
    if (!transaction) return null;

    const user = transaction.user_id ? await userRepo.getById(transaction.user_id) : null;

    let aiUsage: AIUsageLog | null = null;
    if (transaction.feature_key && transaction.user_id) {
        aiUsage = await aiUsageRepo.findByCorrelation(
            transaction.user_id,
            transaction.feature_key,
            transaction.created_at,
            5,
            transaction.trace_id
        );
    }

    return {
        transaction,
        user: user ? {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: user.role,
            credits_balance: user.credits_balance,
            created_at: user.created_at,
        } : null,
        aiUsage,
    };
});
