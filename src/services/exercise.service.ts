import { Exercise, ExerciseType } from "@/types";
import { IExerciseRepository } from "../repositories/interfaces";
import { Logger, withTrace } from "@/lib/logger";

const logger = new Logger("ExerciseService");

export class ExerciseService {
    constructor(private exerciseRepo: IExerciseRepository) { }

    async getExercise(id: string): Promise<Exercise | null> {
        return withTrace(async () => {
            try {
                return await this.exerciseRepo.getById(id);
            } catch (error) {
                logger.error("Failed to get exercise", { error, id });
                throw error;
            }
        });
    }

    async getLatestExercise(type: ExerciseType): Promise<Exercise | null> {
        return withTrace(async () => {
            try {
                return await this.exerciseRepo.getLatestVersion(type);
            } catch (error) {
                logger.error("Failed to get latest exercise", { error, type });
                throw error;
            }
        });
    }

    async listExercises(type: ExerciseType): Promise<Exercise[]> {
        return withTrace(async () => {
            try {
                return await this.exerciseRepo.listByType(type);
            } catch (error) {
                logger.error("Failed to list exercises", { error, type });
                throw error;
            }
        });
    }

    async createExerciseVersion(data: Omit<Exercise, "id" | "created_at" | "version">): Promise<Exercise> {
        return withTrace(async () => {
            try {
                const latest = await this.exerciseRepo.getLatestVersion(data.type);
                const newVersion = latest ? latest.version + 1 : 1;

                const result = await this.exerciseRepo.createVersion({
                    ...data,
                    version: newVersion,
                    is_published: true
                });

                logger.info("Exercise version created", { type: data.type, title: data.title, version: newVersion });
                return result;
            } catch (error) {
                logger.error("Failed to create exercise version", { error, data });
                throw error;
            }
        });
    }
}
