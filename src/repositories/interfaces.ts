import { TransactionType, SkillType, ErrorCategory, CreditRequestStatus } from "@/lib/constants";
import { UserProfile, Exercise, Attempt, ExerciseType, TeacherStudent, CreditRequest } from "@/types";

export interface IUserRepository {
    getById(id: string): Promise<UserProfile | null>;
    update(id: string, data: Partial<UserProfile>): Promise<void>;
    deductCredits(id: string, amount: number): Promise<void>;
    addCredits(id: string, amount: number): Promise<void>;
    listAll(): Promise<UserProfile[]>;
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
    type: TransactionType;
    feature_key?: string;
    exercise_id?: string;
    granted_by_admin?: string;
    description?: string;
    created_at: string;
};

export interface ICreditTransactionRepository {
    create(transaction: Omit<CreditTransaction, "id" | "created_at">): Promise<CreditTransaction>;
    listByUserId(userId: string): Promise<CreditTransaction[]>;
}

export type SystemSetting = {
    id: string;
    setting_key: string;
    setting_value: any;
    description?: string;
    created_at: string;
    updated_at: string;
};

export interface ISystemSettingsRepository {
    getByKey<T>(key: string): Promise<T | null>;
    listAll(): Promise<SystemSetting[]>;
    updateSetting(key: string, value: any): Promise<void>;
}

export type UserMistake = {
    id: string;
    user_id: string;
    source_attempt_id?: string;
    skill_type: SkillType;
    error_category: ErrorCategory;
    original_context: string;
    correction: string;
    source_sentence?: string;
    explanation?: string;
    created_at: string;
};

export type UserActionPlan = {
    id: string;
    user_id: string;
    plan_data: {
        top_weaknesses: {
            category: string;
            frequency: number;
            description: string;
            severity: 'high' | 'medium' | 'low';
        }[];
        action_items: {
            title: string;
            description: string;
            category: string;
            priority: number;
            examples: { wrong: string; correct: string }[];
        }[];
        summary: string;
    };
    mistakes_analyzed: number;
    created_at: string;
};

export interface IMistakeRepository {
    saveMistakes(mistakes: Omit<UserMistake, 'id' | 'created_at'>[]): Promise<void>;
    getUserMistakes(userId: string, skillType?: SkillType, limit?: number): Promise<UserMistake[]>;
    getMistakeCount(userId: string): Promise<number>;
}

export interface IActionPlanRepository {
    save(plan: Omit<UserActionPlan, 'id' | 'created_at'>): Promise<UserActionPlan>;
    getLatest(userId: string): Promise<UserActionPlan | null>;
}

export interface ITeacherStudentRepository {
    assign(teacherId: string, studentId: string, assignedBy: string): Promise<TeacherStudent>;
    unassign(teacherId: string, studentId: string): Promise<void>;
    getStudentsByTeacher(teacherId: string): Promise<UserProfile[]>;
    getTeachersByStudent(studentId: string): Promise<UserProfile[]>;
    isLinked(teacherId: string, studentId: string): Promise<boolean>;
}

export interface ICreditRequestRepository {
    create(data: { teacher_id: string; student_id: string; amount: number; reason: string }): Promise<CreditRequest>;
    getById(id: string): Promise<CreditRequest | null>;
    listByTeacher(teacherId: string): Promise<CreditRequest[]>;
    listPending(): Promise<CreditRequest[]>;
    listAll(): Promise<CreditRequest[]>;
    updateStatus(id: string, status: CreditRequestStatus, reviewedBy: string, adminNote?: string): Promise<void>;
}
