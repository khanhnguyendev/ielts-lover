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
    TEACHER_GRANT: 'teacher_grant',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    TEACHER: 'teacher',
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
    WEAKNESS_ANALYSIS: 'weakness_analysis',
    CHART_IMAGE_ANALYSIS: 'chart_image_analysis',
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
    USER_MISTAKES: 'user_mistakes',
    USER_ACTION_PLANS: 'user_action_plans',
    TEACHER_STUDENTS: 'teacher_students',
    CREDIT_REQUESTS: 'credit_requests',
    AI_USAGE_LOGS: 'ai_usage_logs',
    AI_MODEL_PRICING: 'ai_model_pricing',
    AI_COST_SUMMARY_7_DAYS: 'ai_cost_summary_7_days',
    AI_COST_SUMMARY_30_DAYS: 'ai_cost_summary_30_days',
    NOTIFICATIONS: 'notifications',
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

export const SKILL_TYPES = {
    WRITING: 'writing',
    SPEAKING: 'speaking',
} as const;

export type SkillType = typeof SKILL_TYPES[keyof typeof SKILL_TYPES];

export const ERROR_CATEGORIES = {
    GRAMMAR: 'grammar',
    VOCABULARY: 'vocabulary',
    COHERENCE: 'coherence',
    PRONUNCIATION: 'pronunciation',
} as const;

export type ErrorCategory = typeof ERROR_CATEGORIES[keyof typeof ERROR_CATEGORIES];

export const CREDIT_REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

export type CreditRequestStatus = typeof CREDIT_REQUEST_STATUS[keyof typeof CREDIT_REQUEST_STATUS];

export const CHART_TYPES = {
    LINE_GRAPH: 'line_graph',
    BAR_CHART: 'bar_chart',
    PIE_CHART: 'pie_chart',
    TABLE: 'table',
    PROCESS_DIAGRAM: 'process_diagram',
    MAP: 'map',
    MIXED_CHART: 'mixed_chart',
} as const;

export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];

export const AI_METHODS = {
    GENERATE_FEEDBACK: 'generateFeedback',
    REWRITE_CONTENT: 'rewriteContent',
    IMPROVE_SENTENCE: 'improveSentence',
    GENERATE_EXERCISE: 'generateExerciseContent',
    GENERATE_CHART_DATA: 'generateChartData',
    GENERATE_WRITING_REPORT: 'generateWritingReport',
    GENERATE_CORRECTION: 'generateCorrection',
    ANALYZE_WEAKNESSES: 'analyzeWeaknesses',
    ANALYZE_CHART_IMAGE: 'analyzeChartImage',
} as const;

export type AIMethod = typeof AI_METHODS[keyof typeof AI_METHODS];

// ── Notifications ──

export const NOTIFICATION_TYPES = {
    EVALUATION_COMPLETE: 'evaluation_complete',
    CREDITS_RECEIVED: 'credits_received',
    CREDITS_LOW: 'credits_low',
    CREDIT_REQUEST_APPROVED: 'credit_request_approved',
    CREDIT_REQUEST_REJECTED: 'credit_request_rejected',
    CREDIT_REQUEST_NEW: 'credit_request_new',
    WELCOME: 'welcome',
    SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_ENTITY_TYPES = {
    ATTEMPT: 'attempt',
    CREDIT_TRANSACTION: 'credit_transaction',
    CREDIT_REQUEST: 'credit_request',
    USER: 'user',
} as const;

export type NotificationEntityType = typeof NOTIFICATION_ENTITY_TYPES[keyof typeof NOTIFICATION_ENTITY_TYPES];
