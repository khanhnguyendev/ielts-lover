"use client"

import { cn } from "@/lib/utils"
import { CorrectionItem } from "@/types/writing"

interface CorrectionTextBlockProps {
    text: string
    corrections: CorrectionItem[]
    selectedIdx: number | null
    onSelect: (idx: number | null) => void
}

export function CorrectionTextBlock({ text, corrections, selectedIdx, onSelect }: CorrectionTextBlockProps) {
    // Current splitting logic matches the backend simplistic approach.
    // In the future, we should use character indices.
    const segments = text.split(/(?<=[.!?])\s+/)

    return (
        <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-loose text-slate-600 font-serif">
                {segments.map((segment, idx) => {
                    const correction = corrections.find(c => c.idx === idx)
                    const isSelected = selectedIdx === idx

                    if (!correction) {
                        return (
                            <span key={idx} className="mr-1">
                                {segment}{" "}
                            </span>
                        )
                    }

                    return (
                        <span
                            key={idx}
                            onClick={() => onSelect(isSelected ? null : idx)}
                            className={cn(
                                "relative cursor-pointer mr-1 px-1 py-0.5 rounded transition-all duration-200 group select-none decoration-clone box-decoration-clone",
                                // Error Styles (Red)
                                correction.error && !isSelected && "bg-rose-50 hover:bg-rose-100 text-slate-700 decoration-rose-300/50 underline decoration-2 underline-offset-4",
                                correction.error && isSelected && "bg-rose-100 text-rose-900 decoration-rose-500 underline decoration-2 underline-offset-4 shadow-sm ring-1 ring-rose-200",

                                // Suggestion Styles (Blue)
                                !correction.error && !isSelected && "bg-blue-50 hover:bg-blue-100 text-slate-700 decoration-blue-300/50 underline decoration-2 underline-offset-4",
                                !correction.error && isSelected && "bg-blue-100 text-blue-900 decoration-blue-500 underline decoration-2 underline-offset-4 shadow-sm ring-1 ring-blue-200"
                            )}
                        >
                            {segment}
                            {/* Marker badge for quick scanning */}
                            {correction.error && (
                                <sup className="font-sans text-[10px] font-black text-rose-500 ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    !
                                </sup>
                            )}
                            {!correction.error && (
                                <sup className="font-sans text-[10px] font-black text-blue-500 ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    ✦
                                </sup>
                            )}
                        </span>
                    )
                })}
            </p>
        </div>
    )
}
