import { UserProfile } from "@/types";
import { IUserRepository } from "./interfaces";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES, TEST_TYPES, USER_ROLES } from "@/lib/constants";

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



    async deductCredits(id: string, amount: number): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc("deduct_credits", { user_id: id, amount });

        if (error) {
            throw new Error(`[UserRepository] deductCredits failed: ${error.message}`);
        }
    }

    async addCredits(id: string, amount: number): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.rpc("add_credits", { user_id: id, amount });

        if (error) {
            throw new Error(`[UserRepository] addCredits failed: ${error.message}`);
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

    async syncOAuthProfile(userId: string, updates: {
        id: string;
        email: string;
        full_name: string | null;
        avatar_url: string | null;
        last_seen_at: string;
    }): Promise<void> {
        const serviceSupabase = await createServiceSupabaseClient();

        const { data: existingProfile } = await serviceSupabase
            .from(DB_TABLES.USER_PROFILES)
            .select("id")
            .eq("id", userId)
            .single();

        if (!existingProfile) {
            const { error } = await serviceSupabase
                .from(DB_TABLES.USER_PROFILES)
                .insert({
                    ...updates,
                    target_score: 7.0,
                    test_type: TEST_TYPES.ACADEMIC,
                    role: USER_ROLES.USER,
                    created_at: new Date().toISOString(),
                });
            if (error) throw error;
        } else {
            const { error } = await serviceSupabase
                .from(DB_TABLES.USER_PROFILES)
                .update({
                    full_name: updates.full_name,
                    avatar_url: updates.avatar_url,
                    last_seen_at: updates.last_seen_at,
                })
                .eq("id", userId);
            if (error) throw error;
        }
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
