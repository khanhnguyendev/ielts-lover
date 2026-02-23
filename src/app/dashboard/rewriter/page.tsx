"use client"

import * as React from "react"
import {
    Sparkles,
    RotateCcw,
    Copy,
    Check,
    ChevronDown,
    Wand2,
    Trash2,
    Zap,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { rewriteText } from "@/app/actions"
import { useNotification } from "@/lib/contexts/notification-context"
import { extractBillingError } from "@/lib/billing-errors"

export default function RewriterPage() {
    // ---- COMING SOON OVERLAY FLAG ----
    const IS_COMING_SOON = true;

    // Original State
    const [inputText, setInputText] = React.useState("")
    const [rewrittenText, setRewrittenText] = React.useState("")
    const [isRewriting, setIsRewriting] = React.useState(false)
    const [copied, setCopied] = React.useState(false)
    const { notifySuccess, notifyError, notifyWarning } = useNotification()

    const handleRewrite = async () => {
        if (!inputText) return

        notifyWarning(
            "Confirm Improvement",
            "This will use 1 StarCredit to rewrite your text and improve its band score levels. Do you want to proceed?",
            "Rewrite Now",
            async () => {
                setIsRewriting(true)
                // Optimistic decrement animation
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -1 } }))

                // Call Server Action
                try {
                    const result = await rewriteText(inputText)
                    if (result.success && 'text' in result) {
                        setRewrittenText(result.text as string)
                        notifySuccess(
                            "Text Improved!",
                            "AI has successfully rewritten your text to a higher band score level (8.0+). You can now copy the improved version and compare it with yours.",
                            "Compare Version"
                        )
                    } else {
                        // Refund animation if failed
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))

                        const billing = extractBillingError(result as any);
                        if (billing) {
                            notifyError(billing.title, billing.message, "Close")
                        } else {
                            notifyError(
                                "Rewrite Failed",
                                "We encountered an error while processing your request. Please try again in a few moments.",
                                "Try Again",
                                result.traceId
                            )
                        }
                    }
                } catch (error) {
                    console.error("Rewrite failed:", error)

                    const errorObj = error as any;
                    const traceId = errorObj?.traceId || (typeof error === 'object' && error !== null && 'traceId' in error ? (error as any).traceId : undefined);

                    notifyError(
                        "Rewrite Failed",
                        "We couldn't rewrite your text at this moment. Please check your internet connection or try a shorter paragraph.",
                        "Try Again",
                        traceId
                    )
                } finally {
                    setIsRewriting(false)
                }
            },
            "Cancel"
        )
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(rewrittenText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (IS_COMING_SOON) {
        return (
            <div className="flex-1 h-full overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-32 h-32 bg-purple-50 rounded-[2rem] shadow-sm flex items-center justify-center border-4 border-white ring-1 ring-purple-100 relative z-10">
                        <RefreshCw className="h-14 w-14 text-purple-500" />
                    </div>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-xl border-[3px] border-white shadow-lg rotate-12 z-20 uppercase tracking-widest">
                        Coming Soon
                    </div>
                    <div className="absolute -inset-4 bg-purple-500/5 rounded-full blur-2xl -z-10" />
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-3xl lg:text-4xl font-black font-outfit text-slate-900 tracking-tight">
                        IELTS Rewriter
                    </h1>
                    <p className="text-base lg:text-lg font-medium text-slate-500 leading-relaxed">
                        Instantly upgrade your vocabulary and sentence structure. We're fine-tuning the AI to rewrite your essays to a Band 9.0 standard.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Under Development</p>
                </div>

                {/* HIDDEN ORIGINAL CONTENT */}
                <div className="hidden">
                    <button onClick={handleRewrite}>Test {isRewriting ? '...' : ''}</button>
                    <button onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-6xl mx-auto">
            {/* Title removed to avoid duplication with Header */}

            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
                {/* Instruction */}
                <div className="bg-purple-50 border border-purple-100 rounded-[24px] p-6 flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-purple-100/50">
                        <span className="text-xl">💡</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-purple-900">Pro Tip</p>
                        <p className="text-xs text-purple-700 font-medium">Use the rewriter to see how your sentences can be improved for better lexical resource and grammatical range scores.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Input Side */}
                    <div className="space-y-6 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Your Original Text</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-red-500"
                                onClick={() => setInputText("")}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 min-h-[400px] bg-[#F9FAFB] rounded-[32px] border border-muted-foreground/20 focus-within:border-primary/20 transition-all p-8 flex flex-col">
                            <Textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Paste your sentence or paragraph here..."
                                className="flex-1 w-full border-none bg-transparent focus-visible:ring-0 text-md leading-relaxed font-medium placeholder:text-muted-foreground/60 resize-none scrollbar-hide"
                            />
                        </div>
                        <Button
                            onClick={handleRewrite}
                            disabled={!inputText || isRewriting}
                            className="w-full"
                            variant="default"
                            size="lg"
                        >
                            {isRewriting ? (
                                <>
                                    <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                                    Rewriting...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-5 w-5" />
                                    Rewrite for Band 8.0+
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Output Side */}
                    <div className="space-y-6 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">AI Improved Version</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl h-10 w-10 text-muted-foreground"
                                    onClick={handleCopy}
                                    disabled={!rewrittenText}
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className={cn(
                            "flex-1 min-h-[400px] bg-white rounded-[32px] border-2 border-dashed border-primary/10 p-8 flex flex-col transition-all",
                            rewrittenText ? "border-solid border-primary/20 shadow-2xl shadow-primary/5" : "items-center justify-center"
                        )}>
                            {rewrittenText ? (
                                <p className="text-md leading-relaxed font-bold text-foreground whitespace-pre-wrap">
                                    {rewrittenText}
                                </p>
                            ) : (
                                <div className="text-center space-y-4 opacity-30">
                                    <Sparkles className="h-12 w-12 mx-auto" />
                                    <p className="text-sm font-black uppercase tracking-widest max-w-[200px]">Rewritten text will appear here</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
