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

        // Business Rule: Check daily limits before AI evaluation
        const user = await this.userRepo.getById(attempt.user_id);
        if (!user) throw new Error("User not found");

        const feature = exercise.type.startsWith('writing') ? "writing_evaluation" : "speaking_evaluation";

        // Use a dynamic import or static service for policy if possible, 
        // but for now we follow existing patterns
        const { SubscriptionPolicy } = await import("./subscription.policy");

        if (!SubscriptionPolicy.canAccessFeature(user, feature)) {
            console.log(`[AttemptService] Daily limit reached for user ${user.id}. Skipping evaluation.`);
            return;
        }

        // UI Requirement: Use generateWritingReport for detailed reports if it's a writing task
        let feedback;
        let score;

        if (exercise.type === "writing_task1" || exercise.type === "writing_task2") {
            const report = await this.aiService.generateWritingReport(exercise.type as any, attempt.content);
            feedback = JSON.stringify(report);
            score = report.bandScore;
        } else {
            // Fallback for speaking or other types
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

        // Increment user quota
        await this.userRepo.incrementQuota(attempt.user_id);
    }

    async reevaluate(id: string): Promise<{ success: boolean; reason?: string }> {
        const attempt = await this.attemptRepo.getById(id);
        if (!attempt) throw new Error("Attempt not found");

        const user = await this.userRepo.getById(attempt.user_id);
        if (!user) throw new Error("User not found");

        const exercise = await this.exerciseRepo.getById(attempt.exercise_id);
        if (!exercise) throw new Error("Exercise not found");

        const feature = exercise.type.startsWith('writing') ? "writing_evaluation" : "speaking_evaluation";
        const { SubscriptionPolicy } = await import("./subscription.policy");

        if (!SubscriptionPolicy.canAccessFeature(user, feature)) {
            return { success: false, reason: "DAILY_LIMIT_REACHED" };
        }

        await this.evaluateAttempt(id);

        const updated = await this.attemptRepo.getById(id);
        if (updated?.state === "EVALUATED") {
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
