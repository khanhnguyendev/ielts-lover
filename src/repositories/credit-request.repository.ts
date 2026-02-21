import { CreditRequest } from "@/types";
import { ICreditRequestRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES, CreditRequestStatus } from "@/lib/constants";

export class CreditRequestRepository implements ICreditRequestRepository {
    async create(data: { teacher_id: string; student_id: string; amount: number; reason: string }): Promise<CreditRequest> {
        const supabase = await createServerSupabaseClient();
        const { data: created, error } = await supabase
            .from(DB_TABLES.CREDIT_REQUESTS)
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(`[CreditRequestRepo] Failed to create: ${error.message}`);
        return created as CreditRequest;
    }

    async getById(id: string): Promise<CreditRequest | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_REQUESTS)
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(`[CreditRequestRepo] getById failed: ${error.message}`);
        }
        return data as CreditRequest;
    }

    async listByTeacher(teacherId: string): Promise<CreditRequest[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_REQUESTS)
            .select(`
                *,
                student:${DB_TABLES.USER_PROFILES}!credit_requests_student_id_fkey (email, full_name)
            `)
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[CreditRequestRepo] listByTeacher failed: ${error.message}`);
        return data as CreditRequest[];
    }

    async listPending(): Promise<CreditRequest[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_REQUESTS)
            .select(`
                *,
                student:${DB_TABLES.USER_PROFILES}!credit_requests_student_id_fkey (email, full_name),
                teacher:${DB_TABLES.USER_PROFILES}!credit_requests_teacher_id_fkey (email, full_name)
            `)
            .eq("status", "pending")
            .order("created_at", { ascending: true });

        if (error) throw new Error(`[CreditRequestRepo] listPending failed: ${error.message}`);
        return data as CreditRequest[];
    }

    async listAll(): Promise<CreditRequest[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.CREDIT_REQUESTS)
            .select(`
                *,
                student:${DB_TABLES.USER_PROFILES}!credit_requests_student_id_fkey (email, full_name),
                teacher:${DB_TABLES.USER_PROFILES}!credit_requests_teacher_id_fkey (email, full_name)
            `)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[CreditRequestRepo] listAll failed: ${error.message}`);
        return data as CreditRequest[];
    }

    async updateStatus(id: string, status: CreditRequestStatus, reviewedBy: string, adminNote?: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.CREDIT_REQUESTS)
            .update({
                status,
                reviewed_by: reviewedBy,
                reviewed_at: new Date().toISOString(),
                ...(adminNote ? { admin_note: adminNote } : {}),
            })
            .eq("id", id);

        if (error) throw new Error(`[CreditRequestRepo] updateStatus failed: ${error.message}`);
    }
}
