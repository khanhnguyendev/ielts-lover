import { WritingExercise, ExerciseType } from "@/types";
import { IWritingExerciseRepository } from "../repositories/interfaces";

export class WritingExerciseService {
    constructor(private writingExerciseRepo: IWritingExerciseRepository) { }

    async getExercise(id: string): Promise<WritingExercise | null> {
        return await this.writingExerciseRepo.getById(id);
    }

    async getLatestExercise(type: ExerciseType): Promise<WritingExercise | null> {
        return await this.writingExerciseRepo.getLatestVersion(type);
    }

    async listExercises(type: ExerciseType): Promise<WritingExercise[]> {
        return await this.writingExerciseRepo.listByType(type);
    }

    async listExercisesPaginated(type: ExerciseType, limit: number, offset: number): Promise<{ data: WritingExercise[]; total: number }> {
        return await this.writingExerciseRepo.listByTypePaginated(type, limit, offset);
    }

    async createExerciseVersion(
        data: Omit<WritingExercise, "id" | "created_at" | "version">,
        sourceExerciseId?: string
    ): Promise<WritingExercise> {
        let newVersion = 1;
        if (sourceExerciseId) {
            const source = await this.writingExerciseRepo.getById(sourceExerciseId);
            newVersion = source ? source.version + 1 : 1;
        }

        const result = await this.writingExerciseRepo.createVersion({
            ...data,
            version: newVersion,
            is_published: true
        });

        return result;
    }

    async deleteExercise(id: string): Promise<void> {
        await this.writingExerciseRepo.delete(id);
    }
}
