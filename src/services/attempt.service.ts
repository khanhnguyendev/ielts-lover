import { Attempt } from "@/types";
import { IAttemptRepository, IUserRepository, IExerciseRepository } from "../repositories/interfaces";
import { AIService } from "./ai.service";
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

    async submitAttempt(id: string, content: string): Promise<void> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt) throw new Error("Attempt not found");
        if (attempt.state === ATTEMPT_STATES.EVALUATED) {
            return; // Idempotent: already done
        }

        if (attempt.state === ATTEMPT_STATES.SUBMITTED) {
            // Already submitted, maybe just trigger evaluation again if it's stuck
            await this.evaluateAttempt(id);
            return;
        }

        if (attempt.state !== ATTEMPT_STATES.CREATED && attempt.state !== ATTEMPT_STATES.IN_PROGRESS) {
            throw new Error(`Invalid attempt state: ${attempt.state}`);
        }

        await this.attemptRepo.update(id, {
            content,
            state: ATTEMPT_STATES.SUBMITTED,
            submitted_at: new Date().toISOString()
        });

        // Trigger evaluation
        await this.evaluateAttempt(id);
    }

    private async evaluateAttempt(id: string): Promise<void> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt || attempt.state !== ATTEMPT_STATES.SUBMITTED) return;

        const exercise = await this.exerciseRepo.getById(attempt.exercise_id);
        if (!exercise) throw new Error("Exercise not found for attempt");

        let feedback;
        let score;

        if (exercise.type === EXERCISE_TYPES.WRITING_TASK1 || exercise.type === EXERCISE_TYPES.WRITING_TASK2) {
            const report = await this.aiService.generateWritingReport(exercise.type as any, attempt.content);
            feedback = JSON.stringify(report);
            score = report.overall_score;
        } else {
            const simpleFeedback = await this.aiService.generateFeedback(exercise.type, attempt.content);
            feedback = JSON.stringify(simpleFeedback);
            score = simpleFeedback.overall_band;
        }

        await this.attemptRepo.update(id, {
            state: ATTEMPT_STATES.EVALUATED,
            score,
            feedback,
            evaluated_at: new Date().toISOString()
        });
    }

    async updateAttempt(id: string, data: Partial<Attempt>): Promise<void> {
        await this.attemptRepo.update(id, data);
    }

    async reevaluate(id: string): Promise<{ success: boolean; reason?: string }> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt) throw new Error("Attempt not found");

        await this.evaluateAttempt(id);

        const updated = await this.attemptRepo.getById(id);
        if (updated?.state === ATTEMPT_STATES.EVALUATED) {
            return { success: true };
        }

        return { success: false, reason: "EVALUATION_FAILED" };
    }

    async getAttempt(id: string): Promise<Attempt | null> {
        return this.attemptRepo.getById(id);
    }

    async getUserAttempts(userId: string): Promise<Attempt[]> {
        return this.attemptRepo.listByUserId(userId);
    }
}
