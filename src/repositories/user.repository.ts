import { UserProfile } from "@/types";
import { IUserRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

export class UserRepository implements IUserRepository {
    async getById(id: string): Promise<UserProfile | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.USER_PROFILES)
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[UserRepository] getById failed: ${error.message}`);
        }
        return data as UserProfile;
    }

    async update(id: string, data: Partial<UserProfile>): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.USER_PROFILES)
            .update(data)
            .eq("id", id);

        if (error) throw new Error(`[UserRepository] Failed to update user: ${error.message}`);
    }

    async incrementQuota(id: string): Promise<void> {
        // Deprecated but keeping for backward compatibility during migration
        const user = await this.getById(id);
        if (user) {
            await this.update(id, { daily_quota_used: user.daily_quota_used + 1 });
        }
    }

    async deductCredits(id: string, amount: number): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc("deduct_credits", { user_id: id, amount });

        if (error) {
            const user = await this.getById(id);
            if (user) {
                await this.update(id, { credits_balance: user.credits_balance - amount });
            }
        }
    }

    async addCredits(id: string, amount: number): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc("add_credits", { user_id: id, amount });

        if (error) {
            const user = await this.getById(id);
            if (user) {
                await this.update(id, { credits_balance: user.credits_balance + amount });
            }
        }
    }

    async listAll(): Promise<UserProfile[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.USER_PROFILES)
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[UserRepository] Failed to list users: ${error.message}`);
        return data as UserProfile[];
    }

    async getPremiumCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.USER_PROFILES)
            .select("*", { count: 'exact', head: true })
            .eq("is_premium", true);

        if (error) throw new Error(`[UserRepository] Failed to get premium count: ${error.message}`);
        return count || 0;
    }

    async getTotalCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.USER_PROFILES)
            .select("*", { count: 'exact', head: true });

        if (error) throw new Error(`[UserRepository] Failed to get total count: ${error.message}`);
        return count || 0;
    }
}
