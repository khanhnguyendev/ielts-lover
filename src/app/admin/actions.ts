"use server";

import { LessonRepository } from "@/repositories/lesson.repository";
import { LessonService } from "@/services/lesson.service";
import { getCurrentUser } from "@/app/actions";
import { AdminPolicy } from "@/services/admin.policy";
import { Lesson, LessonQuestion } from "@/types";
import { revalidatePath } from "next/cache";

const lessonRepo = new LessonRepository();
const lessonService = new LessonService(lessonRepo);

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
