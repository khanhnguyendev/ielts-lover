import { IFeaturePricingRepository, FeaturePricing } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

export class FeaturePricingRepository implements IFeaturePricingRepository {
    async getByKey(key: string): Promise<FeaturePricing | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.FEATURE_PRICING)
            .select("*")
            .eq("feature_key", key)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[FeaturePricingRepository] getByKey failed: ${error.message}`);
        }
        return data as FeaturePricing;
    }

    async listAll(): Promise<FeaturePricing[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.FEATURE_PRICING)
            .select("*")
            .eq("is_active", true);

        if (error) throw new Error(`[FeaturePricingRepository] listAll failed: ${error.message}`);
        return data as FeaturePricing[];
    }

    async updatePricing(key: string, cost: number): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.FEATURE_PRICING)
            .update({ cost_per_unit: cost, updated_at: new Date().toISOString() })
            .eq("feature_key", key);

        if (error) throw new Error(`[FeaturePricingRepository] Failed to update pricing: ${error.message}`);
    }
}
