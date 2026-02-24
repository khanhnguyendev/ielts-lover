"use client"

import * as React from "react"
import { BookOpen, Sparkles, CheckCircle2, FileCheck, PenTool, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateExampleEssay, getFeaturePrice } from "@/app/actions"
import { FEATURE_KEYS } from "@/lib/constants"
import { useNotification } from "@/lib/contexts/notification-context"
import { extractBillingError } from "@/lib/billing-errors"
import { ExampleEssayResult } from "@/types/writing"
import { PulseLoader } from "@/components/global/pulse-loader"
import { PremiumFeatureCard } from "@/components/global/premium-feature-card"

interface ExampleEssayProps {
    attemptId?: string
    type?: "writing_task1" | "writing_task2"
    isUnlocked?: boolean
    initialData?: ExampleEssayResult | null
    targetScore?: number
}

export function ExampleEssay({ attemptId, type = "writing_task1", isUnlocked: initialUnlocked, initialData, targetScore = 7.0 }: ExampleEssayProps) {
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
                <PremiumFeatureCard
                    title={`See How Band ${targetScore} Looks`}
                    description="Generate a model essay for this exact prompt at your target band score."
                    cost={cost || 2}
                    onUnlock={handleGenerate}
                    isUnlocking={isGenerating}
                    variant="amber"
                    footerText="AI-Generated Model Answer"
                    unlockingTitle="Writing Model Essay..."
                    unlockingDescription={`Crafting a Band ${targetScore} answer for this prompt`}
                    unlockingSteps={[
                        { icon: FileCheck, label: "Analyzing the prompt" },
                        { icon: PenTool, label: "Crafting model answer" },
                        { icon: BarChart3, label: "Reviewing key techniques" },
                    ]}
                >
                    <p className="text-[15px] font-serif text-slate-400 leading-relaxed">
                        {type === "writing_task1" ? (
                            <>
                                The provided data illustrates significant changes in employment patterns across four distinct sectors
                                between 2000 and 2020 in a metropolitan area. Overall, while manufacturing experienced substantial growth,
                                the services sector saw a notable decline over the two-decade period. Agriculture and the public sector
                                demonstrated relatively moderate shifts in their respective employment figures...
                            </>
                        ) : (
                            <>
                                In recent years, the rapid advancement of technology has fundamentally reshaped the way individuals interact and communicate.
                                While some argue that this phenomenon leads to social isolation, I believe that the benefits of global connectivity
                                far outweigh the potential drawbacks. This essay will examine how digital platforms have fostered a more inclusive
                                and accessible environment for sharing ideas and building diverse communities...
                            </>
                        )}
                    </p>
                </PremiumFeatureCard>
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
                        <div className="border-t border-slate-100 bg-amber-50/20 p-6 lg:p-8">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                Expert Analysis: Why This Works
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {essayData.key_techniques.map((technique, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-amber-100/50 text-[12px] text-slate-600 leading-relaxed shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        {technique}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    )
}
