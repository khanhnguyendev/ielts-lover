// This is a mock implementation for Phase 3. Real Supabase integration will follow.
import { UserProfile } from "@/types";
import { IUserRepository } from "./interfaces";

export class UserRepository implements IUserRepository {
    async getById(id: string): Promise<UserProfile | null> {
        return {
            id,
            email: "user@example.com",
            target_score: 7.0,
            test_type: "academic",
            is_premium: false,
            daily_quota_used: 0,
            last_quota_reset: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
    }

    async update(id: string, data: Partial<UserProfile>): Promise<void> {
        console.log(`Updating user ${id}`, data);
    }

    async incrementQuota(id: string): Promise<void> {
        console.log(`Incrementing quota for user ${id}`);
    }
}
