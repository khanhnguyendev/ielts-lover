import { getTeacherStats, getMyStudents } from "./actions";
import { Users, HandCoins, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StudentCard } from "@/components/teacher/student-card";

export default async function TeacherDashboard() {
    const [stats, students] = await Promise.all([
        getTeacherStats(),
        getMyStudents(),
    ]);

    const statCards = [
        { label: "My Students", value: stats.studentCount, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Attempts", value: stats.totalAttempts, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Pending Requests", value: stats.pendingRequestCount, icon: HandCoins, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-black font-outfit text-slate-900">Teacher Overview</h1>
                <p className="text-muted-foreground font-medium">Monitor your students and manage credit requests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg, stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-3xl font-black font-outfit text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Students */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black font-outfit text-slate-900">Recent Students</h2>
                    {students.length > 3 && (
                        <Link href="/teacher/students" className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1">
                            View All <ChevronRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>

                {students.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No students assigned yet.</p>
                        <p className="text-sm text-slate-400 mt-1">Ask your admin to link students to your account.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students.slice(0, 6).map((student) => (
                            <StudentCard key={student.id} student={student} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
