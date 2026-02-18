import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreditPackage } from "@/types";
import { DB_TABLES } from "@/lib/constants";

export class CreditPackageRepository {
    async listAll(): Promise<CreditPackage[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_PACKAGES)
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Error fetching credit packages:", error);
            return [];
        }
        return data as CreditPackage[];
    }

    async getById(id: string): Promise<CreditPackage | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_PACKAGES)
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data as CreditPackage;
    }

    async create(pkg: Omit<CreditPackage, "id" | "created_at" | "updated_at">): Promise<CreditPackage> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_PACKAGES)
            .insert(pkg)
            .select()
            .single();

        if (error) throw new Error(`[CreditPackageRepository] Failed to create credit package: ${error.message}`);
        return data as CreditPackage;
    }

    async update(id: string, pkg: Partial<CreditPackage>): Promise<CreditPackage> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_PACKAGES)
            .update({ ...pkg, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(`[CreditPackageRepository] Failed to update credit package: ${error.message}`);
        return data as CreditPackage;
    }

    async delete(id: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.CREDIT_PACKAGES)
            .delete()
            .eq("id", id);

        if (error) throw new Error(`[CreditPackageRepository] Failed to delete credit package: ${error.message}`);
    }
}
