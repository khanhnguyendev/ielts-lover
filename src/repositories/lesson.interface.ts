import { Lesson } from "@/types";

export interface ILessonRepository {
    getById(id: string): Promise<Lesson | null>;
    listAll(): Promise<Lesson[]>;
}
