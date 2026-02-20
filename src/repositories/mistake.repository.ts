import { IMistakeRepository, UserMistake } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, SkillType } from "@/lib/constants";

export class MistakeRepository implements IMistakeRepository {
    async saveMistakes(mistakes: Omit<UserMistake, 'id' | 'created_at'>[]): Promise<void> {
        if (mistakes.length === 0) return;

        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.USER_MISTAKES)
            .insert(mistakes);

        if (error) throw new Error(`[MistakeRepository] saveMistakes failed: ${error.message}`);
    }

    async getUserMistakes(userId: string, skillType?: SkillType, limit: number = 100): Promise<UserMistake[]> {
        const supabase = await createServerSupabaseClient();
        let query = supabase
            .from(DB_TABLES.USER_MISTAKES)
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (skillType) {
            query = query.eq("skill_type", skillType);
        }

        const { data, error } = await query;

        if (error) throw new Error(`[MistakeRepository] getUserMistakes failed: ${error.message}`);
        return data as UserMistake[];
    }

    async getMistakeCount(userId: string): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.USER_MISTAKES)
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

        if (error) throw new Error(`[MistakeRepository] getMistakeCount failed: ${error.message}`);
        return count ?? 0;
    }
}
