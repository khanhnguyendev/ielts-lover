"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

interface RewriterEvaluationProps {
    data: {
        originalText: string
        rewrittenText: string
        improvements: Array<{
            category: string
            description: string
        }>
    }
}

export function RewriterEvaluation({ data }: RewriterEvaluationProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Original Content */}
                <div className="bg-white rounded-[32px] border p-10 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Original Text</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Word Count: {data.originalText.split(" ").length}</span>
                    </div>
                    <div className="text-lg leading-relaxed font-medium text-slate-500 italic">
                        "{data.originalText}"
                    </div>
                </div>

                {/* Rewritten Content */}
                <div className="bg-white rounded-[32px] border-2 border-primary/20 p-10 shadow-xl shadow-primary/5 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <Sparkles className="h-32 w-32 text-primary" />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary">Rewritten by AI</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Word Count: {data.rewrittenText.split(" ").length}</span>
                    </div>

                    <div className="text-lg leading-relaxed font-bold text-slate-800 relative z-10">
                        {data.rewrittenText}
                    </div>

                    <div className="pt-8 border-t border-dashed relative z-10">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Key Improvements</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.improvements.map((imp, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="bg-emerald-50 p-1 rounded-md shrink-0">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] font-black uppercase tracking-tight text-slate-900">{imp.category}</div>
                                        <p className="text-[11px] text-muted-foreground leading-tight font-medium">{imp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
