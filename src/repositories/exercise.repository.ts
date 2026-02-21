import { Exercise, ExerciseType } from "@/types";
import { IExerciseRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, APP_ERROR_CODES } from "@/lib/constants";

export class ExerciseRepository implements IExerciseRepository {
    async getById(id: string): Promise<Exercise | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.EXERCISES)
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[ExerciseRepository] getById failed: ${error.message}`);
        }
        return data as Exercise;
    }

    async getLatestVersion(type: ExerciseType): Promise<Exercise | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.EXERCISES)
            .select("*")
            .eq("type", type)
            .eq("is_published", true)
            .order("version", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === APP_ERROR_CODES.PGRST116) return null;
            throw new Error(`[ExerciseRepository] getLatestVersion failed: ${error.message}`);
        }
        return data as Exercise;
    }

    async listByType(type: ExerciseType): Promise<Exercise[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.EXERCISES)
            .select("*, creator:user_profiles!created_by(full_name, email, role)")
            .eq("type", type)
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[ExerciseRepository] listAll failed: ${error.message}`);
        return data as Exercise[];
    }

    async createVersion(exercise: Omit<Exercise, "id" | "created_at">): Promise<Exercise> {
        const supabase = await createServerSupabaseClient();
        const { creator: _creator, ...insertData } = exercise;
        const { data, error } = await supabase
            .from(DB_TABLES.EXERCISES)
            .insert(insertData)
            .select()
            .single();

        if (error) throw new Error(`[ExerciseRepository] Failed to create exercise version: ${error.message}`);
        return data as Exercise;
    }

    async getTotalCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.EXERCISES)
            .select("*", { count: 'exact', head: true })
            .eq("is_published", true);

        if (error) throw new Error(`[ExerciseRepository] Failed to get total exercise count: ${error.message}`);
        return count || 0;
    }
}
