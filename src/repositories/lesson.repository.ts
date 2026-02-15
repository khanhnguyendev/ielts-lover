import { ILessonRepository } from "./lesson.interface";
import { Lesson } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class LessonRepository implements ILessonRepository {
    async getById(id: string): Promise<Lesson | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lessons")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data as Lesson;
    }

    async listAll(): Promise<Lesson[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lessons")
            .select("*")
            .order("order_index", { ascending: true });

        if (error) return [];
        return data as Lesson[];
    }
}
