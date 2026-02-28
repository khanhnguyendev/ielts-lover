"use client";

import { useState, useEffect } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Mic,
    ChevronRight,
    Search
} from "lucide-react";
import { getAdminAttempts } from "../actions";
import { PulseLoader } from "@/components/global/pulse-loader";
import { cn, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ATTEMPT_STATES } from "@/lib/constants"

export default function AdminAttemptsPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAttempts();
    }, []);

    async function fetchAttempts() {
        setIsLoading(true);
        try {
            const data = await getAdminAttempts();
            setAttempts(data);
        } catch (error) {
            console.error("Failed to fetch attempts:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getExerciseIcon = (type: string) => {
        if (type?.startsWith('writing')) return <FileText className="h-3.5 w-3.5 text-purple-600" />;
        if (type?.startsWith('speaking')) return <Mic className="h-3.5 w-3.5 text-blue-600" />;
        return <AlertCircle className="h-3.5 w-3.5 text-slate-400" />;
    };

    const filteredAttempts = attempts.filter(a =>
        a.user_profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.exercise_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: DataTableColumn<any>[] = [
        {
            key: "student",
            header: "Student",
            render: (attempt) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] border border-slate-200/50 dark:border-white/10 shadow-inner">
                        {attempt.user_profiles?.email?.substring(0, 2)}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {attempt.user_profiles?.email}
                    </span>
                </div>
            )
        },
        {
            key: "exercise",
            header: "Exercise",
            render: (attempt) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm transition-transform group-hover:scale-110 duration-500">
                        {getExerciseIcon(attempt.exercises?.type)}
                    </div>
                    <div className="flex flex-col">
                        <div
                            className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-primary transition-all leading-none mb-1 flex items-center gap-1.5 cursor-pointer group/id"
                            onClick={() => {
                                navigator.clipboard.writeText(attempt.exercise_id);
                                // Optional: add a toast here if available, but for now the interaction is enough
                            }}
                        >
                            <span className="bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-100 dark:border-white/10 group-hover/id:border-primary/20 transition-colors">
                                ID: {attempt.exercise_id?.substring(0, 12)}...
                            </span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none italic">
                            {attempt.exercises?.type?.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            align: "center",
            render: (attempt) => (
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                    attempt.state === ATTEMPT_STATES.EVALUATED
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : attempt.state === ATTEMPT_STATES.SUBMITTED
                            ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                            : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
                )}>
                    {attempt.state === ATTEMPT_STATES.EVALUATED && <CheckCircle size={12} />}
                    {attempt.state === ATTEMPT_STATES.SUBMITTED && <Clock size={12} />}
                    {attempt.state}
                </div>
            )
        },
        {
            key: "score",
            header: "Score",
            align: "center",
            render: (attempt) => (
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-inner overflow-hidden relative group/score">
                    <span className={cn(
                        "text-sm font-black relative z-10",
                        attempt.score ? "text-primary" : "text-slate-300 dark:text-slate-700"
                    )}>
                        {attempt.score || "-"}
                    </span>
                    {attempt.score && (
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/score:opacity-100 transition-opacity duration-500" />
                    )}
                </div>
            )
        },
        {
            key: "date",
            header: "Date & Time",
            align: "center",
            render: (attempt) => (
                <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {formatDate(attempt.created_at)}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                        {formatTime(attempt.created_at)}
                    </p>
                </div>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (attempt) => (
                <Link href={`/dashboard/reports/${attempt.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-95 group/btn">
                        <Eye size={14} className="transition-transform group-hover/btn:-translate-y-0.5" />
                        Audit Report
                        <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                </Link>
            )
        }
    ];

    return (
        <div className="space-y-6 p-6 lg:p-12 max-w-7xl mx-auto">
            <DataTable
                data={filteredAttempts}
                columns={columns}
                rowKey={(a) => a.id}
                isLoading={isLoading}
                loadingText="Scanning Audit Logs..."
                pageSize={10}
                toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black font-outfit text-slate-900 dark:text-white leading-none">Security Audit</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attempt Ledger & Integrity Check</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by student email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-6 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest w-72 shadow-inner"
                            />
                        </div>
                    </div>
                }
                emptyState={{
                    icon: <AlertCircle className="h-8 w-8 text-slate-300" />,
                    title: "Audit record not found",
                    description: "No attempt logs match the current filtering parameters."
                }}
            />
        </div>
    );
}
