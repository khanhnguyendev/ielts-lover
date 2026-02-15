import { UserProfile, Exercise, Attempt } from "@/types";

export interface IUserRepository {
    getById(id: string): Promise<UserProfile | null>;
    update(id: string, data: Partial<UserProfile>): Promise<void>;
    incrementQuota(id: string): Promise<void>;
}

export interface IExerciseRepository {
    getById(id: string): Promise<Exercise | null>;
    listByType(type: string): Promise<Exercise[]>;
}

export interface IAttemptRepository {
    create(data: Omit<Attempt, "id" | "created_at">): Promise<Attempt>;
    getById(id: string): Promise<Attempt | null>;
    update(id: string, data: Partial<Attempt>): Promise<void>;
    listByUserId(userId: string): Promise<Attempt[]>;
}
