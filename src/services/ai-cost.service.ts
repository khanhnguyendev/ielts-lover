import { IAIUsageRepository, AIUsageLog, AIModelPricing } from "@/repositories/interfaces";

export interface RecordUsageParams {
    userId: string | null;
    featureKey: string;
    modelName: string;
    promptTokens: number;
    completionTokens: number;
    aiMethod: string;
    creditsCharged: number;
    durationMs?: number;
}

export class AICostService {
    constructor(private aiUsageRepo: IAIUsageRepository) {}

    async recordUsage(params: RecordUsageParams): Promise<AIUsageLog> {
        const pricing = await this.aiUsageRepo.getModelPricing(params.modelName);

        const inputCostUsd = pricing
            ? (params.promptTokens / 1_000_000) * Number(pricing.input_price_per_million)
            : 0;
        const outputCostUsd = pricing
            ? (params.completionTokens / 1_000_000) * Number(pricing.output_price_per_million)
            : 0;

        return this.aiUsageRepo.logUsage({
            user_id: params.userId,
            feature_key: params.featureKey,
            model_name: params.modelName,
            prompt_tokens: params.promptTokens,
            completion_tokens: params.completionTokens,
            total_tokens: params.promptTokens + params.completionTokens,
            input_cost_usd: inputCostUsd,
            output_cost_usd: outputCostUsd,
            total_cost_usd: inputCostUsd + outputCostUsd,
            credits_charged: params.creditsCharged,
            ai_method: params.aiMethod,
            duration_ms: params.durationMs,
        });
    }

    async getCostAnalytics(days: number = 30) {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const [summary, byFeature, dailyTrend] = await Promise.all([
            this.aiUsageRepo.getCostSummary(startDate, endDate),
            this.aiUsageRepo.getCostByFeature(startDate, endDate),
            this.aiUsageRepo.getDailyTrend(startDate, endDate),
        ]);

        const costPerCredit = summary.total_credits_charged > 0
            ? summary.total_cost_usd / summary.total_credits_charged
            : 0;

        return {
            summary: {
                ...summary,
                cost_per_credit: costPerCredit,
            },
            byFeature,
            dailyTrend,
        };
    }

    async getModelPricingList(): Promise<AIModelPricing[]> {
        return this.aiUsageRepo.listModelPricing();
    }

    async updateModelPricing(id: string, data: Partial<Pick<AIModelPricing, "input_price_per_million" | "output_price_per_million" | "is_active">>): Promise<void> {
        return this.aiUsageRepo.updateModelPricing(id, data);
    }
}
