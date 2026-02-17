import { IFeaturePricingRepository, FeaturePricing } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class FeaturePricingRepository implements IFeaturePricingRepository {
    async getByKey(key: string): Promise<FeaturePricing | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("feature_pricing")
            .select("*")
            .eq("feature_key", key)
            .single();

        if (error) return null;
        return data as FeaturePricing;
    }

    async listAll(): Promise<FeaturePricing[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("feature_pricing")
            .select("*")
            .eq("is_active", true);

        if (error) return [];
        return data as FeaturePricing[];
    }

    async updatePricing(key: string, cost: number): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("feature_pricing")
            .update({ cost_per_unit: cost, updated_at: new Date().toISOString() })
            .eq("feature_key", key);

        if (error) throw new Error(`[FeaturePricingRepository] Failed to update pricing: ${error.message}`);
    }
}
