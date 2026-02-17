import { Attempt, AttemptState } from "@/types";
import { IAttemptRepository, IUserRepository, IExerciseRepository } from "../repositories/interfaces";
import { AIService } from "./ai.service";
import { Logger, withTrace } from "@/lib/logger";

const logger = new Logger("AttemptService");

export class AttemptService {
    constructor(
        private attemptRepo: IAttemptRepository,
        private userRepo: IUserRepository,
        private exerciseRepo: IExerciseRepository,
        private aiService: AIService
    ) { }

    async startAttempt(userId: string, exerciseId: string): Promise<Attempt> {
        return withTrace(async () => {
            try {
                const exercise = await this.exerciseRepo.getById(exerciseId);
                if (!exercise) throw new Error("Exercise not found");

                const attempt = await this.attemptRepo.create({
                    user_id: userId,
                    exercise_id: exerciseId,
                    state: "CREATED",
                    content: ""
                });

                logger.info("Attempt started", { attemptId: attempt.id, userId, exerciseId });
                return attempt;
            } catch (error) {
                logger.error("Failed to start attempt", { error, userId, exerciseId });
                throw error;
            }
        });
    }

    async submitAttempt(id: string, content: string): Promise<void> {
        return withTrace(async () => {
            try {
                const attempt = await this.attemptRepo.getById(id);
                if (!attempt) throw new Error("Attempt not found");
                if (attempt.state !== "CREATED" && attempt.state !== "IN_PROGRESS") {
                    throw new Error(`Invalid attempt state: ${attempt.state}`);
                }

                await this.attemptRepo.update(id, {
                    content,
                    state: "SUBMITTED",
                    submitted_at: new Date().toISOString()
                });

                logger.info("Attempt submitted", { attemptId: id, contentLength: content.length });

                // Trigger evaluation
                await this.evaluateAttempt(id);
            } catch (error) {
                logger.error("Failed to submit attempt", { error, attemptId: id });
                throw error;
            }
        });
    }

    private async evaluateAttempt(id: string): Promise<void> {
        try {
            const attempt = await this.attemptRepo.getById(id);
            if (!attempt || attempt.state !== "SUBMITTED") return;

            const exercise = await this.exerciseRepo.getById(attempt.exercise_id);
            if (!exercise) throw new Error("Exercise not found for attempt");

            let feedback;
            let score;

            if (exercise.type === "writing_task1" || exercise.type === "writing_task2") {
                const report = await this.aiService.generateWritingReport(exercise.type as any, attempt.content);
                feedback = JSON.stringify(report);
                score = report.bandScore;
            } else {
                const simpleFeedback = await this.aiService.generateFeedback(exercise.type, attempt.content);
                feedback = JSON.stringify(simpleFeedback);
                score = simpleFeedback.overall_band;
            }

            await this.attemptRepo.update(id, {
                state: "EVALUATED",
                score,
                feedback,
                evaluated_at: new Date().toISOString()
            });

            logger.info("Attempt evaluated", { attemptId: id, score });
        } catch (error) {
            logger.error("Evaluation failed", { error, attemptId: id });
            throw error;
        }
    }

    async updateAttempt(id: string, data: Partial<Attempt>): Promise<void> {
        return withTrace(async () => {
            try {
                await this.attemptRepo.update(id, data);
            } catch (error) {
                logger.error("Failed to update attempt", { error, attemptId: id, data });
                throw error;
            }
        });
    }

    async reevaluate(id: string): Promise<{ success: boolean; reason?: string }> {
        return withTrace(async () => {
            try {
                const attempt = await this.attemptRepo.getById(id);
                if (!attempt) throw new Error("Attempt not found");

                await this.evaluateAttempt(id);

                const updated = await this.attemptRepo.getById(id);
                if (updated?.state === "EVALUATED") {
                    logger.info("Attempt re-evaluated successfully", { attemptId: id });
                    return { success: true };
                }

                return { success: false, reason: "EVALUATION_FAILED" };
            } catch (error) {
                logger.error("Re-evaluation failed", { error, attemptId: id });
                throw error;
            }
        });
    }

    async getAttempt(id: string): Promise<Attempt | null> {
        return this.attemptRepo.getById(id);
    }

    async getUserAttempts(userId: string): Promise<Attempt[]> {
        return this.attemptRepo.listByUserId(userId);
    }
}
