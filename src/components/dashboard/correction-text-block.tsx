"use client"

import { cn } from "@/lib/utils"
import { TextEdit } from "@/types/writing"
import { useMemo } from "react"

interface CorrectionTextBlockProps {
    text: string
    corrections: TextEdit[]
    selectedSentenceIdx: number | null
    onSelectSentence: (idx: number | null) => void
}

export function CorrectionTextBlock({ text, corrections, selectedSentenceIdx, onSelectSentence }: CorrectionTextBlockProps) {
    const sentenceNodes = useMemo(() => {
        if (!text) return [];

        // 1. Segment text into sentences
        const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
        const sentences = Array.from(segmenter.segment(text));

        const nodes = sentences.map((sentence, sIdx) => {
            const isSelected = selectedSentenceIdx === sIdx;
            const sentenceText = sentence.segment;
            const elements: React.ReactNode[] = [];
            let lastIndex = 0;

            const editsInSentence: { start: number; end: number; edit: TextEdit }[] = [];

            corrections.forEach(edit => {
                let searchPos = 0;
                while (searchPos < sentenceText.length) {
                    const idx = sentenceText.indexOf(edit.original_substring, searchPos);
                    if (idx === -1) break;

                    editsInSentence.push({
                        start: idx,
                        end: idx + edit.original_substring.length,
                        edit
                    });
                    searchPos = idx + 1;
                }
            });

            editsInSentence.sort((a, b) => a.start - b.start);

            const cleanEdits = [];
            let lastEnd = 0;
            for (const item of editsInSentence) {
                if (item.start >= lastEnd) {
                    cleanEdits.push(item);
                    lastEnd = item.end;
                }
            }

            cleanEdits.forEach((pos, i) => {
                if (pos.start > lastIndex) {
                    elements.push(<span key={`txt-${i}`}>{sentenceText.slice(lastIndex, pos.start)}</span>);
                }

                const isError = pos.edit.error_type === 'grammar' || pos.edit.error_type === 'spelling';

                elements.push(
                    <span
                        key={`high-${i}`}
                        className={cn(
                            "px-0.5 rounded transition-colors",
                            isError ? "bg-rose-100/50 text-rose-900 border-b border-rose-200" : "bg-blue-100/50 text-blue-900 border-b border-blue-200"
                        )}
                    >
                        {sentenceText.slice(pos.start, pos.end)}
                    </span>
                );
                lastIndex = pos.end;
            });

            if (lastIndex < sentenceText.length) {
                elements.push(<span key="txt-end">{sentenceText.slice(lastIndex)}</span>);
            }

            return (
                <span
                    key={sIdx}
                    onClick={() => onSelectSentence(isSelected ? null : sIdx)}
                    className={cn(
                        "relative inline transition-colors duration-200 cursor-pointer rounded px-0.5 -mx-0.5 hover:bg-slate-100",
                        isSelected && "bg-indigo-50/80 shadow-sm ring-1 ring-indigo-100 z-10"
                    )}
                >
                    {elements}
                </span>
            );
        });

        // 2. ROBUSTNESS CHECK: Render any trailing text that Segmenter missed
        const lastSentence = sentences[sentences.length - 1];
        if (lastSentence) {
            const totalSegmentedLength = lastSentence.index + lastSentence.segment.length;
            if (totalSegmentedLength < text.length) {
                const remainingText = text.slice(totalSegmentedLength);
                nodes.push(
                    <span key="trailing" className="text-slate-500 italic opacity-60">
                        {remainingText}
                    </span>
                );
            }
        } else if (text.length > 0) {
            // No sentences found at all? Just render the text.
            nodes.push(<span key="fallback">{text}</span>);
        }

        return nodes;
    }, [text, corrections, selectedSentenceIdx, onSelectSentence]);

    return (
        <div className="prose prose-slate max-w-none text-[15px] leading-[1.9] text-slate-600 font-serif whitespace-pre-wrap">
            {sentenceNodes}
        </div>
    )
}
