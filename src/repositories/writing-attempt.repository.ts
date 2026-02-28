import { WritingAttempt } from "@/types";
import { IWritingAttemptRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

export class WritingAttemptRepository implements IWritingAttemptRepository {
    async create(data: Omit<WritingAttempt, "id" | "created_at">): Promise<WritingAttempt> {
        const supabase = await createServerSupabaseClient();
        const { data: created, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(`[WritingAttemptRepository] Failed to create attempt: ${error.message}`);
        return created as WritingAttempt;
    }

    async getById(id: string): Promise<WritingAttempt | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[WritingAttemptRepository] getById failed: ${error.message}`);
        }
        return data as WritingAttempt;
    }

    async update(id: string, data: Partial<WritingAttempt>): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .update(data)
            .eq("id", id);

        if (error) throw new Error(`[WritingAttemptRepository] Failed to update attempt: ${error.message}`);
    }

    async listByUserId(userId: string): Promise<any[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.WRITING_EXERCISES} (type)
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[WritingAttemptRepository] listByUserId failed: ${error.message}`);
        return data as WritingAttempt[];
    }

    async listWritingAttemptsByUserId(userId: string): Promise<any[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.WRITING_EXERCISES} (
                    title,
                    type
                )
            `)
            .eq("user_id", userId)
            .ilike(`${DB_TABLES.WRITING_EXERCISES}.type`, 'writing%')
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[WritingAttemptRepository] listWritingAttemptsByUserId failed: ${error.message}`);
        return data as any[];
    }

    async listWritingAttemptsByUserIdPaginated(userId: string, limit: number, offset: number): Promise<{ data: any[]; total: number }> {
        const supabase = await createServerSupabaseClient();
        const { data, error, count } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.WRITING_EXERCISES} (
                    title,
                    type
                )
            `, { count: "exact" })
            .eq("user_id", userId)
            .ilike(`${DB_TABLES.WRITING_EXERCISES}.type`, 'writing%')
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(`[WritingAttemptRepository] listWritingAttemptsByUserIdPaginated failed: ${error.message}`);
        return { data: data as any[], total: count || 0 };
    }

    async listAll(limit: number = 20): Promise<any[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.USER_PROFILES} (email),
                ${DB_TABLES.WRITING_EXERCISES} (type)
            `)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new Error(`[WritingAttemptRepository] Failed to list all attempts: ${error.message}`);
        return data as any[];
    }

    async getMostRecentAttempt(userId: string): Promise<any | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select(`
                *,
                ${DB_TABLES.WRITING_EXERCISES} (
                    title,
                    type
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(`[WritingAttemptRepository] getMostRecentAttempt failed: ${error.message}`);
        return data;
    }

    async getTodayCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from(DB_TABLES.WRITING_ATTEMPTS)
            .select("*", { count: 'exact', head: true })
            .gte("created_at", today.toISOString());

        if (error) throw new Error(`[WritingAttemptRepository] Failed to get today's attempt count: ${error.message}`);
        return count || 0;
    }
}
