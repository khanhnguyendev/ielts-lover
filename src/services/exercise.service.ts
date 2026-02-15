import { Exercise, ExerciseType } from "@/types";
import { IExerciseRepository } from "../repositories/interfaces";

export class ExerciseService {
    constructor(private exerciseRepo: IExerciseRepository) { }

    async getExercise(id: string): Promise<Exercise | null> {
        return this.exerciseRepo.getById(id);
    }

    async getLatestExercise(type: ExerciseType): Promise<Exercise | null> {
        return this.exerciseRepo.getLatestVersion(type);
    }

    async listExercises(type: ExerciseType): Promise<Exercise[]> {
        return this.exerciseRepo.listByType(type);
    }

    async createExerciseVersion(data: Omit<Exercise, "id" | "created_at" | "version">): Promise<Exercise> {
        const latest = await this.exerciseRepo.getLatestVersion(data.type);
        const newVersion = latest ? latest.version + 1 : 1;

        return this.exerciseRepo.createVersion({
            ...data,
            version: newVersion,
            is_published: true
        });
    }
}
