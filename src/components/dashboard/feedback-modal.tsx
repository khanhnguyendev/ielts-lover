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
import { WritingFeedbackResult } from "@/types";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    score?: number;
    feedback?: string; // JSON string or raw text
    attemptId?: string;
    type: "writing_task1" | "writing_task2";
}

export function FeedbackModal({ open, onOpenChange, score, feedback, attemptId, type }: FeedbackModalProps) {
    const router = useRouter();

    let parsedFeedback: any = {};
    try {
        parsedFeedback = feedback ? JSON.parse(feedback) : {};
    } catch (e) {
        parsedFeedback = { raw: feedback };
    }

    // Determine band score color
    const getScoreColor = (score: number) => {
        if (score >= 8.0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 6.5) return "text-blue-600 bg-blue-50 border-blue-200";
        return "text-orange-600 bg-orange-50 border-orange-200";
    };

    const scoreColorClass = score ? getScoreColor(score) : "";
    const isStructuredWritingFeedback = type === "writing_task1" && parsedFeedback.detailed_scores;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "bg-white rounded-[32px] p-0 overflow-hidden border-none shadow-2xl transition-all duration-500",
                isStructuredWritingFeedback ? "sm:max-w-4xl" : "sm:max-w-2xl"
            )}>
                <div className="bg-[#F9FAFB] p-8 border-b text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border">
                        <Award className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black font-outfit text-slate-900">
                            Evaluation Complete!
                        </DialogTitle>
                        <p className="text-muted-foreground font-medium text-sm mt-1">
                            Here is the AI assessment of your {type === "writing_task1" ? "Task 1" : "Task 2"} response.
                        </p>
                    </div>

                    {(score !== undefined && score !== null) && (
                        <div className={`inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${scoreColorClass}`}>
                            <span className="text-3xl font-black">{score.toFixed(1)}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Band</span>
                        </div>
                    )}
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {isStructuredWritingFeedback ? (
                        <WritingFeedback result={parsedFeedback as WritingFeedbackResult} />
                    ) : (
                        <div className="space-y-4">
                            {parsedFeedback.detailed_feedback ? (
                                <div className="space-y-4">
                                    {parsedFeedback.detailed_feedback.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                            <div className="flex items-center gap-2">
                                                {item.type === "strength" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                                )}
                                                <span className="font-bold text-sm text-slate-900 capitalize">{item.aspect}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{item.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {parsedFeedback.raw || "No detailed feedback available."}
                                </div>
                            )}

                            {parsedFeedback.improved_sample && (
                                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-3">
                                    <h4 className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                        AI Improved Version
                                    </h4>
                                    <p className="text-sm text-indigo-900/80 leading-relaxed italic">
                                        "{parsedFeedback.improved_sample}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-12 font-bold flex-1 sm:flex-none">
                            Close
                        </Button>
                        <Button onClick={() => router.push("/dashboard/writing")} className="rounded-xl h-12 px-8 font-bold text-slate-600 hover:bg-slate-100 flex-1 sm:flex-none" variant="ghost">
                            Writing Hub
                        </Button>
                    </div>
                    {attemptId && (
                        <Button
                            onClick={() => router.push(`/dashboard/reports/${attemptId}`)}
                            className="rounded-xl h-12 px-8 font-black text-sm bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
                        >
                            View Full Report
                            <Sparkles className="ml-2 h-4 w-4 fill-white" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
