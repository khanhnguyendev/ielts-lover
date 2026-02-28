import { WritingExercise, ExerciseType } from "@/types";
import { IWritingExerciseRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

export class WritingExerciseRepository implements IWritingExerciseRepository {
    async getById(id: string): Promise<WritingExercise | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .select("*, creator:user_profiles!created_by(full_name, email, role)")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[WritingExerciseRepository] getById failed: ${error.message}`);
        }
        return data as WritingExercise;
    }

    async getLatestVersion(type: ExerciseType): Promise<WritingExercise | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .select("*, creator:user_profiles!created_by(full_name, email, role)")
            .eq("type", type)
            .eq("is_published", true)
            .order("version", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[WritingExerciseRepository] getLatestVersion failed: ${error.message}`);
        }
        return data as WritingExercise;
    }

    async listByType(type: ExerciseType): Promise<WritingExercise[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .select("*, creator:user_profiles!created_by(full_name, email, role)")
            .eq("type", type)
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[WritingExerciseRepository] listAll failed: ${error.message}`);
        return data as WritingExercise[];
    }

    async listByTypePaginated(type: ExerciseType, limit: number, offset: number): Promise<{ data: WritingExercise[]; total: number }> {
        const supabase = await createServerSupabaseClient();
        const { data, error, count } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .select("*, creator:user_profiles!created_by(full_name, email, role)", { count: "exact" })
            .eq("type", type)
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(`[WritingExerciseRepository] listByTypePaginated failed: ${error.message}`);
        return { data: data as WritingExercise[], total: count || 0 };
    }

    async createVersion(exercise: Omit<WritingExercise, "id" | "created_at">): Promise<WritingExercise> {
        const supabase = await createServerSupabaseClient();
        const { creator: _creator, ...insertData } = exercise;
        const { data, error } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .insert(insertData)
            .select()
            .single();

        if (error) throw new Error(`[WritingExerciseRepository] Failed to create exercise version: ${error.message}`);
        return data as WritingExercise;
    }

    async delete(id: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .update({ is_published: false })
            .eq("id", id);

        if (error) throw new Error(`[WritingExerciseRepository] delete failed: ${error.message}`);
    }

    async getTotalCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.WRITING_EXERCISES)
            .select("*", { count: 'exact', head: true })
            .eq("is_published", true);

        if (error) throw new Error(`[WritingExerciseRepository] Failed to get total exercise count: ${error.message}`);
        return count || 0;
    }
}
