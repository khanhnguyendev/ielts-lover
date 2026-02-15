import { ILessonRepository } from "@/repositories/lesson.interface";
import { Lesson } from "@/types";

export class LessonService {
    constructor(private lessonRepo: ILessonRepository) { }

    async getLesson(id: string): Promise<Lesson | null> {
        return this.lessonRepo.getById(id);
    }

    async getAllLessons(): Promise<Lesson[]> {
        return this.lessonRepo.listAll();
    }
}
