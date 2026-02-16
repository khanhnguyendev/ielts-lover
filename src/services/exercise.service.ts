import { Exercise, ExerciseType } from "@/types";
import { IExerciseRepository } from "../repositories/interfaces";

import { Logger } from "@/lib/logger";

export class ExerciseService {
    private logger = new Logger("ExerciseService");

    constructor(private exerciseRepo: IExerciseRepository) { }

    async getExercise(id: string): Promise<Exercise | null> {
        this.logger.debug("getExercise", { id });
        return this.exerciseRepo.getById(id);
    }

    async getLatestExercise(type: ExerciseType): Promise<Exercise | null> {
        this.logger.debug("getLatestExercise", { type });
        return this.exerciseRepo.getLatestVersion(type);
    }

    async listExercises(type: ExerciseType): Promise<Exercise[]> {
        this.logger.debug("listExercises", { type });
        return this.exerciseRepo.listByType(type);
    }

    async createExerciseVersion(data: Omit<Exercise, "id" | "created_at" | "version">): Promise<Exercise> {
        this.logger.info("createExerciseVersion", { type: data.type, title: data.title });
        const latest = await this.exerciseRepo.getLatestVersion(data.type);
        const newVersion = latest ? latest.version + 1 : 1;

        return this.exerciseRepo.createVersion({
            ...data,
            version: newVersion,
            is_published: true
        });
    }
}
