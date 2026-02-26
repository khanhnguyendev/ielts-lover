import { FEATURE_KEYS, SkillType } from "@/lib/constants";
import { NOTIFY_MSGS } from "@/lib/constants/messages";
import { IMistakeRepository, IActionPlanRepository, UserMistake, UserActionPlan } from "@/repositories/interfaces";
import { CreditService } from "./credit.service";
import { AIService, AIUsageMetadata } from "./ai.service";

/**
 * Improvement Service: Orchestrates the Mistake Bank and AI Weakness Analysis.
 * 
 * - getMistakeDashboard: Fetches mistakes + stats + latest plan
 * - generateAIActionPlan: Bills user, fetches mistakes, calls AI, stores plan
 */
export class ImprovementService {
    constructor(
        private mistakeRepo: IMistakeRepository,
        private actionPlanRepo: IActionPlanRepository,
        private creditService: CreditService,
        private aiService: AIService
    ) { }

    /**
     * Fetches the full dashboard data for the improvement page.
     */
    async getMistakeDashboard(userId: string, skillFilter?: SkillType) {
        const [mistakes, totalCount, latestPlan] = await Promise.all([
            this.mistakeRepo.getUserMistakes(userId, skillFilter, 100),
            this.mistakeRepo.getMistakeCount(userId),
            this.actionPlanRepo.getLatest(userId),
        ]);

        // Compute category breakdown
        const categoryStats = mistakes.reduce((acc, m) => {
            acc[m.error_category] = (acc[m.error_category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            mistakes,
            totalCount,
            categoryStats,
            latestPlan,
        };
    }

    /**
     * Generates a personalized AI action plan.
     * 1. Bills the user for the analysis
     * 2. Fetches last 50 mistakes
     * 3. Calls AI to find patterns
     * 4. Stores result
     */
    async generateAIActionPlan(userId: string, traceId?: string): Promise<{ plan: UserActionPlan; usage?: AIUsageMetadata }> {
        // 1. Bill user (throws InsufficientFundsError if not enough credits)
        await this.creditService.billUser(userId, FEATURE_KEYS.WEAKNESS_ANALYSIS, undefined, traceId);

        // 2. Fetch recent mistakes for analysis
        const mistakes = await this.mistakeRepo.getUserMistakes(userId, undefined, 50);

        if (mistakes.length === 0) {
            throw new Error("No mistakes found. Complete some exercises first to build your mistake bank.");
        }

        // 3. Call AI for weakness analysis
        const result = await this.aiService.analyzeWeaknesses(mistakes);

        // 4. Store the plan
        const plan = await this.actionPlanRepo.save({
            user_id: userId,
            plan_data: result.data,
            mistakes_analyzed: mistakes.length,
        });

        // 5. Notify user that weakness analysis is ready
        try {
            const { notificationService } = await import("@/lib/notification-client");
            const { NOTIFICATION_TYPES, NOTIFICATION_ENTITY_TYPES } = await import("@/lib/constants");

            await notificationService.notify(
                userId,
                NOTIFICATION_TYPES.EVALUATION_COMPLETE,
                NOTIFY_MSGS.SUCCESS.ANALYSIS_READY.title,
                NOTIFY_MSGS.SUCCESS.ANALYSIS_READY.description(mistakes.length),
                {
                    deepLink: `/dashboard/improvement`,
                    entityType: NOTIFICATION_ENTITY_TYPES.USER,
                    entityId: userId,
                }
            );
        } catch (err) {
            console.error("[ImprovementService] Failed to send analysis notification:", err);
        }

        return { plan, usage: result.usage };
    }
}
