"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SpeakingSampleData, CEFR_COLORS } from "@/lib/sample-data"
import { Button } from "@/components/ui/button"
import { Play, Volume2, Info, ChevronRight, AlertCircle, BarChart3, Languages, Mic2, PenTool } from "lucide-react"

interface SpeakingEvaluationProps {
    data: SpeakingSampleData
}

export function SpeakingEvaluation({ data }: SpeakingEvaluationProps) {
    const [viewMode, setViewMode] = React.useState<"original" | "feedback">("feedback")
    const [activeTab, setActiveTab] = React.useState<"fluency" | "vocabulary" | "pronunciation" | "grammar">("fluency")
    const [isPlaying, setIsPlaying] = React.useState(false)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Audio Player Header */}
            <div className="bg-white rounded-[32px] border p-8 flex items-center gap-8 shadow-sm">
                <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-primary hover:scale-105 transition-transform shrink-0"
                >
                    <Play className={cn("h-8 w-8 text-white fill-white", isPlaying && "hidden")} />
                    <div className={cn("w-6 h-6 border-b-2 border-white rounded-full animate-spin", !isPlaying && "hidden")} />
                </Button>
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span>Recording Session</span>
                        <span>0:00 / 1:19</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative group cursor-pointer">
                        <div className="absolute inset-0 bg-primary/10 w-1/3" />
                        <div className="w-1 h-full bg-primary absolute left-1/3 z-10" />
                    </div>
                </div>
            </div>

            {/* Toggle & Content Grid */}
            <div className="flex items-center justify-between">
                <div className="flex bg-[#F9FAFB] p-1 rounded-xl border">
                    {["original", "feedback"].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-xs font-bold transition-all capitalize",
                                viewMode === mode ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8">
                {/* Left Column: Transcript */}
                <div className="bg-white rounded-[32px] border p-10 shadow-sm space-y-8 h-fit">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Transcript</h4>

                    <div className="space-y-10">
                        {data.transcript.map((segment, idx) => (
                            <div key={idx} className="flex gap-6 group">
                                <div className="pt-1 shrink-0">
                                    <button className="w-8 h-8 rounded-lg bg-slate-50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                                        <Volume2 className="h-4 w-4" />
                                    </button>
                                    <div className="text-[10px] font-bold text-muted-foreground/40 mt-1 text-center">{segment.startTime}</div>
                                </div>
                                <div className="space-y-2 pt-1">
                                    <div className="flex flex-wrap gap-x-1 gap-y-1.5">
                                        {segment.text.map((item, i) => {
                                            const cefr = item.cefr ? CEFR_COLORS[item.cefr] : null
                                            const showMarks = viewMode === "feedback"

                                            return (
                                                <span
                                                    key={i}
                                                    className={cn(
                                                        "text-lg font-medium leading-relaxed transition-all cursor-default rounded px-0.5",
                                                        showMarks && cefr && cn(cefr.color, cefr.bg),
                                                        showMarks && item.pronunciation === "Needs Improvement" && "bg-red-50 text-red-600 border-b-2 border-red-500",
                                                        showMarks && item.pronunciation === "Fair" && "bg-orange-50 text-orange-600 border-b-2 border-orange-500"
                                                    )}
                                                >
                                                    {item.word}{" "}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Criteria Tabs */}
                <div className="space-y-6">
                    <div className="flex border-b overflow-x-auto scrollbar-hide">
                        {[
                            { id: "fluency", label: "Fluency", icon: Mic2 },
                            { id: "vocabulary", label: "Vocabulary", icon: Languages },
                            { id: "pronunciation", label: "Pronunciation", icon: BarChart3 },
                            { id: "grammar", label: "Grammar", icon: PenTool }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative flex flex-col items-center gap-2 min-w-[90px]",
                                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[24px] border p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {activeTab === "vocabulary" && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">CEFR Distribution</h5>
                                    <div className="h-6 w-full flex rounded-lg overflow-hidden border border-white">
                                        <div className="h-full bg-slate-200" style={{ width: "40%" }} />
                                        <div className="h-full bg-emerald-400" style={{ width: "20%" }} />
                                        <div className="h-full bg-blue-400" style={{ width: "25%" }} />
                                        <div className="h-full bg-purple-400" style={{ width: "10%" }} />
                                        <div className="h-full bg-orange-400" style={{ width: "5%" }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2">
                                        {Object.entries(CEFR_COLORS).map(([level, data]) => (
                                            <div key={level} className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", data.bg)} />
                                                <span className="text-[10px] font-bold text-muted-foreground">{level} Word</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Paraphrasing Tips</h5>
                                    <div className="space-y-3">
                                        {[
                                            { word: "Beautiful", tips: ["Picturesque", "Stunning", "Breathtaking"] },
                                            { word: "Very", tips: ["Extremely", "Exceptionally", "immensely"] }
                                        ].map((tip, i) => (
                                            <div key={i} className="p-4 rounded-xl border bg-[#F9FAFB] space-y-2">
                                                <div className="text-[10px] font-black text-red-500 uppercase line-through">{tip.word}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {tip.tips.map(t => (
                                                        <span key={t} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[9px] font-black uppercase tracking-wider">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "pronunciation" && (
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Pronunciation Accuracy</h5>
                                <div className="space-y-4">
                                    {[
                                        { word: "Urbanization", accuracy: 85, phonetic: "/ˌɜː.bə.naɪˈzeɪ.ʃən/" },
                                        { word: "Environment", accuracy: 42, phonetic: "/ɪnˈvaɪ.rən.mənt/" }
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-black font-outfit">{p.word}</div>
                                                <div className="text-[10px] font-medium text-muted-foreground">{p.phonetic}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn("text-xs font-black", p.accuracy > 70 ? "text-emerald-600" : "text-orange-500")}>
                                                    {p.accuracy}%
                                                </div>
                                                <div className="h-1 w-16 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div className={cn("h-full", p.accuracy > 70 ? "bg-emerald-500" : "bg-orange-500")} style={{ width: `${p.accuracy}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "fluency" && (
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Fluency Analysis</h5>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    Your speech is generally fluent but contains several self-corrections and long pauses (hesitations) when searching for vocabulary.
                                </p>
                                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Examiner Note</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">Try to use filler words like "actually" or "to be honest" instead of long silences to maintain coherence.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "grammar" && (
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Grammar Fixes</h5>
                                {[
                                    { original: "in the nature", suggested: "in nature", exp: "Usually, we don't use 'the' before 'nature' when referring to the environment." }
                                ].map((g, i) => (
                                    <div key={i} className="space-y-3 p-4 rounded-xl border">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs line-through text-red-500 font-bold">{g.original}</span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-emerald-600 font-bold">{g.suggested}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{g.exp}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
