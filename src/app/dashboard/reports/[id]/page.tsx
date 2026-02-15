"use client"

import * as React from "react"
import Link from "next/link"
import {
    ChevronLeft,
    MessageCircle,
    Share2,
    Lock,
    Info,
    ChevronDown,
    Play,
    Volume2,
    Sparkles,
    History,
    Maximize2,
    Send,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { WritingEvaluation } from "@/components/reports/WritingEvaluation"
import { SpeakingEvaluation } from "@/components/reports/SpeakingEvaluation"
import { RewriterEvaluation } from "@/components/reports/RewriterEvaluation"
import { SAMPLE_REPORTS } from "@/lib/sample-data"

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [isCatbotOpen, setIsCatbotOpen] = React.useState(true)

    // Check if it's a sample report
    const sampleData = SAMPLE_REPORTS[parseInt(id)]
    const isSample = !!sampleData

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F9FAFB] -m-8 lg:-m-12">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                <div className="max-w-6xl mx-auto space-y-10 pb-20">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Link href={isSample ? "/dashboard/samples" : "/dashboard/reports"} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                            {isSample ? "Back to Samples" : "Back"}
                        </Link>
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-bold text-muted-foreground">
                                {isSample ? `${sampleData.type} Sample Analysis` : "Analysis"}
                                <span className="text-muted-foreground/40 ml-2">Date: 2026-02-14 23:24:57</span>
                            </span>
                            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-lg">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Score Overview */}
                    <div className="bg-white rounded-[4px] sm:rounded-[40px] border p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between shadow-sm relative overflow-hidden group gap-6">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <Sparkles className="h-40 w-40 text-primary" />
                        </div>

                        <div className="flex items-center gap-8 sm:gap-12 relative z-10">
                            <div className="text-center">
                                <div className="text-5xl sm:text-6xl font-black font-outfit text-primary flex items-baseline gap-1">
                                    {isSample ? sampleData.bandScore.toFixed(1) : "1.0"}
                                    <span className="text-xl sm:text-2xl text-muted-foreground/30 font-bold">/9.0</span>
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 mt-1">Overall Band Score</p>
                            </div>

                            <div className="w-px h-16 bg-muted mx-2 hidden sm:block" />

                            <div className="text-center sm:text-left">
                                <div className="text-3xl sm:text-4xl font-black font-outfit text-purple-600">
                                    {isSample ? sampleData.cefrLevel : "A1"}
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 mt-1">CEFR Level</p>
                            </div>
                        </div>

                        {!isSample && (
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black text-sm shadow-xl shadow-primary/20 relative z-10 w-full sm:w-auto">
                                <MessageCircle className="mr-2 h-5 w-5 fill-white" />
                                Chat with your personal AI tutor
                            </Button>
                        )}
                        {isSample && (
                            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                                <div className="hidden sm:flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 sm:flex-none">
                                    <p className="text-xs font-bold text-slate-900">Expert Reviewed</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Verified by IELTS Examiners</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {isSample ? (
                        <>
                            {sampleData.type === "Writing" ? (
                                <WritingEvaluation data={sampleData as any} />
                            ) : sampleData.type === "Speaking" ? (
                                <SpeakingEvaluation data={sampleData as any} />
                            ) : (
                                <RewriterEvaluation data={sampleData as any} />
                            )}
                        </>
                    ) : (
                        <>
                            {/* Premium Blur Overlay (Free View) */}
                            <div className="bg-white rounded-[32px] border p-12 text-center space-y-6 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 space-y-4">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
                                        <Lock className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black font-outfit">You are viewing a free report</h3>
                                    <p className="text-muted-foreground font-medium max-w-sm">Go Premium to get detailed feedback and improve your scores!</p>
                                    <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                                        <Button className="bg-primary text-white h-14 rounded-2xl font-black text-sm">View Premium Plans</Button>
                                        <Button variant="ghost" className="text-primary font-bold">View Premium Report</Button>
                                    </div>
                                </div>

                                {/* Content underneath (Blurred) */}
                                <div className="grid grid-cols-2 gap-6 opacity-30 select-none pointer-events-none grayscale">
                                    <div className="h-40 bg-muted rounded-2xl" />
                                    <div className="h-40 bg-muted rounded-2xl" />
                                    <div className="h-60 bg-muted rounded-2xl col-span-2" />
                                </div>
                            </div>

                            {/* Criteria Breakdown */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold font-outfit">Criteria Breakdown</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">Performance analysis based on official IELTS band descriptors</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <CriteriaCard title="Fluency and Coherence" score={1.0} color="text-blue-500" />
                                    <CriteriaCard title="Lexical Resource" score={1.0} color="text-orange-500" />
                                    <CriteriaCard title="Grammar, Errors and Corrections" score={1.0} color="text-indigo-600" />
                                    <CriteriaCard title="Pronunciation" score={1.0} color="text-amber-500" />
                                </div>
                            </div>

                            {/* Detailed Feedback */}
                            <div className="bg-white rounded-[32px] border p-10 space-y-10 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <History className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold font-outfit">Detailed Feedback</h3>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-lg font-bold font-outfit">Speaking Task</h4>
                                    <div className="flex gap-4">
                                        {["Q 1", "Q 2", "Q 3", "Q 4"].map((q, i) => (
                                            <Button key={q} variant={i === 0 ? "default" : "outline"} className={cn("h-12 w-20 rounded-xl font-black text-sm", i === 0 ? "bg-primary text-white" : "border-muted-foreground/20")}>
                                                {q}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                        <p className="text-sm font-bold text-primary">● Do you like advertisements?</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold">My Answer</span>
                                            <span className="text-xs font-medium text-muted-foreground"><Volume2 className="h-4 w-4 inline mr-1" /> 0:03</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl">
                                            <Button size="icon" className="h-10 w-10 bg-primary rounded-full hover:scale-110 transition-transform">
                                                <Play className="h-4 w-4 text-white fill-white" />
                                            </Button>
                                            <div className="flex-1 bg-muted/40 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full w-0" />
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground/60 w-12">0:00 / 0:03</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <span className="text-sm font-bold">Your Answer</span>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Good pause
                                                </span>
                                                <span className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Bad pause
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-lg leading-relaxed font-medium text-muted-foreground selection:bg-primary/20">
                                            No, because... it is... <span className="bg-red-500/10 text-red-600 px-1 rounded mx-0.5 border-b-2 border-red-500">very annoying</span>... when I am watching movie...
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Need Guidance */}
                            <div className="bg-purple-50 rounded-[32px] p-10 text-center space-y-6">
                                <h3 className="text-xl font-bold font-outfit">Need personalized guidance?</h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">Chat with your AI tutor for specific questions about your performance</p>
                                <Button className="bg-primary text-white h-12 px-8 rounded-xl font-black text-xs shadow-lg shadow-primary/20">
                                    <MessageCircle className="mr-2 h-4 w-4 fill-white" />
                                    Chat with AI tutor
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Catbot Sidebar (Only for non-samples or if needed) */}
            {!isSample && (
                <div
                    className={cn(
                        "bg-white border-l transition-all duration-500 flex flex-col relative hidden xl:flex",
                        isCatbotOpen ? "w-[400px]" : "w-0 overflow-hidden"
                    )}
                >
                    <button
                        onClick={() => setIsCatbotOpen(false)}
                        className="absolute right-6 top-6 z-20 hover:rotate-90 transition-transform"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>

                    <div className="p-8 space-y-8 flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-4 border-b pb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                                <span className="text-2xl">🐱</span>
                            </div>
                            <div>
                                <h4 className="font-black font-outfit">Catbot - Personal Tutor</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                        <History className="h-3 w-3" /> History
                                    </button>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                        <Maximize2 className="h-3 w-3" /> Full
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
                            <div className="bg-muted/30 p-5 rounded-2xl rounded-tl-none border">
                                <p className="text-sm font-medium leading-relaxed">
                                    Hey! I&apos;m your personal IELTS tutor. Got questions about your report? Go ahead and ask.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Suggested questions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {["Give improvement tips", "Find my key mistakes", "Explain my score", "Help with ideas", "Suggest new vocabulary"].map(q => (
                                        <button key={q} className="text-[11px] font-bold px-3 py-2 bg-white border border-muted hover:border-primary hover:text-primary rounded-lg transition-all shadow-sm">
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t mt-auto">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Ask anything in your language"
                                    className="w-full bg-muted/30 border border-muted-foreground/10 rounded-2xl h-14 pl-5 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <button className="absolute right-2 top-2 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function CriteriaCard({ title, score, color }: { title: string, score: number, color: string }) {
    return (
        <div className="bg-white p-8 rounded-[32px] border shadow-sm space-y-6 group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", color.replace("text-", "bg-"))} />
                    <span className="text-sm font-bold">{title}</span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/30 hover:text-muted-foreground cursor-pointer" />
                </div>
                <span className={cn("text-2xl font-black font-outfit", color)}>{score.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">You are unable to communicate and produce no rateable language.</p>
            <div className="pt-6 border-t border-dashed">
                <button className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">
                    Show score details
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}
