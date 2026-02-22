import { IAIUsageRepository, AIUsageLog, AIModelPricing } from "./interfaces";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES } from "@/lib/constants";

export class AIUsageRepository implements IAIUsageRepository {
    async logUsage(data: Omit<AIUsageLog, "id" | "created_at">): Promise<AIUsageLog> {
        const supabase = await createServiceSupabaseClient();
        const { data: row, error } = await supabase
            .from(DB_TABLES.AI_USAGE_LOGS)
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(`[AIUsageRepository] logUsage failed: ${error.message}`);
        return row as AIUsageLog;
    }

    async findByCorrelation(
        userId: string,
        featureKey: string,
        timestamp: string,
        windowSeconds: number = 5,
        traceId?: string
    ): Promise<AIUsageLog | null> {
        const supabase = await createServiceSupabaseClient();
        let query = supabase
            .from(DB_TABLES.AI_USAGE_LOGS)
            .select("*")
            .eq("user_id", userId)
            .eq("feature_key", featureKey);

        if (traceId) {
            // First try exact trace_id match
            const { data: traceData, error: traceError } = await query
                .eq("trace_id", traceId)
                .maybeSingle();

            if (!traceError && traceData) return traceData as AIUsageLog;
            // If traceId provided but not found, we might still want to try time-window fallback 
            // OR we could be strict. Plan says "prioritize trace_id lookup".
        }

        const ts = new Date(timestamp);
        const lowerBound = new Date(ts.getTime() - windowSeconds * 1000).toISOString();
        const upperBound = new Date(ts.getTime() + windowSeconds * 1000).toISOString();

        const { data, error } = await supabase
            .from(DB_TABLES.AI_USAGE_LOGS)
            .select("*")
            .eq("user_id", userId)
            .eq("feature_key", featureKey)
            .gte("created_at", lowerBound)
            .lte("created_at", upperBound)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(`[AIUsageRepository] findByCorrelation failed: ${error.message}`);
        return data as AIUsageLog | null;
    }

    async getModelPricing(modelName: string): Promise<AIModelPricing | null> {
        const supabase = await createServiceSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.AI_MODEL_PRICING)
            .select("*")
            .eq("model_name", modelName)
            .eq("is_active", true)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(`[AIUsageRepository] getModelPricing failed: ${error.message}`);
        }
        return data as AIModelPricing;
    }

    async listModelPricing(): Promise<AIModelPricing[]> {
        const supabase = await createServiceSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.AI_MODEL_PRICING)
            .select("*")
            .order("model_name", { ascending: true });

        if (error) throw new Error(`[AIUsageRepository] listModelPricing failed: ${error.message}`);
        return data as AIModelPricing[];
    }

    async updateModelPricing(id: string, updates: Partial<Pick<AIModelPricing, "input_price_per_million" | "output_price_per_million" | "is_active">>): Promise<void> {
        const supabase = await createServiceSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.AI_MODEL_PRICING)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) throw new Error(`[AIUsageRepository] updateModelPricing failed: ${error.message}`);
    }

    async getCostSummary(startDate: string, endDate: string): Promise<{ total_cost_usd: number; total_calls: number; total_tokens: number; total_credits_charged: number }> {
        const supabase = await createServiceSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.AI_USAGE_LOGS)
            .select("total_cost_usd, total_tokens, credits_charged")
            .gte("created_at", startDate)
            .lte("created_at", endDate);

        if (error) throw new Error(`[AIUsageRepository] getCostSummary failed: ${error.message}`);

        const rows = data || [];
        return {
            total_cost_usd: rows.reduce((sum, r) => sum + Number(r.total_cost_usd), 0),
            total_calls: rows.length,
            total_tokens: rows.reduce((sum, r) => sum + Number(r.total_tokens), 0),
            total_credits_charged: rows.reduce((sum, r) => sum + Number(r.credits_charged), 0),
        };
    }

    async getCostByFeature(startDate: string, endDate: string): Promise<{ feature_key: string; call_count: number; avg_tokens: number; total_cost_usd: number; total_credits_charged: number }[]> {
        const supabase = await createServiceSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.AI_USAGE_LOGS)
            .select("feature_key, total_cost_usd, total_tokens, credits_charged")
            .gte("created_at", startDate)
            .lte("created_at", endDate);

        if (error) throw new Error(`[AIUsageRepository] getCostByFeature failed: ${error.message}`);

        const grouped = (data || []).reduce((acc, row) => {
            const key = row.feature_key;
            if (!acc[key]) acc[key] = { feature_key: key, call_count: 0, total_tokens: 0, total_cost_usd: 0, total_credits_charged: 0 };
            acc[key].call_count++;
            acc[key].total_tokens += Number(row.total_tokens);
            acc[key].total_cost_usd += Number(row.total_cost_usd);
            acc[key].total_credits_charged += Number(row.credits_charged);
            return acc;
        }, {} as Record<string, { feature_key: string; call_count: number; total_tokens: number; total_cost_usd: number; total_credits_charged: number }>);

        return Object.values(grouped).map(g => ({
            ...g,
            avg_tokens: g.call_count > 0 ? Math.round(g.total_tokens / g.call_count) : 0,
        }));
    }

    async getDailyTrend(startDate: string, endDate: string): Promise<{ day: string; total_cost_usd: number; call_count: number }[]> {
        const supabase = await createServiceSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.AI_USAGE_LOGS)
            .select("created_at, total_cost_usd")
            .gte("created_at", startDate)
            .lte("created_at", endDate)
            .order("created_at", { ascending: true });

        if (error) throw new Error(`[AIUsageRepository] getDailyTrend failed: ${error.message}`);

        const grouped = (data || []).reduce((acc, row) => {
            const day = new Date(row.created_at).toISOString().split("T")[0];
            if (!acc[day]) acc[day] = { day, total_cost_usd: 0, call_count: 0 };
            acc[day].total_cost_usd += Number(row.total_cost_usd);
            acc[day].call_count++;
            return acc;
        }, {} as Record<string, { day: string; total_cost_usd: number; call_count: number }>);

        return Object.values(grouped);
    }

    async getRollingSummaries(): Promise<{ last7Days: any; last30Days: any }> {
        const supabase = await createServiceSupabaseClient();

        const [res7, res30] = await Promise.all([
            supabase.from(DB_TABLES.AI_COST_SUMMARY_7_DAYS).select("*").single(),
            supabase.from(DB_TABLES.AI_COST_SUMMARY_30_DAYS).select("*").single()
        ]);

        if (res7.error) throw new Error(`[AIUsageRepository] Failed to fetch 7-day summary: ${res7.error.message}`);
        if (res30.error) throw new Error(`[AIUsageRepository] Failed to fetch 30-day summary: ${res30.error.message}`);

        return {
            last7Days: res7.data,
            last30Days: res30.data
        };
    }
}
