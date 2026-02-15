"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CEFR_COLORS } from "@/lib/sample-data"

interface HighlightedTextProps {
    fragments: Array<{
        text: string
        cefr?: string
        annotationId?: number
        isError?: boolean
    }>
    showFeedback: boolean
    onAnnotationClick?: (id: number) => void
    activeAnnotationId?: number
}

export function HighlightedText({ fragments, showFeedback, onAnnotationClick, activeAnnotationId }: HighlightedTextProps) {
    return (
        <div className="text-lg leading-relaxed font-medium text-slate-700 selection:bg-primary/20">
            {fragments.map((fragment, i) => {
                if (!showFeedback || (!fragment.cefr && !fragment.annotationId && !fragment.isError)) {
                    return <span key={i}>{fragment.text}</span>
                }

                const cefr = fragment.cefr ? CEFR_COLORS[fragment.cefr] : null
                const isActive = activeAnnotationId === fragment.annotationId

                return (
                    <span
                        key={i}
                        className={cn(
                            "relative inline px-1 py-0.5 rounded transition-all cursor-pointer",
                            cefr && cefr.bg,
                            cefr && cefr.color,
                            fragment.isError && "bg-red-50 text-red-600 border-b-2 border-red-500",
                            fragment.annotationId && "bg-blue-50 text-blue-700 font-bold",
                            isActive && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => fragment.annotationId && onAnnotationClick?.(fragment.annotationId)}
                    >
                        {fragment.text}
                        {fragment.annotationId && (
                            <sup className="text-[10px] ml-0.5 font-black opacity-60">
                                {fragment.annotationId}
                            </sup>
                        )}
                        {cefr && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 rounded shadow-sm border whitespace-nowrap z-20">
                                {cefr.level}
                            </span>
                        )}
                    </span>
                )
            })}
        </div>
    )
}
