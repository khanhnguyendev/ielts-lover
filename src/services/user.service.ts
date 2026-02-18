import { DEFAULT_QUOTAS } from "@/lib/constants";
import { IUserRepository } from "../repositories/interfaces";
import { UserProfile } from "@/types";

export class UserService {
    constructor(private userRepo: IUserRepository) { }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        return await this.userRepo.getById(userId);
    }

    async updateTargetScore(userId: string, score: number): Promise<void> {
        if (score < 0 || score > 9) throw new Error("Invalid IELTS score");
        await this.userRepo.update(userId, { target_score: score });
    }

    async checkQuota(userId: string): Promise<boolean> {
        const user = await this.userRepo.getById(userId);
        if (!user) return false;
        if (user.is_premium) return true;
        return user.daily_quota_used < DEFAULT_QUOTAS.FREE_DAILY_LIMIT;
    }
}
