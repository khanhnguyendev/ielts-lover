"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Lightbulb, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CorrectionItem {
    idx: number
    error: boolean
    original_segment: string
    fix: string
    better_version: string
    explanation: string
}

interface CorrectionListProps {
    corrections: CorrectionItem[]
    originalText: string
}

export function CorrectionList({ corrections, originalText }: CorrectionListProps) {
    const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null)

    // Split text into sentences (naively for now, or use the idx mapping)
    // A better way is to use the original_segment to find and wrap them
    const sentences = originalText.split(/(?<=[.!?])\s+/)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white rounded-[24px] border-2 border-slate-100 p-6 shadow-sm">
                <h3 className="text-sm font-black font-outfit uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Interactive Correction
                </h3>

                <div className="space-y-4">
                    <p className="text-lg leading-relaxed font-medium text-slate-700 selection:bg-primary/20">
                        {sentences.map((sentence, sIdx) => {
                            const correction = corrections.find(c => c.idx === sIdx)
                            const isSelected = selectedIdx === sIdx

                            if (!correction) return <span key={sIdx}>{sentence} </span>

                            return (
                                <span
                                    key={sIdx}
                                    onClick={() => setSelectedIdx(isSelected ? null : sIdx)}
                                    className={cn(
                                        "cursor-pointer transition-all duration-300 border-b-2 mx-0.5 px-0.5 rounded-sm",
                                        correction.error
                                            ? "bg-rose-50 border-rose-400 text-rose-700 hover:bg-rose-100"
                                            : "bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100",
                                        isSelected && (correction.error ? "ring-4 ring-rose-100" : "ring-4 ring-blue-100")
                                    )}
                                >
                                    {sentence}{" "}
                                </span>
                            )
                        })}
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                        {selectedIdx !== null ? "Correction Details" : "Click highlighted text to view details"}
                    </p>

                    {selectedIdx !== null ? (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            {(() => {
                                const correction = corrections.find(c => c.idx === selectedIdx)
                                if (!correction) return null

                                return (
                                    <div className={cn(
                                        "rounded-2xl p-6 space-y-4",
                                        correction.error ? "bg-rose-50/50 border border-rose-100" : "bg-blue-50/50 border border-blue-100"
                                    )}>
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                correction.error ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                            )}>
                                                {correction.error ? <AlertCircle className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                                                        {correction.error ? "Grammar Fix" : "Style Upgrade"}
                                                    </h4>
                                                    <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                                                        <span className="text-slate-500 line-through decoration-slate-300">{correction.original_segment}</span>
                                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                                        <span className={cn("px-2 py-0.5 rounded-md", correction.error ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700")}>
                                                            {correction.fix}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 fill-primary" />
                                                        Native Speaker Version
                                                    </h4>
                                                    <p className="text-sm font-bold text-slate-900 italic">
                                                        "{correction.better_version}"
                                                    </p>
                                                    <p className="text-[13px] text-slate-600 font-medium mt-3 leading-relaxed">
                                                        {correction.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-40">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                <ChevronRight className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">Select a sentence above to see expert corrections</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Key Strength</p>
                        <p className="text-xs font-medium text-emerald-700">Good attempt at complex structures in several segments.</p>
                    </div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Main Focus</p>
                        <p className="text-xs font-medium text-amber-700">Improve subject-verb agreement and article usage.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
