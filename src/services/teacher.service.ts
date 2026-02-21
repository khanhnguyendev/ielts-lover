import { TRANSACTION_TYPES, CREDIT_REQUEST_STATUS } from "@/lib/constants";
import { ITeacherStudentRepository, ICreditRequestRepository, IAttemptRepository, IUserRepository } from "@/repositories/interfaces";
import { CreditService } from "./credit.service";
import { UserProfile, CreditRequest } from "@/types";

export type StudentSummary = UserProfile & {
    attempt_count: number;
    avg_score: number | null;
    last_attempt_at: string | null;
};

export class TeacherService {
    constructor(
        private teacherStudentRepo: ITeacherStudentRepository,
        private creditRequestRepo: ICreditRequestRepository,
        private attemptRepo: IAttemptRepository,
        private userRepo: IUserRepository,
        private creditService: CreditService,
    ) {}

    async getStudentsWithProgress(teacherId: string): Promise<StudentSummary[]> {
        const students = await this.teacherStudentRepo.getStudentsByTeacher(teacherId);

        const summaries: StudentSummary[] = await Promise.all(
            students.map(async (student) => {
                const attempts = await this.attemptRepo.listByUserId(student.id);
                const evaluated = attempts.filter((a) => a.score != null);
                const avgScore = evaluated.length > 0
                    ? evaluated.reduce((sum, a) => sum + (a.score || 0), 0) / evaluated.length
                    : null;
                const lastAttempt = attempts.length > 0 ? attempts[0].created_at : null;

                return {
                    ...student,
                    attempt_count: attempts.length,
                    avg_score: avgScore ? Math.round(avgScore * 10) / 10 : null,
                    last_attempt_at: lastAttempt,
                };
            })
        );

        return summaries;
    }

    async getStudentDetail(teacherId: string, studentId: string) {
        const isLinked = await this.teacherStudentRepo.isLinked(teacherId, studentId);
        if (!isLinked) throw new Error("You are not linked to this student");

        const student = await this.userRepo.getById(studentId);
        if (!student) throw new Error("Student not found");

        const attempts = await this.attemptRepo.listByUserId(studentId);

        return { student, attempts };
    }

    async requestCredits(teacherId: string, studentId: string, amount: number, reason: string): Promise<CreditRequest> {
        const isLinked = await this.teacherStudentRepo.isLinked(teacherId, studentId);
        if (!isLinked) throw new Error("You are not linked to this student");

        if (amount <= 0) throw new Error("Amount must be positive");
        if (!reason.trim()) throw new Error("Reason is required");

        return this.creditRequestRepo.create({
            teacher_id: teacherId,
            student_id: studentId,
            amount,
            reason: reason.trim(),
        });
    }

    async approveCreditRequest(requestId: string, adminId: string, adminNote?: string): Promise<void> {
        const request = await this.creditRequestRepo.getById(requestId);
        if (!request) throw new Error("Credit request not found");
        if (request.status !== CREDIT_REQUEST_STATUS.PENDING) {
            throw new Error("Only pending requests can be approved");
        }

        await this.creditService.rewardUser(
            request.student_id,
            request.amount,
            TRANSACTION_TYPES.TEACHER_GRANT,
            `Teacher credit grant: ${request.reason}`,
            adminId
        );

        await this.creditRequestRepo.updateStatus(requestId, CREDIT_REQUEST_STATUS.APPROVED, adminId, adminNote);
    }

    async rejectCreditRequest(requestId: string, adminId: string, adminNote?: string): Promise<void> {
        const request = await this.creditRequestRepo.getById(requestId);
        if (!request) throw new Error("Credit request not found");
        if (request.status !== CREDIT_REQUEST_STATUS.PENDING) {
            throw new Error("Only pending requests can be rejected");
        }

        await this.creditRequestRepo.updateStatus(requestId, CREDIT_REQUEST_STATUS.REJECTED, adminId, adminNote);
    }

    async assignStudent(teacherId: string, studentId: string, adminId: string) {
        const teacher = await this.userRepo.getById(teacherId);
        if (!teacher) throw new Error("Teacher not found");

        const student = await this.userRepo.getById(studentId);
        if (!student) throw new Error("Student not found");

        return this.teacherStudentRepo.assign(teacherId, studentId, adminId);
    }

    async unassignStudent(teacherId: string, studentId: string) {
        return this.teacherStudentRepo.unassign(teacherId, studentId);
    }

    async getMyCreditRequests(teacherId: string): Promise<CreditRequest[]> {
        return this.creditRequestRepo.listByTeacher(teacherId);
    }

    async getAllCreditRequests(): Promise<CreditRequest[]> {
        return this.creditRequestRepo.listAll();
    }

    async getPendingCreditRequests(): Promise<CreditRequest[]> {
        return this.creditRequestRepo.listPending();
    }
}
