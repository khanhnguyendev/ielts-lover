import { inngest } from "../client";
import { AttemptRepository } from "@/repositories/attempt.repository";
import { ExerciseRepository } from "@/repositories/exercise.repository";
import { UserRepository } from "@/repositories/user.repository";
import { AIService } from "@/services/ai.service";
import { AttemptService } from "@/services/attempt.service";
import { AICostService, RecordUsageParams } from "@/services/ai-cost.service";
import { AIUsageRepository } from "@/repositories/ai-usage.repository";
import { CreditService } from "@/services/credit.service";
import { FeaturePricingRepository } from "@/repositories/pricing.repository";
import { CreditTransactionRepository } from "@/repositories/transaction.repository";
import { SystemSettingsRepository } from "@/repositories/system-settings.repository";
import { NotificationService } from "@/services/notification.service";
import { NotificationRepository } from "@/repositories/notification.repository";
import { FEATURE_KEYS, NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } from "@/lib/constants";
import { traceService } from "@/lib/aop";

export const evaluateAttemptBackground = inngest.createFunction(
    {
        id: "evaluate-attempt",
        retries: 2,
        concurrency: [{ limit: 10 }],
    },
    { event: "attempt/evaluate" },
    async ({ event, step }) => {
        const { attemptId, userId, featureKey, traceId } = event.data;

        // Initialize services (each invocation is isolated)
        const attemptRepo = traceService(new AttemptRepository(), "AttemptRepository");
        const exerciseRepo = traceService(new ExerciseRepository(), "ExerciseRepository");
        const userRepo = traceService(new UserRepository(), "UserRepository");
        const aiService = traceService(new AIService(), "AIService");
        const attemptService = new AttemptService(attemptRepo, userRepo, exerciseRepo, aiService);

        // Step 1: Run AI evaluation
        const usage = await step.run("ai-evaluation", async () => {
            return attemptService.submitAttempt(attemptId, event.data.content);
        });

        // Step 2: Record AI cost (non-critical)
        await step.run("record-cost", async () => {
            if (!usage) return;
            const aiUsageRepo = new AIUsageRepository();
            const aiCostService = new AICostService(aiUsageRepo);
            const aiMethod = featureKey === FEATURE_KEYS.WRITING_EVALUATION ? "generateWritingReport" : "generateFeedback";
            await aiCostService.recordUsage({
                userId,
                featureKey,
                modelName: usage.modelName,
                promptTokens: usage.promptTokens,
                completionTokens: usage.completionTokens,
                aiMethod,
                creditsCharged: 1,
                traceId,
                durationMs: usage.durationMs,
            });
        });

        // Step 3: Send notification
        await step.run("notify-user", async () => {
            const exercise = await exerciseRepo.getById(event.data.exerciseId);
            const notificationRepo = new NotificationRepository();
            const notificationService = new NotificationService(notificationRepo);
            await notificationService.notify(
                userId,
                NOTIFICATION_TYPES.EVALUATION_COMPLETE,
                "Evaluation Ready",
                `Your ${exercise?.type?.startsWith("writing") ? "writing" : "speaking"} submission has been evaluated.`,
                {
                    deepLink: `/dashboard/reports/${attemptId}`,
                    entityId: attemptId,
                    entityType: NOTIFICATION_ENTITY_TYPES.ATTEMPT,
                }
            );
        });

        return { success: true, attemptId };
    }
);
