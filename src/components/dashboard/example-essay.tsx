"use client"

import * as React from "react"
import { BookOpen, Lock, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateExampleEssay, getFeaturePrice } from "@/app/actions"
import { FEATURE_KEYS } from "@/lib/constants"
import { useNotification } from "@/lib/contexts/notification-context"
import { extractBillingError } from "@/lib/billing-errors"
import { ExampleEssayResult } from "@/types/writing"
import { PulseLoader } from "@/components/global/pulse-loader"

interface ExampleEssayProps {
    attemptId?: string
    isUnlocked?: boolean
    initialData?: ExampleEssayResult | null
    targetScore?: number
}

export function ExampleEssay({ attemptId, isUnlocked: initialUnlocked, initialData, targetScore = 7.0 }: ExampleEssayProps) {
    const { notifyError } = useNotification()
    const [isUnlocked, setIsUnlocked] = React.useState(!!initialUnlocked)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [essayData, setEssayData] = React.useState<ExampleEssayResult | null>(initialData || null)
    const [cost, setCost] = React.useState<number | null>(null)

    React.useEffect(() => {
        async function fetchCost() {
            try {
                const price = await getFeaturePrice(FEATURE_KEYS.EXAMPLE_ESSAY)
                setCost(price)
            } catch (error) {
                console.error("Failed to fetch feature price:", error)
            }
        }
        fetchCost()
    }, [])

    const handleGenerate = async () => {
        if (!attemptId) return
        setIsGenerating(true)

        const deductionAmount = -(cost || 2)
        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: deductionAmount } }))

        try {
            const result = await generateExampleEssay(attemptId)
            if (result.success && result.data) {
                setEssayData(result.data)
                setIsUnlocked(true)
            } else {
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }))
                const billing = extractBillingError(result as any)
                if (billing) {
                    notifyError(billing.title, billing.message, "Close")
                } else {
                    notifyError("Generation Failed", "We couldn't generate the example essay. Please try again later.", "Close", (result as any).traceId)
                }
            }
        } catch (error) {
            window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -deductionAmount } }))
            console.error("Example essay generation failed:", error)
            notifyError("Unexpected Error", "An unexpected error occurred. Please try again.", "Close")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Example Essay</h3>
                        <p className="text-xs text-slate-400 font-medium">AI-generated Band {targetScore} model answer</p>
                    </div>
                </div>
                {isUnlocked && (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Generated</span>
                    </div>
                )}
            </div>

            {/* Content */}
            {!isUnlocked ? (
                <div className="relative rounded-[2rem] border border-slate-200 overflow-hidden">
                    {/* Blurred preview */}
                    <div className="p-6 lg:p-8 blur-sm select-none pointer-events-none" aria-hidden>
                        <p className="text-[15px] font-serif text-slate-400 leading-relaxed">
                            The provided data illustrates significant changes in employment patterns across four distinct sectors
                            between 2000 and 2020 in a metropolitan area. Overall, while manufacturing experienced substantial growth,
                            the services sector saw a notable decline over the two-decade period. Agriculture and the public sector
                            demonstrated relatively moderate shifts in their respective employment figures...
                        </p>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/95 flex flex-col items-center justify-center gap-4 p-6">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                            <Lock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="text-center space-y-1">
                            <h4 className="text-sm font-black text-slate-900">See How Band {targetScore} Looks</h4>
                            <p className="text-xs text-slate-500 font-medium max-w-xs">
                                Generate a model essay for this exact prompt at your target band score.
                            </p>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-12 px-6 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <PulseLoader size="sm" color="white" />
                                    Generating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 fill-white" />
                                    Generate Example
                                    <span className="flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-lg text-[10px]">
                                        ⭐ {cost || 2}
                                    </span>
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            ) : essayData ? (
                <div className="rounded-[2rem] border border-slate-200 overflow-hidden bg-white">
                    {/* Essay text */}
                    <div className="p-6 lg:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1 bg-amber-50 ring-1 ring-amber-100 px-2 py-0.5 rounded-full text-amber-700">
                                <span className="text-[10px] font-black uppercase tracking-wider">Band {essayData.band_score}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Answer</span>
                        </div>
                        <div className="prose prose-slate max-w-none text-[15px] leading-[1.9] text-slate-700 font-serif whitespace-pre-wrap">
                            {essayData.essay_text}
                        </div>
                    </div>

                    {/* Key techniques */}
                    {essayData.key_techniques && essayData.key_techniques.length > 0 && (
                        <div className="border-t border-slate-100 bg-amber-50/30 p-6 lg:p-8">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                Why This Works
                            </h4>
                            <ul className="space-y-2">
                                {essayData.key_techniques.map((technique, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
                                        <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        {technique}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    )
}
