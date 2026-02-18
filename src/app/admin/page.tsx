import { getAdminStats, getAdminAttempts } from "./actions";
import {
    Users,
    FileText,
    Activity,
    ShieldCheck,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { ATTEMPT_STATES } from "@/lib/constants"

export default async function AdminDashboard() {
    const statsData = await getAdminStats();
    const recentAttempts = await getAdminAttempts(5);

    const stats = [
        { label: "Total Users", value: statsData.totalUsers.toLocaleString(), change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Active Exercises", value: statsData.activeExercises.toLocaleString(), change: "+2", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Today's Attempts", value: statsData.todayAttempts.toLocaleString(), change: "+24%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Premium Users", value: statsData.premiumUsers.toLocaleString(), change: "+5%", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black font-outfit text-slate-900">Admin Overview</h1>
                    <p className="text-muted-foreground font-medium">Real-time platform performance and data.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm">
                        <Search className="h-4 w-4" /> Global Search
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg, stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-emerald-600 text-xs font-black bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-3xl font-black font-outfit text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black font-outfit text-slate-900">Recent Activity</h2>
                        <Link href="/admin/attempts" className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                            View All <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {recentAttempts.map((attempt) => (
                                <div key={attempt.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                            {attempt.user_profiles?.email?.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-none mb-1">
                                                {attempt.user_profiles?.email}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500">
                                                Submitted {attempt.exercises?.type ? (
                                                    <span className="font-bold border-b border-primary/20">{attempt.exercises.type.replace('_', ' ')}</span>
                                                ) : `exercise ${attempt.exercise_id?.substring(0, 8)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                            attempt.state === ATTEMPT_STATES.EVALUATED ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                        )}>
                                            {attempt.state}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">
                                            {new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentAttempts.length === 0 && (
                                <div className="p-12 text-center text-slate-400 font-medium">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black font-outfit text-slate-900">Quick Tools</h2>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                        <Link href="/admin/exercises" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FileText className="h-4 w-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-black text-slate-700">New Exercise</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </Link>

                        <Link href="/admin/credits" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="text-sm font-black text-slate-700">Manage Packages</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </Link>

                        <div className="pt-4 border-t border-slate-100">
                            <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-black shadow-sm hover:opacity-90 transition">
                                Export Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
