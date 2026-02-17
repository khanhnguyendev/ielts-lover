import { IUserRepository } from "@/repositories/interfaces";
import { UserProfile } from "@/types";
import { Logger, withTrace } from "@/lib/logger";

const logger = new Logger("UserService");

export class UserService {
    constructor(private userRepo: IUserRepository) { }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        return withTrace(async () => {
            try {
                return await this.userRepo.getById(userId);
            } catch (error) {
                logger.error("Failed to get user profile", { error, userId });
                throw error;
            }
        });
    }

    async updateTargetScore(userId: string, score: number): Promise<void> {
        return withTrace(async () => {
            try {
                if (score < 0 || score > 9) throw new Error("Invalid IELTS score");
                await this.userRepo.update(userId, { target_score: score });
                logger.info("Target score updated", { userId, score });
            } catch (error) {
                logger.error("Failed to update target score", { error, userId, score });
                throw error;
            }
        });
    }

    async checkQuota(userId: string): Promise<boolean> {
        return withTrace(async () => {
            try {
                const user = await this.userRepo.getById(userId);
                if (!user) return false;
                if (user.is_premium) return true;
                return user.daily_quota_used < 2;
            } catch (error) {
                logger.error("Failed to check quota", { error, userId });
                throw error;
            }
        });
    }
}
