import { getStudentProgress } from "../../actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ATTEMPT_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Target, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/global/back-button";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { student, attempts } = await getStudentProgress(id);

    const evaluated = attempts.filter((a) => a.score != null);
    const avgScore = evaluated.length > 0
        ? Math.round(evaluated.reduce((sum, a) => sum + (a.score || 0), 0) / evaluated.length * 10) / 10
        : null;

    const getInitials = () => {
        if (student.full_name) {
            return student.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
        }
        return student.email.substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6 p-6">
            <BackButton href="/teacher/students" label="Back to Students" />

            {/* Student Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 border-2 border-slate-100">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-lg">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-black font-outfit text-slate-900">
                            {student.full_name || student.email.split("@")[0]}
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">{student.email}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                        <Target className="h-4 w-4 text-indigo-500" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target</p>
                            <p className="text-sm font-black text-slate-900">Band {student.target_score}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attempts</p>
                            <p className="text-sm font-black text-slate-900">{attempts.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                        <Target className="h-4 w-4 text-amber-500" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Score</p>
                            <p className="text-sm font-black text-slate-900">{avgScore ?? "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Joined</p>
                            <p className="text-sm font-black text-slate-900">{new Date(student.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attempt History */}
            <div className="space-y-4">
                <h2 className="text-xl font-black font-outfit text-slate-900">Attempt History</h2>

                {attempts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-medium">
                        No attempts yet.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {attempts.map((attempt) => (
                                <div key={attempt.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 mb-1">
                                            {attempt.exercises?.type
                                                ? attempt.exercises.type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                                                : "Exercise"}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            {new Date(attempt.created_at).toLocaleDateString()} at{" "}
                                            {new Date(attempt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {attempt.score != null && (
                                            <span className="text-sm font-black text-indigo-600">
                                                Band {attempt.score}
                                            </span>
                                        )}
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                            attempt.state === ATTEMPT_STATES.EVALUATED
                                                ? "bg-emerald-50 text-emerald-600"
                                                : attempt.state === ATTEMPT_STATES.SUBMITTED
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-slate-50 text-slate-500"
                                        )}>
                                            {attempt.state}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
