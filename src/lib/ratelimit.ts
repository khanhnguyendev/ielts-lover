import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis URL is available. If not, we fall back to an inert limiter that allows everything.
// This is for local development without Redis or if the user hasn't set it up yet.
const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null as any; // Cast so TS doesn't complain, we won't use it if !hasRedis

// Rate limiters for different AI actions

// Standard AI evaluations: 10 requests per minute per user
export const evaluateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/evaluate",
});

// Cheaper AI actions (rewrite, improve): 30 requests per minute per user
export const simpleAiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/simple-ai",
});

// Global fallback if Redis is missing
const mockSuccess = { success: true, pending: Promise.resolve(), limit: 10, remaining: 10, reset: 0 };

export async function checkRateLimit(
    limiter: Ratelimit,
    identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    if (!hasRedis) return mockSuccess;

    return await limiter.limit(identifier);
}
