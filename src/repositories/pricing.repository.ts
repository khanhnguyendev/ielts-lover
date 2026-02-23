import { IFeaturePricingRepository, FeaturePricing } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const pricingCache: Map<string, { data: FeaturePricing; expiresAt: number }> = new Map();

export class FeaturePricingRepository implements IFeaturePricingRepository {
    async getByKey(key: string): Promise<FeaturePricing | null> {
        const cached = pricingCache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }

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

        const pricing = data as FeaturePricing;
        pricingCache.set(key, { data: pricing, expiresAt: Date.now() + CACHE_TTL_MS });
        return pricing;
    }

    async listAll(): Promise<FeaturePricing[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.FEATURE_PRICING)
            .select("*")
            .eq("is_active", true)
            .order("feature_key", { ascending: true });

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

        // Invalidate cache for this key
        pricingCache.delete(key);
    }
}
