"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TextEdit } from "@/types/writing"
import { X, Sparkles, Languages, ArrowRight, Zap, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { improveSentence, getFeaturePrice } from "@/app/actions";
import { toast } from "sonner";
import { APP_ERROR_CODES, FEATURE_KEYS } from "@/lib/constants";

interface CorrectionPanelProps {
    sentenceText: string | null
    corrections: TextEdit[]
    onClose: () => void
    className?: string
    targetScore?: number
}

export function CorrectionPanel({ sentenceText, corrections, onClose, className, targetScore = 9.0 }: CorrectionPanelProps) {
    // ...
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
                toast.error(result.error || APP_ERROR_CODES.INTERNAL_ERROR);
            }
        } catch (error) {
            // Refund on exception
            window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }));
            console.error("Failed to rewrite sentence:", error);
            toast.error(APP_ERROR_CODES.INTERNAL_ERROR);
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
                        <p className="text-base font-serif text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-pretty">
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
                                                "px-4 py-1.5 border-b flex items-center justify-between",
                                                isError ? "bg-rose-50/30 border-rose-100/50" : "bg-blue-50/30 border-blue-100/50"
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    {isError ? <AlertCircle className="w-3 h-3 text-rose-500" /> : <Lightbulb className="w-3 h-3 text-blue-500" />}
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-wider",
                                                        isError ? "text-rose-600" : "text-blue-600"
                                                    )}>
                                                        {correction.error_type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-3 space-y-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-baseline gap-2 text-sm text-slate-600 flex-wrap">
                                                        <span className={cn(
                                                            "font-medium decoration-2 underline underline-offset-2",
                                                            isError ? "text-rose-700 decoration-rose-300" : "text-blue-700 decoration-blue-300"
                                                        )}>{correction.original_substring}</span>
                                                        <ArrowRight className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">{correction.suggested_fix}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed pl-2 border-l-2 border-slate-100">
                                                    {correction.explanation}
                                                </p>
                                                {correction.better_version && (
                                                    <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 italic">
                                                        <span className="not-italic font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Better Version</span>
                                                        "{correction.better_version}"
                                                    </div>
                                                )}
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
                    <div className="pt-3 border-t border-slate-100 space-y-2 pb-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-indigo-400 flex items-center gap-1.5">
                                <Zap className="w-3 h-3" />
                                Magic Rewrite
                            </h4>
                            {!rewrittenSentence && (
                                <div className="flex items-center gap-1 bg-yellow-50 ring-1 ring-yellow-100 px-2 py-0.5 rounded-full text-yellow-700">
                                    <div className="flex items-center justify-center w-3 h-3 rounded-full bg-yellow-400 text-[8px] leading-none shadow-sm text-yellow-900">⭐</div>
                                    <span className="text-[9px] font-black tracking-tight">-{cost || 5}</span>
                                </div>
                            )}
                        </div>

                        {!rewrittenSentence ? (
                            <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-xl p-0.5 border border-indigo-100/50">
                                <Button
                                    onClick={handleRewrite}
                                    disabled={isRewriting}
                                    variant="ghost"
                                    className="w-full h-auto flex items-center justify-between p-2.5 hover:bg-white/50 transition-all bg-white/30"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Languages className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-xs font-bold text-indigo-900 block">
                                                {isRewriting ? "Rewriting..." : "Improve Sentence"}
                                            </span>
                                            <span className="text-[10px] text-indigo-600/70 block font-medium">
                                                Get a Band {targetScore} version
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
                                </Button>
                            </div>
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
                                                    toast.success("Copied to clipboard");
                                                }}
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                        <p className="font-serif text-sm leading-relaxed text-indigo-900 text-pretty">
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
