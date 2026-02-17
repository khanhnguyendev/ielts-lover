import { Exercise, ExerciseType } from "@/types";
import { IExerciseRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class ExerciseRepository implements IExerciseRepository {
    async getById(id: string): Promise<Exercise | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("exercises")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data as Exercise;
    }

    async getLatestVersion(type: ExerciseType): Promise<Exercise | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("exercises")
            .select("*")
            .eq("type", type)
            .eq("is_published", true)
            .order("version", { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data as Exercise;
    }

    async listByType(type: ExerciseType): Promise<Exercise[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("exercises")
            .select("*")
            .eq("type", type)
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) return [];
        return data as Exercise[];
    }

    async createVersion(exercise: Omit<Exercise, "id" | "created_at">): Promise<Exercise> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("exercises")
            .insert(exercise)
            .select()
            .single();

        if (error) throw new Error(`[ExerciseRepository] Failed to create exercise version: ${error.message}`);
        return data as Exercise;
    }

    async getTotalCount(): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from("exercises")
            .select("*", { count: 'exact', head: true })
            .eq("is_published", true);

        if (error) throw new Error(`[ExerciseRepository] Failed to get total exercise count: ${error.message}`);
        return count || 0;
    }
}
