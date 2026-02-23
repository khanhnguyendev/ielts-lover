import { z } from "zod";
import { CONTENT_LIMITS } from "@/lib/constants";

export const uuidSchema = z.string().uuid();

export const submitAttemptSchema = z.object({
    attemptId: uuidSchema,
    content: z.string().min(1).max(CONTENT_LIMITS.MAX_ESSAY_LENGTH),
});

export const rewriteTextSchema = z.object({
    text: z.string().min(1).max(CONTENT_LIMITS.MAX_REWRITE_LENGTH),
});

export const improveSentenceSchema = z.object({
    sentence: z.string().min(1).max(CONTENT_LIMITS.MAX_SENTENCE_LENGTH),
    targetScore: z.number().min(1).max(9).optional(),
});

export const saveAttemptDraftSchema = z.object({
    attemptId: uuidSchema,
    content: z.string().max(CONTENT_LIMITS.MAX_ESSAY_LENGTH),
});

export const updateUserProfileSchema = z.object({
    full_name: z.string().min(1).max(200).optional(),
    target_score: z.number().min(1).max(9).optional(),
    test_type: z.enum(["academic", "general"]).optional(),
    exam_date: z.string().optional(),
});

export const adjustCreditsSchema = z.object({
    userId: uuidSchema,
    amount: z.number().int().min(-10000).max(10000),
    description: z.string().min(1).max(500),
});
