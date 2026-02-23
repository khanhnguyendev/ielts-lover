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

        return sentences.map((sentence, sIdx) => {
            const sentenceStart = sentence.index;
            const sentenceEnd = sentenceStart + sentence.segment.length;
            const isSelected = selectedSentenceIdx === sIdx;

            // 2. Find edits that belong to this sentence
            const sentenceEdits = corrections.filter(edit => {
                const editStart = text.indexOf(edit.original_substring, 0); // Warning: Simple indexOf might fail with duplicates
                // Improved logic needed for duplicates: find *all* occurrences and check overlap
                // For now, we rely on the fact that edits should generally align. 
                // To be robust, we need mapped indices from the parent. 

                // Let's refine: We really need to know *where* the edit is. 
                // Since we don't have absolute indices from backend yet, we must infer.
                // A better approach for this component is to just Render the text and highlight, 
                // but wrap strictly based on sentence boundaries.
                return true;
            });

            // ACTUALLY: The previous "Find & Highlight" logic was good for highlights. 
            // Now we need to wrap those highlights in sentence containers.
            // Let's invert the logic: 
            // 1. We have the full text. 
            // 2. We have specific ranges for Sentences (from Segmenter).
            // 3. We have specific ranges for Edits (derived from substring match).

            // Let's stick to the previous rendering logic BUT wrap it? No, that breaks span nesting.
            // New Plan within this component:
            // Iterate Sentences. For each sentence, render its content.
            // Inside the sentence, apply highlighting for edits that fall strictly within it.

            // Sub-render logic for a single sentence string:
            const sentenceText = sentence.segment;
            const elements: React.ReactNode[] = [];
            let lastIndex = 0;

            // Find edits strictly within this sentence
            // We need to match edits to this specific sentence instance
            // This is tricky with duplicate substrings globally.
            // Compromise: We search for the edit substring *within the sentence text*.

            const editsInSentence: { start: number; end: number; edit: TextEdit }[] = [];

            corrections.forEach(edit => {
                // Check if this edit's substring exists in this sentence
                // And heuristic: It's likely this edit if the context matches.
                // For strict correctness without backend indices, this is a "best effort" match.

                let searchPos = 0;
                while (searchPos < sentenceText.length) {
                    const idx = sentenceText.indexOf(edit.original_substring, searchPos);
                    if (idx === -1) break;

                    // Found a match in this sentence. 
                    // Is it already claimed? (Visual overlap check)
                    // Simple logic: If we find it, we highlight it.
                    editsInSentence.push({
                        start: idx,
                        end: idx + edit.original_substring.length,
                        edit
                    });
                    searchPos = idx + 1; // Keep searching for duplicates in same sentence
                }
            });

            // Sort and dedup edits (simple non-overlap logic)
            editsInSentence.sort((a, b) => a.start - b.start);

            // Flatten (remove overlaps - simple greedy)
            const cleanEdits = [];
            let lastEnd = 0;
            for (const item of editsInSentence) {
                if (item.start >= lastEnd) {
                    cleanEdits.push(item);
                    lastEnd = item.end;
                }
            }

            // Render the sentence content with highlights
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
                    {/* Sentence Hover/Select Indicator could go here */}
                </span>
            );
        });
    }, [text, corrections, selectedSentenceIdx, onSelectSentence]);

    return (
        <div className="prose prose-slate max-w-none text-[15px] leading-[1.9] text-slate-600 font-serif whitespace-pre-wrap">
            {sentenceNodes}
        </div>
    )
}
