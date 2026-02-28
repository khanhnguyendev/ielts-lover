"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, FileText, Activity, Target, Sparkles, Clock } from "lucide-react"
import { Attempt } from "@/types"
import { getBandScoreConfig } from "@/lib/score-utils"

export interface ReportComponentProps {
    attempt: Attempt;
    onReevaluate: (id: string) => void;
    reevaluatingId: string | null;
    reevalStep: number;
}

const REEVAL_STEP_LABELS = ["", "Submitting...", "Analyzing...", "Scoring..."]

export function DetailTag({ icon: Icon, label, color = "primary" }: { icon: React.ElementType, label: string, color?: "primary" | "secondary" }) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl transition-all duration-300",
            color === "primary" ? "bg-primary/5 border-primary/10 text-primary" : "bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500"
        )}>
            <Icon size={12} className={cn(color === "primary" ? "text-primary" : "text-slate-400")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    )
}

export function RecentReportCard({ attempt, onReevaluate, reevaluatingId, reevalStep }: ReportComponentProps) {
    const config = getBandScoreConfig(attempt.score);
    const dateStr = formatDate(attempt.created_at);
    const timeStr = formatTime(attempt.created_at);
    const isWriting = attempt.exercises?.type?.startsWith('writing');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl transition-all duration-700 hover:shadow-primary/20 hover:border-primary/30"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none duration-1000">
                <FileText size={200} />
            </div>

            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative flex flex-col md:flex-row items-center gap-10">
                {/* Score Orb Container */}
                <div className="relative shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        className={cn(
                            "w-36 h-36 rounded-[2.5rem] flex flex-col items-center justify-center border-4 transition-all duration-500 shadow-2xl relative z-10",
                            config.bg, config.border, config.color
                        )}
                    >
                        <span className="text-5xl font-black font-outfit leading-none mb-1 tracking-tighter">{attempt.score != null ? attempt.score : "--"}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Band Score</span>
                    </motion.div>
                    <div className={cn("absolute inset-0 blur-2xl opacity-20 transition-all duration-500 group-hover:opacity-40", config.bg)} />
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-left space-y-5">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-sm border border-black/5 dark:border-white/5",
                                isWriting ? "bg-purple-100/50 text-purple-600 dark:text-purple-400" : "bg-blue-100/50 text-blue-600 dark:text-blue-400"
                            )}>
                                {isWriting ? "✍️ Writing Lab" : "🎤 Speaking Lab"}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-black/20 px-3 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
                                <Clock size={12} className="text-slate-300" />
                                {dateStr}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight leading-tight">
                            {attempt.exercises?.title || "IELTS Practice Session"}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <DetailTag icon={Activity} label={attempt.exercises?.type?.replace('_', ' ') || "Practice"} color="secondary" />
                        <DetailTag icon={Target} label={`CEFR ${config.cefr}`} />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                            <Sparkles size={12} className="text-amber-500" />
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">AI Scored</span>
                        </div>
                    </div>
                </div>

                {/* Actions Column */}
                <div className="flex flex-col gap-4 min-w-[180px] w-full md:w-auto">
                    {attempt.state === "SUBMITTED" ? (
                        <Button
                            onClick={() => onReevaluate(attempt.id)}
                            disabled={reevaluatingId === attempt.id}
                            className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                        >
                            {reevaluatingId === attempt.id ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {REEVAL_STEP_LABELS[reevalStep] || "Analyzing..."}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Get AI Feedback
                                </span>
                            )}
                        </Button>
                    ) : (
                        <Link href={`/dashboard/reports/${attempt.id}`} className="w-full">
                            <Button className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border border-white/10">
                                Full Analysis <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
