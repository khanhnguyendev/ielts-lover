import { ICreditTransactionRepository, CreditTransaction } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class CreditTransactionRepository implements ICreditTransactionRepository {
    async create(transaction: Omit<CreditTransaction, "id" | "created_at">): Promise<CreditTransaction> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("credit_transactions")
            .insert(transaction)
            .select("*")
            .single();

        if (error) throw new Error(`[CreditTransactionRepository] Failed to log transaction: ${error.message}`);
        return data as CreditTransaction;
    }

    async listByUserId(userId: string): Promise<CreditTransaction[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("credit_transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) return [];
        return data as CreditTransaction[];
    }
}
