export class CreditPolicy {
    // Basic Economy
    static readonly DEFAULT_FEATURE_COST = 1;
    static readonly DAILY_GRANT_FREE = 5;
    static readonly DAILY_GRANT_PREMIUM = 20;

    // Gamification & Rewards
    static readonly INVITE_FRIEND_BONUS = 10;
    static readonly EVENT_BONUS_DEFAULT = 5;
    static readonly GIFT_CODE_DEFAULT = 20;
    static readonly SYSTEM_GRANT_WELCOME = 10;

    // Usage Limits
    static readonly MAX_CARRY_OVER = 100; // Cap credits to prevent excessive accumulation
}
