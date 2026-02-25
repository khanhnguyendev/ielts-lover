import { Attempt } from "@/types";
import { IAttemptRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

export class AttemptRepository implements IAttemptRepository {
    async create(data: Omit<Attempt, "id" | "created_at">): Promise<Attempt> {
        const supabase = await createServerSupabaseClient();
        const { data: created, error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(`[AttemptRepository] Failed to create attempt: ${error.message}`);
        return created as Attempt;
    }

    async getById(id: string): Promise<Attempt | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[AttemptRepository] getById failed: ${error.message}`);
        }
        return data as Attempt;
    }

    async update(id: string, data: Partial<Attempt>): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .update(data)
            .eq("id", id);

        if (error) throw new Error(`[AttemptRepository] Failed to update attempt: ${error.message}`);
    }

    async listByUserId(userId: string): Promise<any[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.EXERCISES} (type)
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[AttemptRepository] listByUserId failed: ${error.message}`);
        return data as Attempt[];
    }

    async listWritingAttemptsByUserId(userId: string): Promise<any[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.EXERCISES} (
                    title,
                    type
                )
            `)
            .eq("user_id", userId)
            .ilike(`${DB_TABLES.EXERCISES}.type`, 'writing%')
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[AttemptRepository] listWritingAttemptsByUserId failed: ${error.message}`);
        return data as any[];
    }

    async listWritingAttemptsByUserIdPaginated(userId: string, limit: number, offset: number): Promise<{ data: any[]; total: number }> {
        const supabase = await createServerSupabaseClient();
        const { data, error, count } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.EXERCISES} (
                    title,
                    type
                )
            `, { count: "exact" })
            .eq("user_id", userId)
            .ilike(`${DB_TABLES.EXERCISES}.type`, 'writing%')
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(`[AttemptRepository] listWritingAttemptsByUserIdPaginated failed: ${error.message}`);
        return { data: data as any[], total: count || 0 };
    }

    async listAll(limit: number = 20): Promise<any[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.USER_PROFILES} (email),
                ${DB_TABLES.EXERCISES} (type)
            `)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new Error(`[AttemptRepository] Failed to list all attempts: ${error.message}`);
        return data as any[];
    }

    async getTodayCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from(DB_TABLES.ATTEMPTS)
            .select("*", { count: 'exact', head: true })
            .gte("created_at", today.toISOString());

        if (error) throw new Error(`[AttemptRepository] Failed to get today's attempt count: ${error.message}`);
        return count || 0;
    }
}
