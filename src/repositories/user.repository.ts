import { UserProfile } from "@/types";
import { IUserRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class UserRepository implements IUserRepository {
    async getById(id: string): Promise<UserProfile | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data as UserProfile;
    }

    async update(id: string, data: Partial<UserProfile>): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("user_profiles")
            .update(data)
            .eq("id", id);

        if (error) throw new Error(`Failed to update user: ${error.message}`);
    }

    async incrementQuota(id: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc("increment_daily_quota", { user_id: id });

        if (error) {
            // Fallback to manual update if RPC fails
            const user = await this.getById(id);
            if (user) {
                await this.update(id, { daily_quota_used: user.daily_quota_used + 1 });
            }
        }
    }
}
