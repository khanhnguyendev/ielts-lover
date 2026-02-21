import { TeacherStudent, UserProfile } from "@/types";
import { ITeacherStudentRepository } from "./interfaces";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES } from "@/lib/constants";

export class TeacherStudentRepository implements ITeacherStudentRepository {
    async assign(teacherId: string, studentId: string, assignedBy: string): Promise<TeacherStudent> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.TEACHER_STUDENTS)
            .insert({ teacher_id: teacherId, student_id: studentId, assigned_by: assignedBy })
            .select()
            .single();

        if (error) throw new Error(`[TeacherStudentRepo] Failed to assign: ${error.message}`);
        return data as TeacherStudent;
    }

    async unassign(teacherId: string, studentId: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.TEACHER_STUDENTS)
            .delete()
            .eq("teacher_id", teacherId)
            .eq("student_id", studentId);

        if (error) throw new Error(`[TeacherStudentRepo] Failed to unassign: ${error.message}`);
    }

    async getStudentsByTeacher(teacherId: string): Promise<UserProfile[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.TEACHER_STUDENTS)
            .select(`
                student_id,
                ${DB_TABLES.USER_PROFILES}!teacher_students_student_id_fkey (
                    id, email, full_name, avatar_url, target_score, test_type,
                    credits_balance, last_seen_at, created_at, role
                )
            `)
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[TeacherStudentRepo] getStudentsByTeacher failed: ${error.message}`);
        return (data || []).map((row: Record<string, unknown>) => row.user_profiles) as UserProfile[];
    }

    async getTeachersByStudent(studentId: string): Promise<UserProfile[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from(DB_TABLES.TEACHER_STUDENTS)
            .select(`
                teacher_id,
                ${DB_TABLES.USER_PROFILES}!teacher_students_teacher_id_fkey (
                    id, email, full_name, avatar_url, role
                )
            `)
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[TeacherStudentRepo] getTeachersByStudent failed: ${error.message}`);
        return (data || []).map((row: Record<string, unknown>) => row.user_profiles) as UserProfile[];
    }

    async isLinked(teacherId: string, studentId: string): Promise<boolean> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.TEACHER_STUDENTS)
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", teacherId)
            .eq("student_id", studentId);

        if (error) throw new Error(`[TeacherStudentRepo] isLinked failed: ${error.message}`);
        return (count || 0) > 0;
    }
}
