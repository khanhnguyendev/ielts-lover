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
}
