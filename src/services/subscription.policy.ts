import { UserProfile } from "@/types";

export class SubscriptionPolicy {
    static canAccessFeature(user: UserProfile, feature: string, featureCost: number = 0): boolean {
        // Business Rule: Premium users have unlimited access
        if (user.is_premium) return true;

        // Business Rule: Mock tests are premium only
        if (feature === "mock_test") return false;

        // Business Rule: Check if credits are sufficient
        if (featureCost > 0) {
            return user.credits_balance >= featureCost;
        }

        return true;
    }

    static getBalance(user: UserProfile): number {
        return user.credits_balance;
    }

    static getLimitReason(user: UserProfile, feature: string, featureCost: number = 0): string | null {
        if (this.canAccessFeature(user, feature, featureCost)) return null;

        if (feature === "mock_test") return "Mock tests are exclusively for Premium members.";

        return `Insufficient StarCredits. This action requires ${featureCost} Credits, but you only have ${user.credits_balance}.`;
    }
}
