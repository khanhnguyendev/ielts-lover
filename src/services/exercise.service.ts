import { Exercise, ExerciseType } from "@/types";
import { IExerciseRepository } from "../repositories/interfaces";

export class ExerciseService {
    constructor(private exerciseRepo: IExerciseRepository) { }

    async getExercise(id: string): Promise<Exercise | null> {
        return await this.exerciseRepo.getById(id);
    }

    async getLatestExercise(type: ExerciseType): Promise<Exercise | null> {
        return await this.exerciseRepo.getLatestVersion(type);
    }

    async listExercises(type: ExerciseType): Promise<Exercise[]> {
        return await this.exerciseRepo.listByType(type);
    }

    async createExerciseVersion(
        data: Omit<Exercise, "id" | "created_at" | "version">,
        sourceExerciseId?: string
    ): Promise<Exercise> {
        let newVersion = 1;
        if (sourceExerciseId) {
            const source = await this.exerciseRepo.getById(sourceExerciseId);
            newVersion = source ? source.version + 1 : 1;
        }

        const result = await this.exerciseRepo.createVersion({
            ...data,
            version: newVersion,
            is_published: true
        });

        return result;
    }

    async deleteExercise(id: string): Promise<void> {
        await this.exerciseRepo.delete(id);
    }
}
