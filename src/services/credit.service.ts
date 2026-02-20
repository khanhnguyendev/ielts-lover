import { TRANSACTION_TYPES, TransactionType, FEATURE_KEYS } from "@/lib/constants";
import { IUserRepository, IFeaturePricingRepository, ICreditTransactionRepository, ISystemSettingsRepository } from "../repositories/interfaces";

export class InsufficientFundsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InsufficientFundsError";
    }
}

export class CreditService {
    constructor(
        private userRepo: IUserRepository,
        private pricingRepo: IFeaturePricingRepository,
        private transactionRepo: ICreditTransactionRepository,
        private settingsRepo: ISystemSettingsRepository
    ) { }

    /**
     * Lazy check for daily credit grant.
     * Replenishes credits if 24 hours have passed since the last grant.
     */
    async ensureDailyGrant(userId: string): Promise<void> {
        const user = await this.userRepo.getById(userId);
        if (!user) return;

        const now = new Date();
        const lastGrant = new Date(user.last_daily_grant_at);
        const diffMs = now.getTime() - lastGrant.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 24) {
            const grantAmount = await this.settingsRepo.getByKey<number>("DAILY_GRANT_FREE") || 5;

            await this.userRepo.update(userId, {
                credits_balance: user.credits_balance + grantAmount,
                last_daily_grant_at: now.toISOString()
            });

            await this.transactionRepo.create({
                user_id: userId,
                amount: grantAmount,
                type: TRANSACTION_TYPES.DAILY_GRANT,
                description: "Daily StarCredits replenishment"
            });
        }
    }

    /**
     * Deducts credits based on feature pricing.
     * Includes lazy grant check.
     */
    async billUser(userId: string, featureKey: string, exerciseId?: string): Promise<boolean> {
        // 1. Check for daily grant first
        await this.ensureDailyGrant(userId);

        // 2. Get pricing
        const pricing = await this.pricingRepo.getByKey(featureKey);
        if (!pricing || !pricing.is_active) {
            throw new Error(`Feature ${featureKey} is not available for billing`);
        }

        // 3. Check user balance
        const user = await this.userRepo.getById(userId);
        if (!user) throw new Error("User not found");

        if (user.credits_balance < pricing.cost_per_unit) {
            throw new InsufficientFundsError(`Insufficient StarCredits. Required: ${pricing.cost_per_unit}, Available: ${user.credits_balance}`);
        }

        // 4. Atomic deduction
        await this.userRepo.deductCredits(userId, pricing.cost_per_unit);

        // 5. Log transaction
        const descriptionMap: Record<string, string> = {
            [FEATURE_KEYS.WRITING_EVALUATION]: "Writing Task Evaluation",
            [FEATURE_KEYS.SPEAKING_EVALUATION]: "Speaking Practice Assessment",
            [FEATURE_KEYS.TEXT_REWRITER]: "IELTS Text Rewriter",
            [FEATURE_KEYS.MOCK_TEST]: "Full Mock Test Access",
            [FEATURE_KEYS.DETAILED_CORRECTION]: "Detailed Sentence Correction",
            [FEATURE_KEYS.WEAKNESS_ANALYSIS]: "AI Weakness Analysis",
        };

        const description = descriptionMap[featureKey] || `Feature Usage: ${featureKey.replace(/_/g, ' ')}`;

        await this.transactionRepo.create({
            user_id: userId,
            amount: -pricing.cost_per_unit,
            type: TRANSACTION_TYPES.USAGE,
            feature_key: featureKey,
            exercise_id: exerciseId,
            description: description
        });

        return true;
    }

    /**
     * Manual grant for rewards or gift codes.
     */
    async rewardUser(userId: string, amount: number, type: TransactionType, description: string, grantedByAdmin?: string): Promise<void> {
        const user = await this.userRepo.getById(userId);
        if (!user) throw new Error("User not found");

        await this.userRepo.update(userId, {
            credits_balance: user.credits_balance + amount
        });

        await this.transactionRepo.create({
            user_id: userId,
            amount: amount,
            type: type,
            description: description,
            granted_by_admin: grantedByAdmin
        });
    }

    /**
     * Specific Bonus: Event Bonus
     */
    async grantEventBonus(userId: string, eventName: string): Promise<void> {
        const amount = await this.settingsRepo.getByKey<number>("EVENT_BONUS_DEFAULT") || 5;
        await this.rewardUser(
            userId,
            amount,
            TRANSACTION_TYPES.REWARD,
            `Event bonus: ${eventName}`
        );
    }

    /**
     * Specific Bonus: System Grant / Gift Code
     */
    async applyGiftCode(userId: string, code: string, amount?: number): Promise<void> {
        const giftAmount = amount ?? (await this.settingsRepo.getByKey<number>("GIFT_CODE_DEFAULT") || 20);
        await this.rewardUser(
            userId,
            giftAmount,
            TRANSACTION_TYPES.GIFT_CODE,
            `Gift code Applied: ${code}`
        );
    }

    /**
     * Specific Bonus: Welcome Grant
     */
    async grantWelcomeBonus(userId: string): Promise<void> {
        const amount = await this.settingsRepo.getByKey<number>("SYSTEM_GRANT_WELCOME") || 10;
        await this.rewardUser(
            userId,
            amount,
            TRANSACTION_TYPES.REWARD,
            "Welcome to IELTS Lover!"
        );
    }

    async getBalance(userId: string): Promise<number> {
        const user = await this.userRepo.getById(userId);
        return user?.credits_balance || 0;
    }

    async getTransactions(userId: string) {
        return this.transactionRepo.listByUserId(userId);
    }
}
