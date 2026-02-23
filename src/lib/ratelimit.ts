import { Ratelimit } from "@upstash/ratelimit";
import { redis, hasRedis } from "./redis";

// Rate limiters for different AI actions
// Ratelimit requires a non-null redis; cast is safe because we gate on hasRedis below
const redisClient = redis as any;

// Standard AI evaluations: 10 requests per minute per user
export const evaluateLimiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/evaluate",
});

// Cheaper AI actions (rewrite, improve): 30 requests per minute per user
export const simpleAiLimiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/simple-ai",
});

// Fail-closed: deny requests when Redis is unavailable to prevent abuse
const mockDenied = { success: false, pending: Promise.resolve(), limit: 0, remaining: 0, reset: 0 };

export async function checkRateLimit(
    limiter: Ratelimit,
    identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    if (!hasRedis) return mockDenied;

    return await limiter.limit(identifier);
}
