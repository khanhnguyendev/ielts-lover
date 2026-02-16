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

const logger = new Logger("AdminActions");

const lessonRepo = new LessonRepository();
const lessonService = new LessonService(lessonRepo);

const exerciseRepo = new ExerciseRepository();
const exerciseService = new ExerciseService(exerciseRepo);
const aiService = new AIService();

async function checkAdmin() {
    const user = await getCurrentUser();
    if (!AdminPolicy.canAccessAdmin(user)) {
        throw new Error("Unauthorized");
    }
}

export async function createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>) {
    await checkAdmin();
    const result = await lessonService.createLesson(lesson);
    revalidatePath("/admin/lessons");
    revalidatePath("/dashboard/lessons");
    return result;
}

export async function updateLesson(id: string, lesson: Partial<Lesson>) {
    await checkAdmin();
    const result = await lessonService.updateLesson(id, lesson);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${id}`);
    revalidatePath("/dashboard/lessons");
    revalidatePath(`/dashboard/lessons/${id}`);
    return result;
}

export async function deleteLesson(id: string) {
    await checkAdmin();
    await lessonService.deleteLesson(id);
    revalidatePath("/admin/lessons");
    revalidatePath("/dashboard/lessons");
}

export async function createLessonQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>) {
    await checkAdmin();
    const result = await lessonService.createQuestion(question);
    revalidatePath(`/admin/lessons/${question.lesson_id}`);
    return result;
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
    await checkAdmin();
    // We use createExerciseVersion because it handles versioning automatically
    const result = await exerciseService.createExerciseVersion(exercise);
    revalidatePath("/admin/exercises");
    revalidatePath("/dashboard/writing");
    revalidatePath("/dashboard/speaking");
    return result;
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
                const { StorageService } = await import("@/services/storage.service");
                const imageUrl = await StorageService.upload(imageBuffer);

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
        const { StorageService } = await import("@/services/storage.service");
        const url = await StorageService.upload(file);
        return url;
    } catch (error) {
        logger.error("Image upload failed", { error });
        throw new Error("Failed to upload image");
    }
}
