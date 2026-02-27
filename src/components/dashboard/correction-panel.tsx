"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TextEdit } from "@/types/writing"
import { X, Sparkles, Zap, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { improveSentence, getFeaturePrice } from "@/app/actions";
import { FEATURE_KEYS } from "@/lib/constants";
import { extractBillingError } from "@/lib/billing-errors";
import { useNotification } from "@/lib/contexts/notification-context";
import { NOTIFY_MSGS } from "@/lib/constants/messages";
import { AIActionButton } from "@/components/global/ai-action-button"

interface CorrectionPanelProps {
    sentenceText: string | null
    corrections: TextEdit[]
    onClose: () => void
    className?: string
    targetScore?: number
}

export function CorrectionPanel({ sentenceText, corrections, onClose, className, targetScore = 9.0 }: CorrectionPanelProps) {
    // ...
    const { notifySuccess, notifyError } = useNotification();
    const [isRewriting, setIsRewriting] = React.useState(false);
    const [rewrittenSentence, setRewrittenSentence] = React.useState<string | null>(null);
    const [cost, setCost] = React.useState<number | null>(null);

    React.useEffect(() => {
        async function fetchCost() {
            try {
                const price = await getFeaturePrice(FEATURE_KEYS.SENTENCE_IMPROVE);
                setCost(price);
            } catch (error) {
                console.error("Failed to fetch feature price:", error);
            }
        }
        fetchCost();
    }, []);

    // Reset state when sentence changes
    React.useEffect(() => {
        setRewrittenSentence(null);
    }, [sentenceText]);

    const handleRewrite = async () => {
        if (!sentenceText) return;

        setIsRewriting(true);
        setRewrittenSentence(null); // Clear previous rewrite

        // Optimistic credit deduction animation
        const deductionAmount = -(cost || 5);
        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: deductionAmount } }));

        try {
            const result = await improveSentence(sentenceText, targetScore);
            if (result.success && result.data) {
                setRewrittenSentence(result.data.improved_sentence);
            } else {
                // Refund if failed
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }));
                const billing = extractBillingError(result as any);
                if (billing) {
                    notifyError(billing.title, billing.message, "Close");
                } else {
                    const traceId = (result as any).traceId;
                    notifyError(
                        NOTIFY_MSGS.ERROR.REWRITE_FAILED.title,
                        NOTIFY_MSGS.ERROR.REWRITE_FAILED.description,
                        "Close",
                        traceId
                    );
                }
            }
        } catch (error) {
            // Refund on exception
            window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }));
            console.error("Failed to rewrite sentence:", error);
            notifyError(
                NOTIFY_MSGS.ERROR.UNEXPECTED.title,
                NOTIFY_MSGS.ERROR.UNEXPECTED.description,
                "Close"
            );
        } finally {
            setIsRewriting(false);
        }
    };

    if (!sentenceText) {
        return (
            <div className={cn("hidden lg:flex flex-col items-center justify-center h-full text-center space-y-4 p-8 bg-slate-50/50", className)}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100/50">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Select a sentence</h3>
                    <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto leading-relaxed">
                        Click on any sentence to see errors and improvements.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("h-full flex flex-col bg-white shadow-xl shadow-slate-200/50 lg:shadow-none border-t lg:border-t-0 lg:border-l border-slate-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10 shrink-0">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Sentence Analysis
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-5 space-y-6">
                    {/* 1. Original Sentence */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400">Original Sentence</h4>
                        <p className="text-[15px] font-serif text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-pretty">
                            {sentenceText}
                        </p>
                    </div>

                    {/* 2. Issues Found */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
                            {corrections.length > 0 ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    Issues Found ({corrections.length})
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    No Issues Found
                                </>
                            )}
                        </h4>

                        {corrections.length > 0 ? (
                            <div className="space-y-2">
                                {corrections.map((correction, idx) => {
                                    const isError = correction.error_type === 'grammar' || correction.error_type === 'spelling';
                                    return (
                                        <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group hover:border-slate-200 transition-all">
                                            <div className={cn(
                                                "px-4 py-2 border-b flex items-center justify-between",
                                                isError ? "bg-rose-50/30 border-rose-100/50" : "bg-blue-50/30 border-blue-100/50"
                                            )}>
                                                <div className="flex items-center gap-2.5">
                                                    {isError ? <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> : <Lightbulb className="w-3.5 h-3.5 text-blue-500" />}
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-wider",
                                                            isError ? "text-rose-600" : "text-blue-600"
                                                        )}>
                                                            {correction.error_type}
                                                        </span>
                                                        {correction.error_label && (
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                                                                isError ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {correction.error_label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 space-y-2.5">
                                                <div className="space-y-1.5">
                                                    <div className={cn(
                                                        "flex items-start gap-2 rounded-lg px-2.5 py-2 border",
                                                        isError ? "bg-rose-50/50 border-rose-100" : "bg-blue-50/50 border-blue-100"
                                                    )}>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-wider mt-0.5 shrink-0",
                                                            isError ? "text-rose-400" : "text-blue-400"
                                                        )}>was</span>
                                                        <span className={cn(
                                                            "text-[13px] font-medium",
                                                            isError ? "text-rose-700" : "text-blue-700"
                                                        )}>{correction.original_substring}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 rounded-lg px-2.5 py-2 bg-emerald-50/50 border border-emerald-100">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-0.5 shrink-0">fix</span>
                                                        <span className="text-[13px] font-bold text-emerald-700">{correction.suggested_fix}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[12px] text-slate-500 leading-relaxed pl-2.5 border-l-2 border-slate-100">
                                                    {correction.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50/50 text-emerald-700 rounded-xl border border-emerald-100/50 flex items-center gap-3">
                                <span className="text-sm font-medium">This sentence looks great!</span>
                            </div>
                        )}
                    </div>

                    {/* 3. Rewrite Action */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                        {!rewrittenSentence ? (
                            <AIActionButton
                                label={isRewriting ? "Rewriting..." : "Magic Rewrite"}
                                icon={Zap}
                                onClick={handleRewrite}
                                isLoading={isRewriting}
                                badge={cost ? `-${cost}` : undefined}
                                className="w-full h-11 lg:h-11"
                            />
                        ) : (
                            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 relative group transition-all">
                                <div className="flex items-start gap-2.5">
                                    <div className="shrink-0 mt-0.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Sparkles className="w-3 h-3 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                                                Band {targetScore} Version
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 px-1.5 text-[9px] hover:bg-indigo-100 text-indigo-400 font-bold uppercase tracking-wider"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(rewrittenSentence);
                                                    notifySuccess(NOTIFY_MSGS.SUCCESS.COPIED.title, NOTIFY_MSGS.SUCCESS.COPIED.description);
                                                }}
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                        <p className="font-serif text-[15px] leading-relaxed text-indigo-900 text-pretty">
                                            {rewrittenSentence}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
