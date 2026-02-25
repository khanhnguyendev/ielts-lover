import { ICreditTransactionRepository, CreditTransaction, CreditTransactionWithUser } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, TRANSACTION_TYPES } from "@/lib/constants";

export class CreditTransactionRepository implements ICreditTransactionRepository {
    async create(transaction: Omit<CreditTransaction, "id" | "created_at">): Promise<CreditTransaction> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .insert(transaction)
            .select("*")
            .single();

        if (error) throw new Error(`[CreditTransactionRepository] Failed to log transaction: ${error.message}`);
        return data as CreditTransaction;
    }

    async getById(id: string): Promise<CreditTransactionWithUser | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select(`*, ${DB_TABLES.USER_PROFILES} (email, full_name, avatar_url)`)
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(`[CreditTransactionRepository] getById failed: ${error.message}`);
        }
        const userProfile = Array.isArray((data as any).user_profiles)
            ? (data as any).user_profiles[0]
            : (data as any).user_profiles;

        return {
            ...data,
            user_email: userProfile?.email,
            user_full_name: userProfile?.full_name,
            user_avatar_url: userProfile?.avatar_url,
            user_profiles: undefined,
        } as CreditTransactionWithUser;
    }

    async listByUserId(userId: string): Promise<CreditTransaction[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[CreditTransactionRepository] listByUserId failed: ${error.message}`);
        return data as CreditTransaction[];
    }

    async getLastActivityMap(): Promise<Record<string, string>> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select("user_id, created_at")
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[CreditTransactionRepository] getLastActivityMap failed: ${error.message}`);

        const map: Record<string, string> = {};
        for (const row of data || []) {
            if (!map[row.user_id]) {
                map[row.user_id] = row.created_at;
            }
        }
        return map;
    }

    async getRecentByUserId(userId: string, limit: number): Promise<CreditTransaction[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new Error(`[CreditTransactionRepository] getRecentByUserId failed: ${error.message}`);
        return data as CreditTransaction[];
    }

    async getRecentAll(limit: number): Promise<CreditTransactionWithUser[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select(`*, ${DB_TABLES.USER_PROFILES} (email, full_name, avatar_url)`)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new Error(`[CreditTransactionRepository] getRecentAll failed: ${error.message}`);
        return (data || []).map((row: any) => {
            const up = Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles;
            return {
                ...row,
                user_email: up?.email,
                user_full_name: up?.full_name,
                user_avatar_url: up?.avatar_url,
                user_profiles: undefined,
            };
        }) as CreditTransactionWithUser[];
    }

    async getRecentByUserIds(userIds: string[], limit: number): Promise<CreditTransactionWithUser[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select(`*, ${DB_TABLES.USER_PROFILES} (email, full_name, avatar_url)`)
            .in("user_id", userIds)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw new Error(`[CreditTransactionRepository] getRecentByUserIds failed: ${error.message}`);
        return (data || []).map((row: any) => {
            const up = Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles;
            return {
                ...row,
                user_email: up?.email,
                user_full_name: up?.full_name,
                user_avatar_url: up?.avatar_url,
                user_profiles: undefined,
            };
        }) as CreditTransactionWithUser[];
    }

    async listByUserIdPaginated(userId: string, limit: number, offset: number): Promise<{ data: CreditTransaction[]; total: number }> {
        const supabase = await createServerSupabaseClient();
        const { data, error, count } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(`[CreditTransactionRepository] listByUserIdPaginated failed: ${error.message}`);
        return { data: data as CreditTransaction[], total: count || 0 };
    }

    async getStatsByUserId(userId: string): Promise<{ totalEarned: number; totalSpent: number }> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select("amount")
            .eq("user_id", userId);

        if (error) throw new Error(`[CreditTransactionRepository] getStatsByUserId failed: ${error.message}`);

        let totalEarned = 0;
        let totalSpent = 0;
        for (const row of data || []) {
            if (row.amount > 0) totalEarned += row.amount;
            else totalSpent += Math.abs(row.amount);
        }
        return { totalEarned, totalSpent };
    }

    async getMonthlyUsage(userId: string): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_TRANSACTIONS)
            .select("amount")
            .eq("user_id", userId)
            .eq("type", TRANSACTION_TYPES.USAGE)
            .gte("created_at", monthStart);

        if (error) throw new Error(`[CreditTransactionRepository] getMonthlyUsage failed: ${error.message}`);

        // Usage transactions have negative amounts; sum and return absolute value
        const totalSpent = (data || []).reduce((sum, row) => sum + Math.abs(row.amount), 0);
        return totalSpent;
    }
}
