"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CorrectionItem } from "@/types/writing"
import { CorrectionTextBlock } from "./correction-text-block"
import { CorrectionPanel } from "./correction-panel"
import { Sparkles } from "lucide-react"

interface CorrectionListProps {
    corrections: CorrectionItem[]
    originalText: string
}

export function CorrectionList({ corrections, originalText }: CorrectionListProps) {
    const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null)
    const selectedCorrection = selectedIdx !== null ? corrections.find(c => c.idx === selectedIdx) || null : null

    // Handlers
    const handleSelect = (idx: number | null) => {
        setSelectedIdx(idx)
    }

    return (
        <div className="flex flex-col h-[700px] lg:h-[800px] bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700 relative group/container isolate">
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

            {/* Content Wrapper */}
            <div className="flex flex-col lg:flex-row h-full">
                {/* Left Column: Text Area */}
                <div className="flex-1 overflow-y-auto relative scroll-smooth bg-white">
                    <div className="p-6 lg:p-10 pb-32 lg:pb-10 max-w-prose mx-auto">
                        <div className="mb-6 flex items-center gap-2 lg:hidden">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tap highlighted text to correct</span>
                        </div>
                        <CorrectionTextBlock
                            text={originalText}
                            corrections={corrections}
                            selectedIdx={selectedIdx}
                            onSelect={handleSelect}
                        />
                    </div>
                </div>

                {/* Right Column: Context Panel (Desktop) */}
                <div className="hidden lg:block w-[400px] xl:w-[450px] border-l border-slate-100 bg-slate-50/30 h-full relative z-20">
                    <CorrectionPanel
                        correction={selectedCorrection}
                        onClose={() => setSelectedIdx(null)}
                        className="h-full border-none shadow-none bg-transparent"
                    />
                </div>
            </div>

            {/* Mobile View: Slide-up Panel */}
            <div
                className={cn(
                    "lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out transform will-change-transform",
                    selectedCorrection ? "translate-y-0" : "translate-y-[110%]"
                )}
            >
                <div className="relative mx-4 mb-4 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 ring-1 ring-slate-900/5 bg-white h-[60vh] flex flex-col">
                    {/* Drag handle */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200/80 rounded-full z-20 pointer-events-none mix-blend-multiply" />

                    <CorrectionPanel
                        correction={selectedCorrection}
                        onClose={() => setSelectedIdx(null)}
                        className="flex-1 border-none shadow-none h-full"
                    />
                </div>
            </div>
        </div>
    )
}
