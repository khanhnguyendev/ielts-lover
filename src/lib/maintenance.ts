import { redis, hasRedis } from "@/lib/redis";

const REDIS_KEY = "maintenance:enabled";

/**
 * Check if maintenance mode is active.
 * Reads from Redis for speed. Falls back to allowing traffic if Redis is unavailable.
 */
export async function isMaintenanceMode(): Promise<boolean> {
    if (!hasRedis || !redis) return false;
    try {
        const value = await redis.get(REDIS_KEY);
        return value === "true" || value === true;
    } catch {
        return false; // fail-open: allow traffic if Redis is down
    }
}

/**
 * Set maintenance mode on/off.
 * Writes to Redis. The server action should also persist to system_settings.
 */
export async function setMaintenanceMode(enabled: boolean): Promise<void> {
    if (!hasRedis || !redis) return;
    if (enabled) {
        await redis.set(REDIS_KEY, "true");
    } else {
        await redis.del(REDIS_KEY);
    }
}
