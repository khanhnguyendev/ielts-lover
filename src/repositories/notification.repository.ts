import { AppNotification, INotificationRepository } from "./interfaces";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { DB_TABLES } from "@/lib/constants";

export class NotificationRepository implements INotificationRepository {
    async create(data: Omit<AppNotification, "id" | "created_at" | "updated_at" | "is_read" | "read_at">): Promise<AppNotification> {
        const supabase = await createServiceSupabaseClient();
        const { data: created, error } = await supabase
            .from(DB_TABLES.NOTIFICATIONS)
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(`[NotificationRepository] create failed: ${error.message}`);
        return created as AppNotification;
    }

    async listByRecipient(userId: string, cursor?: string, limit: number = 20): Promise<AppNotification[]> {
        const supabase = await createServerSupabaseClient();
        let query = supabase
            .from(DB_TABLES.NOTIFICATIONS)
            .select("*")
            .eq("recipient_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        const { data, error } = await query;
        if (error) throw new Error(`[NotificationRepository] listByRecipient failed: ${error.message}`);
        return (data || []) as AppNotification[];
    }

    async countUnread(userId: string): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from(DB_TABLES.NOTIFICATIONS)
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", userId)
            .eq("is_read", false);

        if (error) throw new Error(`[NotificationRepository] countUnread failed: ${error.message}`);
        return count || 0;
    }

    async markRead(userId: string, notificationId: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.NOTIFICATIONS)
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("id", notificationId)
            .eq("recipient_id", userId);

        if (error) throw new Error(`[NotificationRepository] markRead failed: ${error.message}`);
    }

    async markAllRead(userId: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from(DB_TABLES.NOTIFICATIONS)
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("recipient_id", userId)
            .eq("is_read", false);

        if (error) throw new Error(`[NotificationRepository] markAllRead failed: ${error.message}`);
    }
}
