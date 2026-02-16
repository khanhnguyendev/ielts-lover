import { ILessonRepository } from "@/repositories/lesson.interface";
import { Lesson, LessonQuestion } from "@/types";

import { Logger } from "@/lib/logger";

export class LessonService {
    private logger = new Logger("LessonService");

    constructor(private lessonRepo: ILessonRepository) { }

    async getLesson(id: string): Promise<Lesson | null> {
        this.logger.debug("getLesson", { id });
        return this.lessonRepo.getById(id);
    }

    async getAllLessons(): Promise<Lesson[]> {
        this.logger.debug("getAllLessons");
        return this.lessonRepo.listAll();
    }

    async createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
        this.logger.info("createLesson", { title: lesson.title });
        return this.lessonRepo.create(lesson);
    }

    async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
        this.logger.info("updateLesson", { id });
        return this.lessonRepo.update(id, lesson);
    }

    async deleteLesson(id: string): Promise<void> {
        this.logger.info("deleteLesson", { id });
        return this.lessonRepo.delete(id);
    }

    // Questions
    async createQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>): Promise<LessonQuestion> {
        this.logger.info("createQuestion", { lessonId: question.lesson_id });
        return this.lessonRepo.createQuestion(question);
    }

    async updateQuestion(id: string, question: Partial<LessonQuestion>): Promise<LessonQuestion> {
        this.logger.info("updateQuestion", { id });
        return this.lessonRepo.updateQuestion(id, question);
    }

    async deleteQuestion(id: string): Promise<void> {
        this.logger.info("deleteQuestion", { id });
        return this.lessonRepo.deleteQuestion(id);
    }

    async getQuestions(lessonId: string): Promise<LessonQuestion[]> {
        this.logger.debug("getQuestions", { lessonId });
        return this.lessonRepo.getQuestionsByLessonId(lessonId);
    }
}
