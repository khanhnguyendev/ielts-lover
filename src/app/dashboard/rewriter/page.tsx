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
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PremiumBanner } from "@/components/dashboard/premium-banner"
import { rewriteText } from "@/app/actions"
import { useNotification } from "@/lib/contexts/notification-context"

export default function RewriterPage() {
    const [inputText, setInputText] = React.useState("")
    const [rewrittenText, setRewrittenText] = React.useState("")
    const [isRewriting, setIsRewriting] = React.useState(false)
    const [copied, setCopied] = React.useState(false)
    const { notifySuccess, notifyError } = useNotification()

    const handleRewrite = async () => {
        if (!inputText) return
        setIsRewriting(true)
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
                if (result.reason === "INSUFFICIENT_CREDITS") {
                    notifyError(
                        "Insufficient Credits",
                        "You don't have enough StarCredits to use the rewriter. Please top up your balance.",
                        "Top Up"
                    )
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
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(rewrittenText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
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
                            variant="premium"
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

                        <PremiumBanner
                            title="Access Advanced Rewrite Modes with Premium"
                            buttonText="Upgrade"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
