import { UserProfile, Exercise, Attempt, ExerciseType } from "@/types";

export interface IUserRepository {
    getById(id: string): Promise<UserProfile | null>;
    update(id: string, data: Partial<UserProfile>): Promise<void>;
    incrementQuota(id: string): Promise<void>;
    listAll(): Promise<UserProfile[]>;
    getPremiumCount(): Promise<number>;
    getTotalCount(): Promise<number>;
}

export interface IExerciseRepository {
    getById(id: string): Promise<Exercise | null>;
    getLatestVersion(type: ExerciseType): Promise<Exercise | null>;
    listByType(type: ExerciseType): Promise<Exercise[]>;
    createVersion(exercise: Omit<Exercise, "id" | "created_at">): Promise<Exercise>;
    getTotalCount(): Promise<number>;
}

export interface IAttemptRepository {
    create(data: Omit<Attempt, "id" | "created_at">): Promise<Attempt>;
    getById(id: string): Promise<Attempt | null>;
    update(id: string, data: Partial<Attempt>): Promise<void>;
    listByUserId(userId: string): Promise<Attempt[]>;
    listAll(limit?: number): Promise<any[]>;
    getTodayCount(): Promise<number>;
}

export type FeaturePricing = {
    id: string;
    feature_key: string;
    cost_per_unit: number;
    is_active: boolean;
};

export interface IFeaturePricingRepository {
    getByKey(key: string): Promise<FeaturePricing | null>;
    listAll(): Promise<FeaturePricing[]>;
    updatePricing(key: string, cost: number): Promise<void>;
}

export type CreditTransaction = {
    id: string;
    user_id: string;
    amount: number;
    type: "daily_grant" | "usage" | "reward" | "gift_code";
    description?: string;
    created_at: string;
};

export interface ICreditTransactionRepository {
    create(transaction: Omit<CreditTransaction, "id" | "created_at">): Promise<CreditTransaction>;
    listByUserId(userId: string): Promise<CreditTransaction[]>;
}
