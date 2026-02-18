"use client";

import * as React from "react";
import {
    Target,
    Link2,
    BookOpen,
    PencilLine,
    ChevronDown,
    Quote,
    Lightbulb,
    CheckCircle2,
    Info,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WritingFeedbackResult, CriteriaType } from "@/types/writing";

const CRITERIA_MAP: Record<CriteriaType, { label: string; icon: any; color: string; description: string }> = {
    TA: {
        label: "Task Achievement",
        icon: Target,
        color: "bg-blue-600 text-white",
        description: "Covers requirements, overview, and key features."
    },
    CC: {
        label: "Coherence & Cohesion",
        icon: Link2,
        color: "bg-purple-600 text-white",
        description: "Logical organization, progression, and linking words."
    },
    LR: {
        label: "Lexical Resource",
        icon: BookOpen,
        color: "bg-emerald-600 text-white",
        description: "Vocabulary range, spelling, and word formation."
    },
    GRA: {
        label: "Grammar Range & Accuracy",
        icon: PencilLine,
        color: "bg-orange-600 text-white",
        description: "Sentence structures, grammar errors, and punctuation."
    }
};

interface WritingFeedbackProps {
    result: WritingFeedbackResult;
    type: "writing_task1" | "writing_task2";
    hideHeader?: boolean;
    hideScore?: boolean;
}

export function WritingFeedback({ result, type, hideHeader = false, hideScore = false }: WritingFeedbackProps) {
    const [activeCriteria, setActiveCriteria] = React.useState<CriteriaType | null>("TA");

    const getScoreColor = (score: number) => {
        if (score >= 8.0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 6.5) return "text-blue-600 bg-blue-50 border-blue-200";
        if (score >= 5.5) return "text-orange-600 bg-orange-50 border-orange-200";
        return "text-rose-600 bg-rose-50 border-rose-200";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!hideHeader && (
                <div className="relative overflow-hidden bg-white rounded-[32px] border-2 border-slate-100 p-6 shadow-xl shadow-slate-200/50">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <CheckCircle2 className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 relative">
                        {!hideScore && (
                            <div className={cn(
                                "flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 shadow-lg shrink-0 transition-all duration-500",
                                getScoreColor(result.overall_score)
                            )}>
                                <span className="text-3xl font-black font-outfit">{result.overall_score.toFixed(1)}</span>
                                <span className="text-[9px] uppercase font-bold tracking-widest opacity-70">Band</span>
                            </div>
                        )}

                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <div>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-slate-200 mb-1 inline-block">
                                    {result.task_type} Task 1
                                </span>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">Expert AI Evaluation</h2>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                                {result.general_comment}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(result.detailed_scores).map(([key, score]) => {
                    const criteria = key as CriteriaType;
                    const isActive = activeCriteria === criteria;
                    const descriptor = CRITERIA_MAP[criteria];

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveCriteria(criteria)}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-[20px] border-2 transition-all duration-300 text-left relative overflow-hidden group",
                                isActive
                                    ? "bg-white border-primary shadow-md ring-2 ring-primary/5 scale-[1.01]"
                                    : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-white"
                            )}
                        >
                            <div className={cn(
                                "flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors bg-white border-2",
                                isActive ? "border-primary text-primary" : "border-slate-100 text-slate-900",
                                getScoreColor(score.score).split(' ')[0]
                            )}>
                                <span className="text-lg font-black font-outfit">{score.score.toFixed(1)}</span>
                                <span className="text-[7px] uppercase font-black tracking-tighter opacity-70">Band</span>
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                                    {descriptor.label}
                                    {isActive && <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                    "{score.feedback}"
                                </p>
                            </div>

                            <div className={cn(
                                "absolute bottom-2 right-2 transition-transform duration-500",
                                isActive ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-45"
                            )}>
                                <Sparkles className="w-3 h-3 text-primary/40" />
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Detailed View */}
            {activeCriteria && (
                <div className="bg-white rounded-[24px] border-2 border-primary/10 p-5 sm:p-6 shadow-lg shadow-slate-200/50 relative overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Sparkles className="w-24 h-24" />
                    </div>

                    <div className="relative space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md",
                                getScoreColor(result.detailed_scores[activeCriteria].score).split(' ')[0].replace('text-', 'bg-')
                            )}>
                                {result.detailed_scores[activeCriteria].score.toFixed(1)}
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                    {CRITERIA_MAP[activeCriteria].label}
                                </h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                    Detailed AI Analysis • Band {result.detailed_scores[activeCriteria].score}
                                </p>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 space-y-2">
                                <h4 className="text-[9px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Strengths
                                </h4>
                                <ul className="space-y-1.5">
                                    {result.detailed_scores[activeCriteria].evidence.map((item, idx) => (
                                        <li key={idx} className="flex gap-2 text-[10px] text-emerald-800/80 leading-relaxed font-medium">
                                            <div className="w-1 h-1 rounded-full bg-emerald-300 mt-1.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 space-y-2">
                                <h4 className="text-[9px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                                    <Target className="w-3 h-3" />
                                    Improvements
                                </h4>
                                <ul className="space-y-1.5">
                                    {result.detailed_scores[activeCriteria].improvement_tips.map((item, idx) => (
                                        <li key={idx} className="flex gap-2 text-[10px] text-indigo-800/80 leading-relaxed font-medium">
                                            <div className="w-1 h-1 rounded-full bg-indigo-300 mt-1.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
