"use server";

import { getCurrentUser } from "@/app/actions";
import { notificationService } from "@/lib/notification-client";
import { traceAction } from "@/lib/aop";

export const getNotifications = traceAction("getNotifications", async (cursor?: string, limit?: number) => {
    const user = await getCurrentUser();
    if (!user) return [];
    return notificationService.list(user.id, cursor, limit);
});

export const getUnreadCount = traceAction("getUnreadCount", async () => {
    const user = await getCurrentUser();
    if (!user) return 0;
    return notificationService.getUnreadCount(user.id);
});

export const markNotificationRead = traceAction("markNotificationRead", async (notificationId: string) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    await notificationService.markRead(user.id, notificationId);
});

export const markAllNotificationsRead = traceAction("markAllNotificationsRead", async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    await notificationService.markAllRead(user.id);
});
