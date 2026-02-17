import { ILessonRepository } from "@/repositories/lesson.interface";
import { Lesson, LessonQuestion } from "@/types";
import { Logger, withTrace } from "@/lib/logger";

const logger = new Logger("LessonService");

export class LessonService {
    constructor(private lessonRepo: ILessonRepository) { }

    async getLesson(id: string): Promise<Lesson | null> {
        return withTrace(async () => {
            try {
                return await this.lessonRepo.getById(id);
            } catch (error) {
                logger.error("Failed to get lesson", { error, id });
                throw error;
            }
        });
    }

    async getAllLessons(): Promise<Lesson[]> {
        return withTrace(async () => {
            try {
                return await this.lessonRepo.listAll();
            } catch (error) {
                logger.error("Failed to get all lessons", { error });
                throw error;
            }
        });
    }

    async createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
        return withTrace(async () => {
            try {
                const result = await this.lessonRepo.create(lesson);
                logger.info("Lesson created", { title: lesson.title, lessonId: result.id });
                return result;
            } catch (error) {
                logger.error("Failed to create lesson", { error, title: lesson.title });
                throw error;
            }
        });
    }

    async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
        return withTrace(async () => {
            try {
                const result = await this.lessonRepo.update(id, lesson);
                logger.info("Lesson updated", { id });
                return result;
            } catch (error) {
                logger.error("Failed to update lesson", { error, id });
                throw error;
            }
        });
    }

    async deleteLesson(id: string): Promise<void> {
        return withTrace(async () => {
            try {
                await this.lessonRepo.delete(id);
                logger.info("Lesson deleted", { id });
            } catch (error) {
                logger.error("Failed to delete lesson", { error, id });
                throw error;
            }
        });
    }

    // Questions
    async createQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>): Promise<LessonQuestion> {
        return withTrace(async () => {
            try {
                const result = await this.lessonRepo.createQuestion(question);
                logger.info("Lesson question created", { lessonId: question.lesson_id });
                return result;
            } catch (error) {
                logger.error("Failed to create question", { error, lessonId: question.lesson_id });
                throw error;
            }
        });
    }

    async updateQuestion(id: string, question: Partial<LessonQuestion>): Promise<LessonQuestion> {
        return withTrace(async () => {
            try {
                const result = await this.lessonRepo.updateQuestion(id, question);
                logger.info("Lesson question updated", { id });
                return result;
            } catch (error) {
                logger.error("Failed to update question", { error, id });
                throw error;
            }
        });
    }

    async deleteQuestion(id: string): Promise<void> {
        return withTrace(async () => {
            try {
                await this.lessonRepo.deleteQuestion(id);
                logger.info("Lesson question deleted", { id });
            } catch (error) {
                logger.error("Failed to delete question", { error, id });
                throw error;
            }
        });
    }

    async getQuestions(lessonId: string): Promise<LessonQuestion[]> {
        return withTrace(async () => {
            try {
                return await this.lessonRepo.getQuestionsByLessonId(lessonId);
            } catch (error) {
                logger.error("Failed to get questions", { error, lessonId });
                throw error;
            }
        });
    }
}
