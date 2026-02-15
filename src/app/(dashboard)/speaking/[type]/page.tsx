"use client"

import * as React from "react"
import Link from "next/link"
import {
    ChevronLeft,
    Mic2,
    Pause,
    Play,
    Sparkles,
    Info,
    Clock,
    History,
    CheckCircle2,
    X,
    Volume2,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function SpeakingPracticePage({ params }: { params: { type: string } }) {
    const [currentQuestion, setCurrentQuestion] = React.useState(1)
    const [isRecording, setIsRecording] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(45) // 45s for Part 1 answer
    const [status, setStatus] = React.useState<"PRACTICE" | "PROCESSING" | "COMPLETE">("PRACTICE")

    const questions = [
        "Do you like advertisements?",
        "What kind of advertisements do you dislike?",
        "Do you think there are too many advertisements these days?",
        "Have you ever bought something because of an advertisement?"
    ]

    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        } else if (timeLeft === 0) {
            setIsRecording(false)
        }
        return () => clearInterval(timer)
    }, [isRecording, timeLeft])

    const handleNext = () => {
        if (currentQuestion < questions.length) {
            setCurrentQuestion(prev => prev + 1)
            setTimeLeft(45)
            setIsRecording(false)
        } else {
            setStatus("PROCESSING")
            setTimeout(() => setStatus("COMPLETE"), 3000)
        }
    }

    if (status === "PROCESSING") {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8 -m-8 lg:-m-12">
                <div className="max-w-md w-full space-y-12 text-center">
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                        <div className="absolute inset-4 bg-primary/20 rounded-full animate-ping [animation-delay:0.2s]" />
                        <div className="relative z-10 w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
                            <Sparkles className="h-10 w-10 text-white fill-white animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black font-outfit">Analyzing your response...</h2>
                        <p className="text-muted-foreground font-medium">Our AI is evaluating your fluency, pronunciation, and vocabulary range.</p>
                    </div>
                    <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden border">
                        <div className="bg-primary h-full w-1/2 animate-[progress_3s_ease-in-out]" />
                    </div>
                </div>
            </div>
        )
    }

    if (status === "COMPLETE") {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8 -m-8 lg:-m-12">
                <div className="max-w-md w-full space-y-10 text-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black font-outfit">Practice Complete!</h2>
                        <p className="text-muted-foreground font-medium text-lg">Your report is ready for viewing.</p>
                    </div>
                    <Link href="/dashboard/reports/next-report">
                        <Button className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-105">
                            View Full Report
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#F9FAFB] flex flex-col p-8 -m-8 lg:-m-12 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-12 pt-8">
                <Link href="/dashboard/speaking" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Tasks
                </Link>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black font-mono">00:{timeLeft.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Question {currentQuestion}/{questions.length}</span>
                        <div className="flex gap-1.5">
                            {questions.map((_, i) => (
                                <div key={i} className={cn(
                                    "w-3 h-1.5 rounded-full transition-all",
                                    i + 1 === currentQuestion ? "w-8 bg-primary" : i + 1 < currentQuestion ? "bg-green-500" : "bg-muted"
                                )} />
                            ))}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-16 max-w-4xl mx-auto w-full">

                {/* Instruction / Catbot */}
                <div className="flex items-start gap-6 max-w-2xl">
                    <div className="w-14 h-14 bg-white border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/5 transition-transform hover:scale-110">
                        <span className="text-3xl">🐱</span>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] rounded-tl-none shadow-xl shadow-primary/5 border border-primary/5 relative">
                        <div className="absolute top-0 left-0 -translate-x-full translate-y-4 border-[12px] border-transparent border-r-white" />
                        <p className="text-xl font-black font-outfit leading-relaxed">
                            {questions[currentQuestion - 1]}
                        </p>
                    </div>
                </div>

                {/* Recording Visualization */}
                <div className="relative w-full aspect-[4/1] flex items-center justify-center gap-2">
                    {!isRecording ? (
                        <div className="text-center space-y-4 cursor-pointer group" onClick={() => setIsRecording(true)}>
                            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 group-hover:scale-110 transition-all">
                                <Mic2 className="h-10 w-10" />
                            </div>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors">Start Recording</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 h-32 w-full max-w-lg">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-primary rounded-full animate-wave"
                                    style={{
                                        height: `${20 + Math.random() * 80}%`,
                                        animationDelay: `${i * 0.05}s`,
                                        opacity: 0.3 + (i / 24) * 0.7
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                    {isRecording && (
                        <Button
                            onClick={handleNext}
                            className="bg-primary hover:bg-primary/90 text-white h-16 px-12 rounded-[24px] font-black text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            Finish Answer
                            <CheckCircle2 className="ml-3 h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="px-12 py-10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground/40">
                    <Volume2 className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Auto-input detection active</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">Skip Question</button>
                    <div className="w-px h-4 bg-muted" />
                    <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5" /> Practice Tips
                    </button>
                </div>
            </div>
        </div>
    )
}
