import { ILessonRepository } from "@/repositories/lesson.interface";
import { Lesson, LessonQuestion } from "@/types";

export class LessonService {
    constructor(private lessonRepo: ILessonRepository) { }

    async getLesson(id: string): Promise<Lesson | null> {
        return this.lessonRepo.getById(id);
    }

    async getAllLessons(): Promise<Lesson[]> {
        return this.lessonRepo.listAll();
    }

    async createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
        return this.lessonRepo.create(lesson);
    }

    async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
        return this.lessonRepo.update(id, lesson);
    }

    async deleteLesson(id: string): Promise<void> {
        return this.lessonRepo.delete(id);
    }

    // Questions
    async createQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>): Promise<LessonQuestion> {
        return this.lessonRepo.createQuestion(question);
    }

    async updateQuestion(id: string, question: Partial<LessonQuestion>): Promise<LessonQuestion> {
        return this.lessonRepo.updateQuestion(id, question);
    }

    async deleteQuestion(id: string): Promise<void> {
        return this.lessonRepo.deleteQuestion(id);
    }

    async getQuestions(lessonId: string): Promise<LessonQuestion[]> {
        return this.lessonRepo.getQuestionsByLessonId(lessonId);
    }
}
