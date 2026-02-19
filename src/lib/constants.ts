/**
 * Centralized System Constants for IELTS Lover
 */

export const TRANSACTION_TYPES = {
    DAILY_GRANT: 'daily_grant',
    USAGE: 'usage',
    PURCHASE: 'purchase',
    BONUS: 'bonus',
    REFUND: 'refund',
    REWARD: 'reward',
    GIFT_CODE: 'gift_code',
    REFERRAL_REWARD: 'referral_reward',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const TEST_TYPES = {
    ACADEMIC: 'academic',
    GENERAL: 'general',
} as const;

export type TestType = typeof TEST_TYPES[keyof typeof TEST_TYPES];

export const EXERCISE_TYPES = {
    WRITING_TASK1: 'writing_task1',
    WRITING_TASK2: 'writing_task2',
    SPEAKING_PART1: 'speaking_part1',
    SPEAKING_PART2: 'speaking_part2',
    SPEAKING_PART3: 'speaking_part3',
} as const;

export type ExerciseType = typeof EXERCISE_TYPES[keyof typeof EXERCISE_TYPES];

export const ATTEMPT_STATES = {
    CREATED: 'CREATED',
    IN_PROGRESS: 'IN_PROGRESS',
    SUBMITTED: 'SUBMITTED',
    EVALUATED: 'EVALUATED',
} as const;

export type AttemptState = typeof ATTEMPT_STATES[keyof typeof ATTEMPT_STATES];

export const FEATURE_KEYS = {
    WRITING_EVALUATION: 'writing_evaluation',
    SPEAKING_EVALUATION: 'speaking_evaluation',
    TEXT_REWRITER: 'text_rewriter',
    MOCK_TEST: 'mock_test',
    AI_TUTOR_CHAT: 'ai_tutor_chat',
    DETAILED_CORRECTION: 'detailed_correction',
    SENTENCE_IMPROVE: 'sentence_improve',
} as const;

export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];

export const PACKAGE_TIERS = {
    STARTER: 'starter',
    PRO: 'pro',
    MASTER: 'master',
} as const;

export type PackageTier = typeof PACKAGE_TIERS[keyof typeof PACKAGE_TIERS];

export const DB_TABLES = {
    USER_PROFILES: 'user_profiles',
    CREDIT_TRANSACTIONS: 'credit_transactions',
    ATTEMPTS: 'attempts',
    EXERCISES: 'exercises',
    FEATURE_PRICING: 'feature_pricing',
    SYSTEM_SETTINGS: 'system_settings',
    CREDIT_PACKAGES: 'credit_packages',
    LESSONS: 'lessons',
    LESSON_QUESTIONS: 'lesson_questions',
} as const;

export const TRANSACTION_FILTERS = {
    ALL: 'all',
    EARNED: 'earned',
    SPENT: 'spent',
} as const;

export type TransactionFilter = typeof TRANSACTION_FILTERS[keyof typeof TRANSACTION_FILTERS];

export const APP_ERROR_CODES = {
    INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    AI_SERVICE_BUSY: 'AI_SERVICE_BUSY',
    PGRST116: 'PGRST116',
} as const;

export const STORAGE_FOLDERS = {
    EXERCISES: "ielts-lover/exercises",
    USER_UPLOADS: "ielts-lover/uploads",
} as const;

export const DEFAULT_QUOTAS = {
    FREE_DAILY_LIMIT: 2,
    FREE_DAILY_GRANT: 5,
} as const;
