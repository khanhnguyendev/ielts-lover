import { Attempt } from "@/types";
import { IAttemptRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class AttemptRepository implements IAttemptRepository {
    async create(data: Omit<Attempt, "id" | "created_at">): Promise<Attempt> {
        const supabase = await createServerSupabaseClient();
        const { data: created, error } = await supabase
            .from("attempts")
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(`Failed to create attempt: ${error.message}`);
        return created as Attempt;
    }

    async getById(id: string): Promise<Attempt | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("attempts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data as Attempt;
    }

    async update(id: string, data: Partial<Attempt>): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("attempts")
            .update(data)
            .eq("id", id);

        if (error) throw new Error(`Failed to update attempt: ${error.message}`);
    }

    async listByUserId(userId: string): Promise<Attempt[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("attempts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) return [];
        return data as Attempt[];
    }
}
