import { redis, hasRedis } from "./redis";
import { Logger } from "./logger";

const logger = new Logger("DistributedLock");

const DEFAULT_LOCK_TTL_MS = 60_000; // 60 seconds

/**
 * Acquires a Redis-based distributed lock using SET NX with TTL.
 * Returns a release function if the lock was acquired, or null if already held.
 */
export async function acquireLock(
    key: string,
    ttlMs: number = DEFAULT_LOCK_TTL_MS
): Promise<(() => Promise<void>) | null> {
    if (!hasRedis || !redis) {
        // Without Redis, fall through (no lock protection)
        logger.warn("Redis unavailable — skipping distributed lock", { key });
        return async () => {};
    }

    const lockKey = `lock:${key}`;
    const lockValue = crypto.randomUUID();

    const acquired = await redis.set(lockKey, lockValue, {
        nx: true,
        px: ttlMs,
    });

    if (!acquired) return null;

    return async () => {
        // Only release if we still own the lock (prevent releasing another caller's lock)
        const currentValue = await redis!.get(lockKey);
        if (currentValue === lockValue) {
            await redis!.del(lockKey);
        }
    };
}

/**
 * Executes a function with a distributed lock on the given key.
 * If the lock is already held, returns the fallback value.
 */
export async function withLock<T>(
    key: string,
    fn: () => Promise<T>,
    fallback: T,
    ttlMs: number = DEFAULT_LOCK_TTL_MS
): Promise<T> {
    const release = await acquireLock(key, ttlMs);
    if (!release) return fallback;

    try {
        return await fn();
    } finally {
        await release();
    }
}
