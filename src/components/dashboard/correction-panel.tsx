"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, Lightbulb, Sparkles, X, ArrowRight } from "lucide-react"
import { CorrectionItem } from "@/types/writing"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CorrectionPanelProps {
    correction: CorrectionItem | null
    onClose?: () => void
    className?: string
}

export function CorrectionPanel({ correction, onClose, className }: CorrectionPanelProps) {
    if (!correction) {
        return (
            <div className={cn("hidden lg:flex flex-col items-center justify-center h-full text-center space-y-4 p-8 bg-slate-50/50", className)}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100/50">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Select a segment</h3>
                    <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto leading-relaxed">
                        Click on any highlighted text to see detailed improvements.
                    </p>
                </div>
            </div>
        )
    }

    const { error, original_segment, fix, better_version, explanation } = correction

    return (
        <div className={cn("h-full flex flex-col bg-white shadow-xl shadow-slate-200/50 lg:shadow-none border-t lg:border-t-0 lg:border-l border-slate-100", className)}>
            {/* Header */}
            <div className={cn(
                "px-6 py-4 border-b flex items-center justify-between bg-white z-10 shrink-0",
                error ? "border-rose-100" : "border-blue-100"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                        error ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                    )}>
                        {error ? <AlertCircle className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className={cn("text-xs font-black uppercase tracking-wider mb-0.5", error ? "text-rose-700" : "text-blue-700")}>
                            {error ? "Grammar Error" : "Suggestion"}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Correction #{correction.idx + 1}
                        </p>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-slate-100 -mr-2">
                        <X className="w-4 h-4 text-slate-500" />
                    </Button>
                )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Comparison */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                Original
                            </p>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 line-through decoration-rose-300/50 text-sm leading-relaxed font-medium">
                                {original_segment}
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className={cn("rounded-full p-1.5 shadow-sm border bg-white", error ? "border-rose-100 text-rose-400" : "border-blue-100 text-blue-400")}>
                                <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", error ? "text-rose-600" : "text-blue-600")}>
                                Improved
                            </p>
                            <div className={cn(
                                "p-4 rounded-xl border-l-4 text-sm font-bold leading-relaxed shadow-sm bg-white",
                                error ? "border-l-rose-500 border-y border-r border-slate-100 text-slate-900" : "border-l-blue-500 border-y border-r border-slate-100 text-slate-900"
                            )}>
                                {fix}
                            </div>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            Why change this?
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {explanation}
                        </p>
                    </div>

                    {/* Native Version */}
                    <div className="p-5 rounded-2xl bg-slate-900 text-slate-300 space-y-3 shadow-xl shadow-slate-900/5 ring-1 ring-black/5">
                        <div className="flex items-center item-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Native Speaker Version</span>
                        </div>
                        <p className="text-sm font-medium text-white italic leading-relaxed opacity-90">
                            "{better_version}"
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
