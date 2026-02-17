import { ILessonRepository } from "./lesson.interface";
import { Lesson, LessonQuestion } from "@/types";
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

    async create(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lessons")
            .insert(lesson)
            .select()
            .single();

        if (error) throw new Error(`[LessonRepository] Failed to create lesson: ${error.message}`);
        return data as Lesson;
    }

    async update(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lessons")
            .update(lesson)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(`[LessonRepository] Failed to update lesson: ${error.message}`);
        return data as Lesson;
    }

    async delete(id: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("lessons")
            .delete()
            .eq("id", id);

        if (error) throw new Error(`[LessonRepository] Failed to delete lesson: ${error.message}`);
    }

    // Questions
    async createQuestion(question: Omit<LessonQuestion, 'id' | 'created_at'>): Promise<LessonQuestion> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lesson_questions")
            .insert(question)
            .select()
            .single();

        if (error) throw new Error(`[LessonRepository] Failed to create lesson question: ${error.message}`);
        return data as LessonQuestion;
    }

    async updateQuestion(id: string, question: Partial<LessonQuestion>): Promise<LessonQuestion> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lesson_questions")
            .update(question)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(`[LessonRepository] Failed to update lesson question: ${error.message}`);
        return data as LessonQuestion;
    }

    async deleteQuestion(id: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from("lesson_questions")
            .delete()
            .eq("id", id);

        if (error) throw new Error(`[LessonRepository] Failed to delete lesson question: ${error.message}`);
    }

    async getQuestionsByLessonId(lessonId: string): Promise<LessonQuestion[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("lesson_questions")
            .select("*")
            .eq("lesson_id", lessonId)
            .order("order_index", { ascending: true });

        if (error) return [];
        // Parse options if they are stored as JSON b/c Supabase might return them as object/string depending on client config
        // But here we typed them as string[] in LessonQuestion, and in DB it is JSONB.
        return data.map((q: any) => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        })) as LessonQuestion[];
    }
}
