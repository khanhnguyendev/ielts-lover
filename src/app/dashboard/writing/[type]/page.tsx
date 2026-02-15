"use client"

import * as React from "react"
import Link from "next/link"
import {
    ChevronLeft,
    Clock,
    Sparkles,
    HelpCircle,
    Save,
    CheckCircle2,
    Info,
    Maximize2,
    ChevronRight,
    ChevronDown,
    Monitor,
    Layout
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function WritingExercisePage({ params }: { params: Promise<{ type: string }> }) {
    const resolvedParams = React.use(params)
    const [text, setText] = React.useState("")
    const [timeLeft, setTimeLeft] = React.useState(1200) // 20 mins for Task 1
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length

    // Timer logic
    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white -m-8 lg:-m-12">
            {/* Question Side */}
            <div className="w-1/2 overflow-y-auto p-12 border-r bg-[#F9FAFB] scrollbar-hide">
                <div className="max-w-xl mx-auto space-y-10 pb-20">
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                        <Link href="/writing" className="hover:text-primary flex items-center gap-1 transition-colors">
                            Writing Tasks
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-slate-900">Academic Task 1</span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black font-outfit">Question</h2>
                        <div className="bg-white rounded-[40px] border p-10 space-y-8 shadow-sm">
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                The chart below shows the weight of people in the UK from 1990 to 2010.
                            </p>
                            <p className="text-sm font-black italic text-slate-900/80">
                                Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
                            </p>

                            <div className="aspect-video bg-muted/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-muted-foreground/10 group cursor-zoom-in">
                                <div className="text-center space-y-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Monitor className="h-8 w-8 mx-auto" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Click to expand chart</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-dashed space-y-4">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Minimum Requirements:</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                                        <span className="text-[10px] font-bold text-purple-700">150+ Words</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                                        <span className="text-[10px] font-bold text-blue-700">20 Minutes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Writing Side */}
            <div className="w-1/2 flex flex-col p-12 overflow-hidden">
                <div className="max-w-2xl mx-auto w-full flex flex-col h-full space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock className="h-5 w-5" />
                                <span className="text-xl font-black font-mono">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="h-4 w-px bg-muted" />
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">Word Count:</span>
                                <span className={cn(
                                    "text-xs font-black",
                                    wordCount >= 150 ? "text-green-600" : "text-primary"
                                )}>
                                    {wordCount} / 150
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground">
                                <Layout className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground">
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-white border-2 border-primary/5 focus-within:border-primary/20 rounded-[40px] overflow-hidden shadow-2xl shadow-primary/5 transition-all flex flex-col p-8">
                        <Textarea
                            value={text}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                            placeholder="Start writing your answer here..."
                            className="flex-1 w-full border-none focus-visible:ring-0 text-lg leading-relaxed font-medium placeholder:text-muted-foreground/30 resize-none scrollbar-hide bg-transparent"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-2 rounded-xl">
                                <Save className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Auto-saved 2s ago</span>
                        </div>

                        <Button className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            Finish and Get Feedback
                            <Sparkles className="ml-2 h-5 w-5 fill-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
