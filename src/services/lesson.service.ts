import { ILessonRepository } from "@/repositories/lesson.interface";
import { Lesson, LessonQuestion } from "@/types";

export class LessonService {
    constructor(private lessonRepo: ILessonRepository) { }

    async getLesson(id: string): Promise<Lesson | null> {
        return await this.lessonRepo.getById(id);
    }

    async getAllLessons(): Promise<Lesson[]> {
        return await this.lessonRepo.listAll();
    }

    async createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
        return await this.lessonRepo.create(lesson);
    }

    async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
        return await this.lessonRepo.update(id, lesson);
    }

    async deleteLesson(id: string): Promise<void> {
        await this.lessonRepo.delete(id);
    }

    // Questions
    async createQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>): Promise<LessonQuestion> {
        return await this.lessonRepo.createQuestion(question);
    }

    async updateQuestion(id: string, question: Partial<LessonQuestion>): Promise<LessonQuestion> {
        return await this.lessonRepo.updateQuestion(id, question);
    }

    async deleteQuestion(id: string): Promise<void> {
        await this.lessonRepo.deleteQuestion(id);
    }

    async getQuestions(lessonId: string): Promise<LessonQuestion[]> {
        return await this.lessonRepo.getQuestionsByLessonId(lessonId);
    }
}
