"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Sparkles, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { WritingFeedback } from "./writing-feedback";
import { ScoreOverview } from "@/components/reports/score-overview";
import { WritingFeedbackResult } from "@/types/writing";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    score?: number;
    feedback?: string; // JSON string or raw text
    attemptId?: string;
    type: "writing_task1" | "writing_task2";
    originalText?: string;
    isUnlocked?: boolean;
    initialCorrection?: any[] | { edits: any[] } | null;
    targetScore?: number;
}

export function FeedbackModal({
    open,
    onOpenChange,
    score,
    feedback,
    attemptId,
    type,
    originalText,
    isUnlocked,
    initialCorrection,
    targetScore
}: FeedbackModalProps) {
    const router = useRouter();

    let parsedFeedback: any = {};
    try {
        parsedFeedback = feedback ? JSON.parse(feedback) : {};
    } catch (e) {
        parsedFeedback = { raw: feedback };
    }

    // Determine band score color (fallback for legacy UI)
    const getScoreColor = (score: number) => {
        if (score >= 8.0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 6.5) return "text-blue-600 bg-blue-50 border-blue-200";
        return "text-orange-600 bg-orange-50 border-orange-200";
    };

    const scoreColorClass = score ? getScoreColor(score) : "";
    const isStructuredWritingFeedback = (type === "writing_task1" || type === "writing_task2") && parsedFeedback.detailed_scores;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "bg-white rounded-[24px] p-0 border-none shadow-2xl transition-all duration-500 flex flex-col max-h-[90vh]",
                isStructuredWritingFeedback ? "sm:max-w-3xl" : "sm:max-w-xl"
            )}>
                {!isStructuredWritingFeedback ? (
                    <div className="bg-[#F9FAFB] p-6 border-b text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border">
                            <Award className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black font-outfit text-slate-900">
                                Evaluation Complete!
                            </DialogTitle>
                            <p className="text-muted-foreground font-medium text-[11px] mt-0.5">
                                AI Assessment: {type === "writing_task1" ? "Task 1" : "Task 2"}
                            </p>
                        </div>

                        {(score !== undefined && score !== null) && (
                            <div className={`inline-flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${scoreColorClass}`}>
                                <span className="text-2xl font-black">{score.toFixed(1)}</span>
                                <span className="text-[8px] uppercase font-black tracking-widest opacity-80">Band</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6 pb-0">
                        <DialogTitle className="sr-only">Writing Evaluation Result</DialogTitle>
                        <ScoreOverview
                            score={score || parsedFeedback.overall_score || 1.0}
                            title="Overall Assessment"
                            subtitle="Expert Band Score"
                            className="rounded-[24px] shadow-none border-slate-100 bg-slate-50/50"
                        />
                    </div>
                )}

                <div className={cn(
                    "space-y-4 flex-1 overflow-y-auto min-h-0",
                    isStructuredWritingFeedback ? "p-6 pt-4" : "p-6"
                )}>
                    {isStructuredWritingFeedback ? (
                        <WritingFeedback
                            result={parsedFeedback as WritingFeedbackResult}
                            type={type}
                            hideHeader={true}
                            attemptId={attemptId}
                            originalText={originalText}
                            isUnlocked={isUnlocked}
                            initialCorrection={initialCorrection}
                            targetScore={targetScore}
                        />
                    ) : (
                        <div className="space-y-3">
                            {parsedFeedback.detailed_feedback ? (
                                <div className="space-y-3">
                                    {parsedFeedback.detailed_feedback.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                                            <div className="flex items-center gap-2">
                                                {item.type === "strength" ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : (
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                                )}
                                                <span className="font-bold text-[11px] text-slate-900 capitalize">{item.aspect}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{item.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {parsedFeedback.raw || "No detailed feedback available."}
                                </div>
                            )}

                            {parsedFeedback.improved_sample && (
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                                    <h4 className="flex items-center gap-2 font-bold text-indigo-900 text-[10px] uppercase">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                        AI Improved Version
                                    </h4>
                                    <p className="text-[11px] text-indigo-900/80 leading-relaxed italic">
                                        "{parsedFeedback.improved_sample}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 bg-slate-50 border-t flex flex-row gap-2">
                    <div className="flex-1 flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg h-10 px-4 font-bold text-xs">
                            Close
                        </Button>
                        <Button onClick={() => router.push("/dashboard/writing")} className="rounded-lg h-10 px-4 font-bold text-[10px] uppercase tracking-wider text-slate-500 hover:bg-slate-200" variant="ghost">
                            Writing Hub
                        </Button>
                    </div>
                    {attemptId && (
                        <Button
                            onClick={() => router.push(`/dashboard/reports/${attemptId}`)}
                            className="rounded-lg h-10 px-5 font-black text-[10px] uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg"
                        >
                            Full Report
                            <Sparkles className="ml-1.5 h-3 w-3 fill-white" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
