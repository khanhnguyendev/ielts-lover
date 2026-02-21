"use server";

import { getCurrentUser } from "@/app/actions";
import { AdminPolicy } from "@/services/admin.policy";
import { TeacherService } from "@/services/teacher.service";
import { TeacherStudentRepository } from "@/repositories/teacher-student.repository";
import { CreditRequestRepository } from "@/repositories/credit-request.repository";
import { AttemptRepository } from "@/repositories/attempt.repository";
import { UserRepository } from "@/repositories/user.repository";
import { CreditTransactionRepository } from "@/repositories/transaction.repository";
import { FeaturePricingRepository } from "@/repositories/pricing.repository";
import { SystemSettingsRepository } from "@/repositories/system-settings.repository";
import { CreditService } from "@/services/credit.service";
import { traceService } from "@/lib/aop";
import { revalidatePath } from "next/cache";

const teacherStudentRepo = traceService(new TeacherStudentRepository(), "TeacherStudentRepository");
const creditRequestRepo = traceService(new CreditRequestRepository(), "CreditRequestRepository");
const attemptRepo = traceService(new AttemptRepository(), "AttemptRepository");
const userRepo = traceService(new UserRepository(), "UserRepository");
const transactionRepo = traceService(new CreditTransactionRepository(), "CreditTransactionRepository");
const pricingRepo = traceService(new FeaturePricingRepository(), "FeaturePricingRepository");
const settingsRepo = traceService(new SystemSettingsRepository(), "SystemSettingsRepository");
const creditService = traceService(new CreditService(userRepo, pricingRepo, transactionRepo, settingsRepo), "CreditService");

const teacherService = traceService(
    new TeacherService(teacherStudentRepo, creditRequestRepo, attemptRepo, userRepo, creditService),
    "TeacherService"
);

async function checkTeacher() {
    const user = await getCurrentUser();
    if (!AdminPolicy.canAccessTeacher(user)) {
        throw new Error("Unauthorized");
    }
    return user!;
}

export async function getMyStudents() {
    const user = await checkTeacher();
    return teacherService.getStudentsWithProgress(user.id);
}

export async function getStudentProgress(studentId: string) {
    const user = await checkTeacher();
    return teacherService.getStudentDetail(user.id, studentId);
}

export async function createCreditRequest(studentId: string, amount: number, reason: string) {
    const user = await checkTeacher();
    const result = await teacherService.requestCredits(user.id, studentId, amount, reason);
    revalidatePath("/teacher/credit-requests");
    return result;
}

export async function getMyCreditRequests() {
    const user = await checkTeacher();
    return teacherService.getMyCreditRequests(user.id);
}

export async function getTeacherStats() {
    const user = await checkTeacher();
    const students = await teacherService.getStudentsWithProgress(user.id);
    const requests = await teacherService.getMyCreditRequests(user.id);
    const pendingRequests = requests.filter((r) => r.status === "pending");

    return {
        studentCount: students.length,
        pendingRequestCount: pendingRequests.length,
        totalAttempts: students.reduce((sum, s) => sum + s.attempt_count, 0),
    };
}
