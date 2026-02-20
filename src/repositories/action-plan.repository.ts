import { IActionPlanRepository, UserActionPlan } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES } from "@/lib/constants";

export class ActionPlanRepository implements IActionPlanRepository {
    async save(plan: Omit<UserActionPlan, 'id' | 'created_at'>): Promise<UserActionPlan> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.USER_ACTION_PLANS)
            .insert(plan)
            .select("*")
            .single();

        if (error) throw new Error(`[ActionPlanRepository] save failed: ${error.message}`);
        return data as UserActionPlan;
    }

    async getLatest(userId: string): Promise<UserActionPlan | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.USER_ACTION_PLANS)
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(`[ActionPlanRepository] getLatest failed: ${error.message}`);
        return data as UserActionPlan | null;
    }
}
