import { Attempt, AttemptState } from "@/types";
import { IAttemptRepository, IUserRepository, IExerciseRepository } from "../repositories/interfaces";
import { AIService } from "./ai.service";

export class AttemptService {
    constructor(
        private attemptRepo: IAttemptRepository,
        private userRepo: IUserRepository,
        private exerciseRepo: IExerciseRepository,
        private aiService: AIService
    ) { }

    async startAttempt(userId: string, exerciseId: string): Promise<Attempt> {
        // Business Rule: User must exist (implicit check via subscription policy later)
        const exercise = await this.exerciseRepo.getById(exerciseId);
        if (!exercise) throw new Error("Exercise not found");

        return this.attemptRepo.create({
            user_id: userId,
            exercise_id: exerciseId,
            state: "CREATED",
            content: ""
        });
    }

    async submitAttempt(id: string, content: string): Promise<void> {
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

        // Trigger evaluation (could be async in background, but keeping it simple for now)
        await this.evaluateAttempt(id);
    }

    private async evaluateAttempt(id: string): Promise<void> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt || attempt.state !== "SUBMITTED") return;

        const exercise = await this.exerciseRepo.getById(attempt.exercise_id);
        if (!exercise) throw new Error("Exercise not found for attempt");

        // AI Orchestration
        const feedback = await this.aiService.generateFeedback(exercise.type, attempt.content);

        await this.attemptRepo.update(id, {
            state: "EVALUATED",
            score: feedback.overall_band,
            feedback: JSON.stringify(feedback),
            evaluated_at: new Date().toISOString()
        });

        // Increment user quota
        await this.userRepo.incrementQuota(attempt.user_id);
    }

    async getAttempt(id: string): Promise<Attempt | null> {
        return this.attemptRepo.getById(id);
    }

    async getUserAttempts(userId: string): Promise<Attempt[]> {
        return this.attemptRepo.listByUserId(userId);
    }
}
