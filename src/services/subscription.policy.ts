import { UserProfile } from "@/types";

export class SubscriptionPolicy {
    private static FREE_DAILY_LIMIT = 5;

    static canAccessFeature(user: UserProfile, feature: string): boolean {
        // Business Rule: Premium users have unlimited access
        if (user.is_premium) return true;

        // Business Rule: Mock tests are premium only
        if (feature === "mock_test") return false;

        // Business Rule: Free users have daily limits for AI features
        const aiFeatures = ["writing_evaluation", "speaking_evaluation", "rewriter"];
        if (aiFeatures.includes(feature)) {
            return user.daily_quota_used < SubscriptionPolicy.FREE_DAILY_LIMIT;
        }

        return true;
    }

    static getRemainingQuota(user: UserProfile): number {
        if (user.is_premium) return Infinity;
        return Math.max(0, SubscriptionPolicy.FREE_DAILY_LIMIT - user.daily_quota_used);
    }

    static getLimitReason(user: UserProfile, feature: string): string | null {
        if (this.canAccessFeature(user, feature)) return null;
        return `You have reached your daily limit of ${SubscriptionPolicy.FREE_DAILY_LIMIT} free reports. Upgrade to Premium for unlimited access.`;
    }
}
