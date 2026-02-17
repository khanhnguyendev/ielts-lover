import { IUserRepository, IFeaturePricingRepository, ICreditTransactionRepository } from "@/repositories/interfaces";
import { UserProfile } from "@/types";
import { CreditPolicy } from "./credit.policy";
import { Logger, withTrace } from "@/lib/logger";

const logger = new Logger("CreditService");

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
        private transactionRepo: ICreditTransactionRepository
    ) { }

    /**
     * Lazy check for daily credit grant.
     * Replenishes credits if 24 hours have passed since the last grant.
     */
    async ensureDailyGrant(userId: string): Promise<void> {
        return withTrace(async () => {
            try {
                const user = await this.userRepo.getById(userId);
                if (!user) return;

                const now = new Date();
                const lastGrant = new Date(user.last_daily_grant_at);
                const diffMs = now.getTime() - lastGrant.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                if (diffHours >= 24) {
                    const grantAmount = user.is_premium ? CreditPolicy.DAILY_GRANT_PREMIUM : CreditPolicy.DAILY_GRANT_FREE;

                    await this.userRepo.update(userId, {
                        credits_balance: user.credits_balance + grantAmount,
                        last_daily_grant_at: now.toISOString()
                    });

                    await this.transactionRepo.create({
                        user_id: userId,
                        amount: grantAmount,
                        type: "daily_grant",
                        description: "Daily StarCredits replenishment"
                    });

                    logger.info("Daily credit grant applied", { userId, amount: grantAmount });
                }
            } catch (error) {
                logger.error("Failed to apply daily grant", { error, userId });
                throw error;
            }
        });
    }

    /**
     * Deducts credits based on feature pricing.
     * Includes lazy grant check.
     */
    async billUser(userId: string, featureKey: string): Promise<boolean> {
        return withTrace(async () => {
            try {
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
                await (this.userRepo as any).deductCredits(userId, pricing.cost_per_unit);

                // 5. Log transaction
                const descriptionMap: Record<string, string> = {
                    "writing_evaluation": "Writing Task Evaluation",
                    "speaking_evaluation": "Speaking Practice Assessment",
                    "text_rewriter": "IELTS Text Rewriter",
                    "mock_test": "Full Mock Test Access"
                };

                const description = descriptionMap[featureKey] || `Feature Usage: ${featureKey.replace(/_/g, ' ')}`;

                await this.transactionRepo.create({
                    user_id: userId,
                    amount: -pricing.cost_per_unit,
                    type: "usage",
                    description: description
                });

                logger.info("User billed successfully", { userId, featureKey, amount: pricing.cost_per_unit });
                return true;
            } catch (error) {
                if (error instanceof InsufficientFundsError) {
                    logger.warn("User billing failed: Insufficient funds", { userId, featureKey });
                } else {
                    logger.error("User billing failed", { error, userId, featureKey });
                }
                throw error;
            }
        });
    }

    /**
     * Manual grant for rewards or gift codes.
     */
    async rewardUser(userId: string, amount: number, type: "reward" | "gift_code", description: string): Promise<void> {
        return withTrace(async () => {
            try {
                await (this.userRepo as any).addCredits(userId, amount);

                await this.transactionRepo.create({
                    user_id: userId,
                    amount: amount,
                    type: type,
                    description: description
                });

                logger.info("User rewarded successfully", { userId, amount, type });
            } catch (error) {
                logger.error("Failed to reward user", { error, userId, amount, type });
                throw error;
            }
        });
    }

    /**
     * Specific Bonus: Invite Friend
     */
    async grantInviteBonus(userId: string, friendEmail: string): Promise<void> {
        await this.rewardUser(
            userId,
            CreditPolicy.INVITE_FRIEND_BONUS,
            "reward",
            `Bonus for inviting ${friendEmail}`
        );
    }

    /**
     * Specific Bonus: Event Bonus
     */
    async grantEventBonus(userId: string, eventName: string): Promise<void> {
        await this.rewardUser(
            userId,
            CreditPolicy.EVENT_BONUS_DEFAULT,
            "reward",
            `Event bonus: ${eventName}`
        );
    }

    /**
     * Specific Bonus: System Grant / Gift Code
     */
    async applyGiftCode(userId: string, code: string, amount: number = CreditPolicy.GIFT_CODE_DEFAULT): Promise<void> {
        await this.rewardUser(
            userId,
            amount,
            "gift_code",
            `Gift code Applied: ${code}`
        );
    }

    /**
     * Specific Bonus: Welcome Grant
     */
    async grantWelcomeBonus(userId: string): Promise<void> {
        await this.rewardUser(
            userId,
            CreditPolicy.SYSTEM_GRANT_WELCOME,
            "reward",
            "Welcome to IELTS Lover!"
        );
    }
}
