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

export default function RewriterPage() {
    const [inputText, setInputText] = React.useState("")
    const [rewrittenText, setRewrittenText] = React.useState("")
    const [isRewriting, setIsRewriting] = React.useState(false)
    const [copied, setCopied] = React.useState(false)

    const handleRewrite = () => {
        if (!inputText) return
        setIsRewriting(true)
        // Simulate API call
        setTimeout(() => {
            setRewrittenText(`Here is a more professional and academic version of your text:\n\n"${inputText.trim()}" rewritten with more sophisticated vocabulary and better sentence structure to ensure a higher band score.`)
            setIsRewriting(false)
        }, 2000)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(rewrittenText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">AI Writing Rewriter</h1>
            </div>

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
                        <div className="flex-1 min-h-[400px] bg-[#F9FAFB] rounded-[32px] border border-muted-foreground/10 focus-within:border-primary/20 transition-all p-8 flex flex-col">
                            <Textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Paste your sentence or paragraph here..."
                                className="flex-1 w-full border-none bg-transparent focus-visible:ring-0 text-md leading-relaxed font-medium placeholder:text-muted-foreground/30 resize-none scrollbar-hide"
                            />
                        </div>
                        <Button
                            onClick={handleRewrite}
                            disabled={!inputText || isRewriting}
                            className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

                        <div className="bg-[#EEF2FF] rounded-[24px] p-5 flex items-center justify-between border border-[#E0E7FF] group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                                <Zap className="h-20 w-20 text-[#4F46E5] fill-[#4F46E5]" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="bg-[#4F46E5] p-2.5 rounded-xl shadow-lg shadow-[#4F46E5]/20">
                                    <Zap className="h-5 w-5 text-white fill-white" />
                                </div>
                                <p className="text-xs font-bold text-[#4338CA]">Access Advanced Rewrite Modes with Premium</p>
                            </div>
                            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-10 px-5 rounded-xl font-black text-[10px] relative z-10 shadow-lg shadow-[#7C3AED]/10">
                                Upgrade
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
