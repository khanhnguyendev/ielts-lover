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
    Sparkles,
    Lock,
    Zap,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WritingFeedbackResult, CriteriaType } from "@/types/writing";
import { Button } from "@/components/ui/button";
import { unlockCorrection, getFeaturePrice } from "@/app/actions";
import { CorrectionList } from "./correction-list";
import { ExampleEssay } from "./example-essay";
import { toast } from "sonner";
import { APP_ERROR_CODES, FEATURE_KEYS } from "@/lib/constants";
import { useNotification } from "@/lib/contexts/notification-context";
import { extractBillingError } from "@/lib/billing-errors";

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
    attemptId?: string;
    originalText?: string;
    isUnlocked?: boolean;
    initialCorrection?: any[] | { edits: any[] } | null;
    targetScore?: number;
    isExampleEssayUnlocked?: boolean;
    initialExampleEssay?: any;
}

export function WritingFeedback({
    result,
    type,
    hideHeader = false,
    hideScore = false,
    attemptId,
    originalText,
    isUnlocked: initialIsUnlocked = false,
    initialCorrection,
    targetScore,
    isExampleEssayUnlocked,
    initialExampleEssay
}: WritingFeedbackProps) {
    const { notifyError } = useNotification();
    const [activeCriteria, setActiveCriteria] = React.useState<CriteriaType | null>("TA");
    const [isUnlocked, setIsUnlocked] = React.useState(initialIsUnlocked);
    const [corrections, setCorrections] = React.useState<any[] | null>(() => {
        if (!initialCorrection) return null;

        const rawEdits = Array.isArray(initialCorrection) ? initialCorrection : (initialCorrection as any).edits || [];

        return rawEdits.map((edit: any) => {
            if (edit.original_substring) return edit;
            return {
                original_substring: edit.original || edit.original_segment,
                suggested_fix: edit.suggested || edit.fix,
                better_version: edit.better_version,
                error_type: (edit.type || (edit.error ? 'grammar' : 'style')).toLowerCase(),
                explanation: edit.explanation
            };
        });
    });
    const [isUnlocking, setIsUnlocking] = React.useState(false);
    const [cost, setCost] = React.useState<number | null>(null);

    React.useEffect(() => {
        setIsUnlocked(initialIsUnlocked);
    }, [initialIsUnlocked]);

    // Handle initialCorrection changes (e.g. for sample reports)
    React.useEffect(() => {
        if (!initialCorrection) {
            setCorrections(null);
            return;
        }

        const rawEdits = Array.isArray(initialCorrection) ? initialCorrection : (initialCorrection as any).edits || [];
        const normalizedEdits = rawEdits.map((edit: any) => {
            if (edit.original_substring) return edit;
            return {
                original_substring: edit.original || edit.original_segment,
                suggested_fix: edit.suggested || edit.fix,
                better_version: edit.better_version,
                error_type: (edit.type || (edit.error ? 'grammar' : 'style')).toLowerCase(),
                explanation: edit.explanation
            };
        });
        setCorrections(normalizedEdits);
    }, [initialCorrection]);

    React.useEffect(() => {
        async function fetchCost() {
            try {
                const price = await getFeaturePrice(FEATURE_KEYS.DETAILED_CORRECTION);
                setCost(price);
            } catch (error) {
                console.error("Failed to fetch feature price:", error);
            }
        }
        fetchCost();
    }, []);

    const handleUnlock = async () => {
        if (!attemptId) return;
        setIsUnlocking(true);

        // Optimistic credit deduction animation
        const deductionAmount = -(cost || 15);
        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: deductionAmount } }));

        try {
            const result = await unlockCorrection(attemptId);
            if (result.success) {
                // Handle both old array format (if any legacy data exists) and new object format
                const data = result.data;
                let edits: any[] = Array.isArray(data) ? data : data?.edits || [];

                // Normalize legacy data (CorrectionItem) to new format (TextEdit)
                setCorrections(edits.map(edit => {
                    if (edit.original_substring) return edit;
                    return {
                        original_substring: edit.original || edit.original_segment,
                        suggested_fix: edit.suggested || edit.fix,
                        better_version: edit.better_version,
                        error_type: (edit.type || (edit.error ? 'grammar' : 'style')).toLowerCase(),
                        explanation: edit.explanation
                    };
                }));
                setIsUnlocked(true);
                toast.success("Detailed correction unlocked!");
            } else {
                // Refund if failed
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }));
                const traceId = (result as any).traceId;
                const billing = extractBillingError(result as any);
                if (billing) {
                    notifyError(billing.title, billing.message, "Close");
                } else if ((result as any).reason === APP_ERROR_CODES.AI_SERVICE_BUSY) {
                    notifyError("Service Busy", "Our AI service is currently experiencing high demand. Please try again in a moment.", "Close", traceId);
                } else {
                    notifyError("Something Went Wrong", "We encountered a problem while unlocking your correction. Please provide the trace ID to support.", "Close", traceId);
                }
            }
        } catch (error) {
            // Refund on exception
            window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }));
            console.error("Unlock error:", error);
            notifyError("Unexpected Error", "An unexpected error occurred while unlocking your correction. Please try again.", "Close");
        } finally {
            setIsUnlocking(false);
        }
    };

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

            {/* Stage 2: Detailed Correction */}
            <div className="space-y-4 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 font-outfit flex items-center gap-2">
                            <PencilLine className="w-5 h-5 text-primary" />
                            Detailed Correction
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Line-by-line grammar fixes & academic paraphrasing</p>
                    </div>
                    {isUnlocked && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 scale-90 sm:scale-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Unlocked</span>
                        </div>
                    )}
                </div>

                {!isUnlocked ? (
                    <div className="relative group overflow-hidden rounded-[24px] border-2 border-slate-100 bg-white min-h-[300px]">
                        {/* Blurry Preview */}
                        <div className="p-10 space-y-6 opacity-20 blur-[5px] select-none pointer-events-none grayscale">
                            <div className="space-y-3">
                                <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                                <div className="h-3 bg-slate-200 rounded-full w-full" />
                                <div className="h-3 bg-slate-200 rounded-full w-5/6" />
                                <div className="h-3 bg-slate-200 rounded-full w-2/3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-20 bg-rose-50 rounded-xl border border-rose-100" />
                                <div className="h-20 bg-blue-50 rounded-xl border border-blue-100" />
                            </div>
                        </div>

                        {/* Unlock CTA */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-white/60 backdrop-blur-[2px]">
                            <div className="w-12 h-12 bg-white rounded-2xl border-2 border-slate-100 shadow-lg flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-slate-300" />
                            </div>
                            <h4 className="text-base font-black text-slate-900 font-outfit mb-1.5 leading-tight">See every mistake & upgrade</h4>
                            <p className="text-[11px] text-slate-500 font-medium max-w-[280px] mb-6 leading-relaxed">
                                Get line-by-line grammar corrections and Band 8.0+ vocabulary upgrades.
                            </p>

                            <Button
                                onClick={handleUnlock}
                                disabled={isUnlocking}
                                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-xl shadow-primary/30 font-black text-sm group relative overflow-hidden transition-all hover:scale-[1.02]"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Zap className="w-4 h-4 mr-2 fill-white animate-pulse" />

                                {isUnlocking ? (
                                    <span>Unlocking...</span>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span>Unlock Feedback</span>
                                        <div className="flex items-center gap-1.5 bg-yellow-100 ring-1 ring-yellow-200/50 px-2.5 py-1 rounded-full shadow-sm text-yellow-700 ml-1 group-hover:bg-yellow-50 transition-colors">
                                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 text-[9px] leading-none shadow-sm text-yellow-900">⭐</div>
                                            <span className="text-[10px] font-black tracking-tight">
                                                -{cost ?? 15}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {!isUnlocking && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform opacity-80" />}
                            </Button>

                            <p className="mt-5 text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 opacity-80">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI-Powered Analysis
                            </p>
                        </div>
                    </div>
                ) : (
                    <CorrectionList
                        corrections={corrections || []}
                        originalText={originalText || ""}
                        targetScore={targetScore}
                    />
                )}
            </div>

            {/* Stage 3: Example Essay */}
            <div className="pt-8 border-t border-slate-100">
                <ExampleEssay
                    attemptId={attemptId}
                    isUnlocked={isExampleEssayUnlocked}
                    initialData={initialExampleEssay}
                    targetScore={targetScore}
                />
            </div>
        </div>
    );
}
