import { Lesson, LessonQuestion } from "@/types";

export interface ILessonRepository {
    getById(id: string): Promise<Lesson | null>;
    listAll(): Promise<Lesson[]>;
    create(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson>;
    update(id: string, lesson: Partial<Lesson>): Promise<Lesson>;
    delete(id: string): Promise<void>;

    // Questions
    createQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>): Promise<LessonQuestion>;
    updateQuestion(id: string, question: Partial<LessonQuestion>): Promise<LessonQuestion>;
    deleteQuestion(id: string): Promise<void>;
    getQuestionsByLessonId(lessonId: string): Promise<LessonQuestion[]>;
}
