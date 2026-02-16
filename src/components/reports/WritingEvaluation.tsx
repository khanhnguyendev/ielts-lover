"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { WritingSampleData, CEFR_COLORS } from "@/lib/sample-data"
import { HighlightedText } from "./highlighted-text"
import { Button } from "@/components/ui/button"
import { Info, ChevronRight, Star, AlertCircle } from "lucide-react"

interface WritingEvaluationProps {
    data: WritingSampleData
}

export function WritingEvaluation({ data }: WritingEvaluationProps) {
    const [viewMode, setViewMode] = React.useState<"original" | "feedback">("feedback")
    const [activeTab, setActiveTab] = React.useState<"tasks" | "vocabulary" | "grammar">("tasks")
    const [activeAnnotationId, setActiveAnnotationId] = React.useState<number | null>(null)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Exercise Prompt */}
            {data.prompt && (
                <div className="bg-white rounded-[32px] border p-10 shadow-sm space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Practice Question</h4>

                    <div className="space-y-6">
                        {data.imageUrl && (
                            <div className="rounded-[24px] overflow-hidden border bg-slate-50 max-w-2xl mx-auto shadow-inner">
                                <img
                                    src={data.imageUrl}
                                    alt="Exercise Visual"
                                    className="w-full h-auto object-contain max-h-[400px]"
                                />
                            </div>
                        )}
                        <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {data.prompt}
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Header */}
            <div className="flex items-center justify-between">
                <div className="flex bg-[#F9FAFB] p-1 rounded-xl border">
                    <button
                        onClick={() => setViewMode("original")}
                        className={cn(
                            "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                            viewMode === "original" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Original
                    </button>
                    <button
                        onClick={() => setViewMode("feedback")}
                        className={cn(
                            "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                            viewMode === "feedback" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Feedback
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8">
                {/* Left Column: Essay content */}
                <div className="bg-white rounded-[32px] border p-10 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Your Answer</h4>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Word Count: {data.originalText?.split(/\s+/).filter(Boolean).length || 0}
                            </span>
                        </div>
                    </div>

                    <HighlightedText
                        fragments={data.feedbackText}
                        showFeedback={viewMode === "feedback"}
                        activeAnnotationId={activeAnnotationId || undefined}
                        onAnnotationClick={(id) => {
                            setActiveAnnotationId(id)
                            setActiveTab("tasks")
                        }}
                    />
                </div>

                {/* Right Column: Analysis cards */}
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b">
                        {[
                            { id: "tasks", label: "Task Achievement" },
                            { id: "vocabulary", label: "Vocabulary" },
                            { id: "grammar", label: "Grammar" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative",
                                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === "vocabulary" ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white rounded-[24px] border p-6 shadow-sm space-y-6">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">CEFR Distribution</h5>
                                <div className="space-y-4">
                                    {data.cefrDistribution.map((item) => (
                                        <div key={item.level} className="space-y-1.5 text-[10px] font-bold">
                                            <div className="flex justify-between">
                                                <span className={cn(CEFR_COLORS[item.level].color)}>{item.level}</span>
                                                <span className="text-muted-foreground">{item.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000", CEFR_COLORS[item.level].bg)}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            {data.feedbackCards
                                .filter(card => activeTab === "tasks" ? (card.type === "Task Achievement" || card.type === "Coherence" || card.type === "Vocabulary") : card.type === "Grammar")
                                .map((card) => (
                                    <div
                                        key={card.id}
                                        className={cn(
                                            "bg-white rounded-[24px] border p-6 shadow-sm space-y-4 transition-all hover:shadow-md cursor-pointer",
                                            activeAnnotationId === card.id && "border-primary ring-1 ring-primary/20 bg-primary/[0.02]"
                                        )}
                                        onClick={() => setActiveAnnotationId(card.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-black">
                                                    {card.id}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{card.category}</span>
                                            </div>
                                            <div className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[8px] font-black uppercase">Mistake</div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold line-through opacity-60">{card.original}</div>
                                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">{card.suggested}</div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">{card.explanation}</p>
                                        </div>

                                        <div className="pt-4 border-t border-dashed flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-amber-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Fix this to score 8+</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg">
                                                Explain why
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
