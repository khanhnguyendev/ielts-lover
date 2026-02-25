"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, FileText, Activity, Target } from "lucide-react"
import { Attempt } from "@/types"
import { getBandScoreConfig } from "@/lib/score-utils"

export interface ReportComponentProps {
    attempt: Attempt;
    onReevaluate: (id: string) => void;
    reevaluatingId: string | null;
    reevalStep: number;
}

const REEVAL_STEP_LABELS = ["", "Submitting...", "Analyzing...", "Scoring..."]

export function DetailTag({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
            <Icon size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-600 capitalize">{label}</span>
        </div>
    )
}

export function RecentReportCard({ attempt, onReevaluate, reevaluatingId, reevalStep }: ReportComponentProps) {
    const config = getBandScoreConfig(attempt.score);
    const dateObj = new Date(attempt.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const isWriting = attempt.exercises?.type?.startsWith('writing');

    return (
        <div className="group relative overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <FileText size={180} />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-10">
                {/* Score Orb */}
                <div className={cn(
                    "w-32 h-32 rounded-[2.5rem] flex flex-col items-center justify-center border-4 transition-transform group-hover:scale-105 duration-500 shadow-lg",
                    config.bg, config.border, config.color
                )}>
                    <span className="text-4xl font-black font-outfit leading-none mb-1">{attempt.score || "--"}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Band Score</span>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                                isWriting ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {isWriting ? "✍️ Writing" : "🎤 Speaking"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr} · {timeStr}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                            {attempt.exercises?.title || "IELTS Practice Session"}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <DetailTag icon={Activity} label={attempt.exercises?.type?.replace('_', ' ') || "Practice"} />
                        <DetailTag icon={Target} label={`CEFR ${config.cefr}`} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[160px]">
                    {attempt.state === "SUBMITTED" ? (
                        <Button
                            onClick={() => onReevaluate(attempt.id)}
                            disabled={reevaluatingId === attempt.id}
                            className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-primary/20"
                        >
                            {reevaluatingId === attempt.id ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {REEVAL_STEP_LABELS[reevalStep] || "Analyzing..."}
                                </span>
                            ) : "Get AI Feedback"}
                        </Button>
                    ) : (
                        <Link href={`/dashboard/reports/${attempt.id}`}>
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-slate-200">
                                Full Report <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
