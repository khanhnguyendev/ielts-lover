import { Attempt } from "@/types";
import { IAttemptRepository, IUserRepository, IExerciseRepository } from "../repositories/interfaces";
import { AIService, AIUsageMetadata } from "./ai.service";
import { ATTEMPT_STATES, EXERCISE_TYPES, APP_ERROR_CODES } from "@/lib/constants";

export class AttemptService {
    constructor(
        private attemptRepo: IAttemptRepository,
        private userRepo: IUserRepository,
        private exerciseRepo: IExerciseRepository,
        private aiService: AIService
    ) { }

    async startAttempt(userId: string, exerciseId: string): Promise<Attempt> {
        const exercise = await this.exerciseRepo.getById(exerciseId);
        if (!exercise) throw new Error("Exercise not found");

        return this.attemptRepo.create({
            user_id: userId,
            exercise_id: exerciseId,
            state: ATTEMPT_STATES.CREATED,
            content: ""
        });
    }

    async submitAttempt(id: string, content: string): Promise<AIUsageMetadata | undefined> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt) throw new Error("Attempt not found");
        if (attempt.state === ATTEMPT_STATES.EVALUATED) {
            return; // Idempotent: already done
        }

        if (attempt.state === ATTEMPT_STATES.SUBMITTED) {
            return this.evaluateAttempt(id);
        }

        if (attempt.state !== ATTEMPT_STATES.CREATED && attempt.state !== ATTEMPT_STATES.IN_PROGRESS) {
            throw new Error(`Invalid attempt state: ${attempt.state}`);
        }

        await this.attemptRepo.update(id, {
            content,
            state: ATTEMPT_STATES.SUBMITTED,
            submitted_at: new Date().toISOString()
        });

        return this.evaluateAttempt(id);
    }

    private async evaluateAttempt(id: string): Promise<AIUsageMetadata | undefined> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt || attempt.state !== ATTEMPT_STATES.SUBMITTED) return;

        const exercise = await this.exerciseRepo.getById(attempt.exercise_id);
        if (!exercise) throw new Error("Exercise not found for attempt");

        let feedback;
        let score;
        let usage: AIUsageMetadata;

        if (exercise.type === EXERCISE_TYPES.WRITING_TASK1 || exercise.type === EXERCISE_TYPES.WRITING_TASK2) {
            const result = await this.aiService.generateWritingReport(
                exercise.type as any,
                attempt.content,
                "v2",
                { prompt: exercise.prompt, chartData: exercise.chart_data }
            );
            feedback = JSON.stringify(result.data);
            score = result.data.overall_score;
            usage = result.usage;
        } else {
            const result = await this.aiService.generateFeedback(exercise.type, attempt.content);
            feedback = JSON.stringify(result.data);
            score = result.data.overall_band;
            usage = result.usage;
        }

        await this.attemptRepo.update(id, {
            state: ATTEMPT_STATES.EVALUATED,
            score,
            feedback,
            evaluated_at: new Date().toISOString()
        });

        return usage;
    }

    async updateAttempt(id: string, data: Partial<Attempt>): Promise<void> {
        await this.attemptRepo.update(id, data);
    }

    async reevaluate(id: string): Promise<{ success: boolean; reason?: string; usage?: AIUsageMetadata }> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt) throw new Error("Attempt not found");

        const usage = await this.evaluateAttempt(id);

        const updated = await this.attemptRepo.getById(id);
        if (updated?.state === ATTEMPT_STATES.EVALUATED) {
            return { success: true, usage };
        }

        return { success: false, reason: "EVALUATION_FAILED" };
    }

    async getAttempt(id: string): Promise<Attempt | null> {
        return this.attemptRepo.getById(id);
    }

    async getUserAttempts(userId: string): Promise<Attempt[]> {
        return this.attemptRepo.listByUserId(userId);
    }

    async unlockCorrection(id: string): Promise<{ data: any; usage?: AIUsageMetadata }> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt) throw new Error("Attempt not found");

        if (attempt.is_correction_unlocked && attempt.correction_data) {
            return { data: attempt.correction_data };
        }

        const result = await this.aiService.generateCorrection(attempt.content);

        await this.attemptRepo.update(id, {
            correction_data: JSON.stringify(result.data),
            is_correction_unlocked: true
        });

        return { data: result.data, usage: result.usage };
    }
}
