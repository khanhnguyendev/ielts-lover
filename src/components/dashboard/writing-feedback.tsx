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
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WritingFeedbackResult, CriteriaType, BandDescriptor } from "@/types/writing";

const CRITERIA_MAP: Record<CriteriaType, { title: string; icon: any; color: string; description: string }> = {
    TA: {
        title: "Task Achievement",
        icon: Target,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        description: "Covers requirements, overview, and key features."
    },
    CC: {
        title: "Coherence & Cohesion",
        icon: Link2,
        color: "text-purple-600 bg-purple-50 border-purple-100",
        description: "Logical organization, progression, and linking words."
    },
    LR: {
        title: "Lexical Resource",
        icon: BookOpen,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        description: "Vocabulary range, spelling, and word formation."
    },
    GRA: {
        title: "Grammar Range & Accuracy",
        icon: PencilLine,
        color: "text-orange-600 bg-orange-50 border-orange-100",
        description: "Sentence structures, grammar errors, and punctuation."
    }
};

interface WritingFeedbackProps {
    result: WritingFeedbackResult;
    type: "writing_task1" | "writing_task2";
    hideHeader?: boolean;
}

export function WritingFeedback({ result, type, hideHeader = false }: WritingFeedbackProps) {
    const [activeCriteria, setActiveCriteria] = React.useState<CriteriaType | null>("TA");

    const getScoreColor = (score: number) => {
        if (score >= 8.0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 6.5) return "text-blue-600 bg-blue-50 border-blue-200";
        if (score >= 5.5) return "text-orange-600 bg-orange-50 border-orange-200";
        return "text-rose-600 bg-rose-50 border-rose-200";
    };

    const criteriaKeys: CriteriaType[] = ["TA", "CC", "LR", "GRA"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!hideHeader && (
                <div className="relative overflow-hidden bg-white rounded-[40px] border-2 border-slate-100 p-10 shadow-2xl shadow-slate-200/50">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <CheckCircle2 className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10 relative">
                        <div className={cn(
                            "flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 shadow-xl shrink-0 transition-all duration-500",
                            getScoreColor(result.overall_score)
                        )}>
                            <span className="text-5xl font-black font-outfit">{result.overall_score.toFixed(1)}</span>
                            <span className="text-xs uppercase font-bold tracking-widest opacity-70">Band</span>
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 mb-2 inline-block">
                                    {result.task_type} Task 1
                                </span>
                                <h2 className="text-3xl font-black text-slate-900 leading-tight">Expert AI Evaluation</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                                {result.general_comment}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {criteriaKeys.map((key) => {
                    const config = CRITERIA_MAP[key];
                    const data = result.detailed_scores[key];
                    const isActive = activeCriteria === key;

                    return (
                        <div
                            key={key}
                            onClick={() => setActiveCriteria(key)}
                            className={cn(
                                "group cursor-pointer bg-white rounded-[32px] border-2 p-6 transition-all duration-300",
                                isActive ? "border-slate-900 ring-4 ring-slate-100 shadow-xl" : "border-slate-100 hover:border-slate-300 shadow-sm",
                                "flex items-start gap-4"
                            )}
                        >
                            <div className={cn("p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110", config.color)}>
                                <config.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-black text-slate-900 truncate">
                                        {key === "TA" ? (
                                            type === "writing_task2" ? "Task Response" :
                                                result.task_type === "academic" ? "Task Achievement (A)" : "Task Achievement (GT)"
                                        ) : config.title}
                                    </h3>
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-sm font-black border",
                                        getScoreColor(data.score)
                                    )}>
                                        {data.score.toFixed(1)}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mb-2">
                                    {config.description}
                                </p>
                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                    {data.feedback}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Criterion View */}
            {activeCriteria && (
                <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex items-start justify-between mb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", CRITERIA_MAP[activeCriteria].color.replace("bg-", "bg-opacity-20 bg-"))}>
                                    {React.createElement(CRITERIA_MAP[activeCriteria].icon, { className: "w-5 h-5" })}
                                </div>
                                <h3 className="text-2xl font-black">
                                    {activeCriteria === "TA" ? (
                                        type === "writing_task2" ? "Task Response" :
                                            result.task_type === "academic" ? "Task Achievement (Academic)" : "Task Achievement (General Training)"
                                    ) : CRITERIA_MAP[activeCriteria].title}
                                </h3>
                            </div>
                            <p className="text-slate-400 font-medium">Detailed breakdown and evidence from your submission.</p>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="block text-4xl font-black tracking-tight">{result.detailed_scores[activeCriteria].score.toFixed(1)}</span>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Band Score</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Evidence */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                <Quote className="w-4 h-4 text-emerald-400" />
                                Evidence from Text
                            </h4>
                            <div className="space-y-4">
                                {result.detailed_scores[activeCriteria].evidence.map((ev, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                                        <p className="text-sm leading-relaxed font-medium italic text-slate-300">"{ev}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                Path to Band {(result.detailed_scores[activeCriteria].score + 0.5)}
                            </h4>
                            <div className="space-y-4">
                                {result.detailed_scores[activeCriteria].improvement_tips.map((tip, i) => (
                                    <div key={i} className="flex gap-4 items-start bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 hover:bg-amber-500/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[10px] font-black text-amber-500">{i + 1}</span>
                                        </div>
                                        <p className="text-sm leading-relaxed font-medium text-slate-300">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <Info className="w-4 h-4" />
                            Based on official IELTS 2024 Band Descriptors
                        </div>
                        <button
                            onClick={() => setActiveCriteria(null)}
                            className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                        >
                            Collapse Details
                            <ChevronDown className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
