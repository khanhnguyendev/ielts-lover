import { INotificationRepository, AppNotification } from "@/repositories/interfaces";
import { NotificationType, NotificationEntityType } from "@/lib/constants";
import { redis, hasRedis } from "@/lib/redis";
import { Logger } from "@/lib/logger";

const logger = new Logger("NotificationService");

const UNREAD_KEY_PREFIX = "notification:unread:";
const UNREAD_TTL = 86400; // 24 hours

export type NotifyOptions = {
    groupKey?: string;
    deepLink?: string;
    entityId?: string;
    entityType?: NotificationEntityType;
    metadata?: Record<string, unknown>;
};

export class NotificationService {
    constructor(private notificationRepo: INotificationRepository) {}

    async notify(
        recipientId: string,
        type: NotificationType,
        title: string,
        body: string,
        opts?: NotifyOptions
    ): Promise<AppNotification> {
        const notification = await this.notificationRepo.create({
            recipient_id: recipientId,
            type,
            title,
            body,
            group_key: opts?.groupKey ?? null,
            deep_link: opts?.deepLink ?? null,
            entity_id: opts?.entityId ?? null,
            entity_type: opts?.entityType ?? null,
            metadata: opts?.metadata ?? {},
        });

        // Increment Redis unread counter (fire-and-forget)
        if (hasRedis && redis) {
            const key = `${UNREAD_KEY_PREFIX}${recipientId}`;
            redis.incr(key)
                .then(() => redis!.expire(key, UNREAD_TTL))
                .catch(err => logger.error("Redis INCR failed", { error: err }));
        }

        return notification;
    }

    async getUnreadCount(userId: string): Promise<number> {
        // Try Redis first
        if (hasRedis && redis) {
            try {
                const cached = await redis.get<number>(`${UNREAD_KEY_PREFIX}${userId}`);
                if (cached !== null && cached !== undefined) return cached;
            } catch (err) {
                logger.error("Redis GET failed, falling back to DB", { error: err });
            }
        }

        // Fallback to Postgres
        const count = await this.notificationRepo.countUnread(userId);

        // Backfill Redis
        if (hasRedis && redis) {
            redis.set(`${UNREAD_KEY_PREFIX}${userId}`, count, { ex: UNREAD_TTL })
                .catch(err => logger.error("Redis SET backfill failed", { error: err }));
        }

        return count;
    }

    async list(userId: string, cursor?: string, limit?: number): Promise<AppNotification[]> {
        return this.notificationRepo.listByRecipient(userId, cursor, limit);
    }

    async markRead(userId: string, notificationId: string): Promise<void> {
        await this.notificationRepo.markRead(userId, notificationId);

        if (hasRedis && redis) {
            const key = `${UNREAD_KEY_PREFIX}${userId}`;
            redis.decr(key)
                .then(val => { if (val < 0) redis!.set(key, 0, { ex: UNREAD_TTL }); })
                .catch(err => logger.error("Redis DECR failed", { error: err }));
        }
    }

    async markAllRead(userId: string): Promise<void> {
        await this.notificationRepo.markAllRead(userId);

        if (hasRedis && redis) {
            redis.set(`${UNREAD_KEY_PREFIX}${userId}`, 0, { ex: UNREAD_TTL })
                .catch(err => logger.error("Redis reset failed", { error: err }));
        }
    }
}
