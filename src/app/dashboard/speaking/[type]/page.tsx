"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Mic2,
    Sparkles,
    History,
    CheckCircle2,
    X,
    Maximize2,
    MessageSquare,
    Lightbulb,
    BookOpen,
    HelpCircle,
    Play,
    ArrowRight,
    FileText,
    Settings,
    ChevronRight,
    Volume2,
    Loader2,
    AudioLines,
    Brain,
    BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getExerciseById, startExerciseAttempt, submitAttempt, saveAttemptDraft } from "@/app/actions"
import { Exercise, Attempt } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { FeedbackModal } from "@/components/dashboard/feedback-modal"
import { useNotification } from "@/lib/contexts/notification-context"
import { BackButton } from "@/components/global/back-button"
import { useTitle } from "@/lib/contexts/title-context"

export default function SpeakingPracticePage({ params }: { params: { type: string } }) {
    const [exercise, setExercise] = React.useState<Exercise | null>(null)
    const { setTitle } = useTitle()

    React.useEffect(() => {
        if (exercise) {
            const label = exercise.type.startsWith("speaking_part")
                ? `Speaking ${exercise.type.replace("_", " ").toUpperCase()}`
                : "Speaking Practice"
            setTitle(label)
        }
        return () => setTitle(null)
    }, [exercise, setTitle])

    const [currentQuestion, setCurrentQuestion] = React.useState(1)
    const [isRecording, setIsRecording] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(0)
    const [status, setStatus] = React.useState<"PRACTICE" | "PROCESSING" | "COMPLETE">("PRACTICE")
    const [processingStep, setProcessingStep] = React.useState(0)
    const [sidebarExpanded, setSidebarExpanded] = React.useState(true)

    const [currentAttempt, setCurrentAttempt] = React.useState<Attempt | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [showFeedback, setShowFeedback] = React.useState(false)
    const [feedbackData, setFeedbackData] = React.useState<{ score?: number, feedback?: string, attemptId?: string }>({})
    const { notifySuccess, notifyWarning, notifyError } = useNotification()
    const router = useRouter()

    React.useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            try {
                const data = await getExerciseById(params.type)
                setExercise(data)

                const attempt = await startExerciseAttempt(params.type)
                setCurrentAttempt(attempt)
            } catch (err) {
                console.error("Failed to init speaking practice:", err)
            } finally {
                setIsLoading(false)
            }
        }
        init()
    }, [params.type])

    const questions = [
        "Do you like advertisements?",
        "What kind of advertisements do you dislike?",
        "Do you think there are too many advertisements these days?",
        "Have you ever bought something because of an advertisement?"
    ]

    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (isRecording) {
            timer = setInterval(() => setTimeLeft(prev => prev + 1), 1000)
        }
        return () => clearInterval(timer)
    }, [isRecording])

    const handleMicClick = () => {
        if (isRecording) {
            setIsRecording(false)
            if (currentQuestion < questions.length) {
                // In a real app, we'd save the recording here
                setCurrentQuestion(prev => prev + 1)
                setTimeLeft(0)
            } else {
                setStatus("PROCESSING")
                setProcessingStep(1)
                setTimeout(() => setProcessingStep(2), 1500)
                setTimeout(() => setProcessingStep(3), 3500)
                setTimeout(() => setStatus("COMPLETE"), 5000)
            }
        } else {
            setIsRecording(true)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (status === "PROCESSING") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8">
                <div className="max-w-xl w-full bg-white rounded-[40px] border p-12 space-y-10 text-center shadow-2xl shadow-primary/5 animate-in fade-in duration-300">
                    {/* Animated icon */}
                    <div className="relative mx-auto w-fit">
                        <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center">
                            <Mic2 className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                        <div className="absolute -inset-2 rounded-[2.5rem] border-2 border-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black font-outfit text-slate-900">AI Evaluating...</h2>
                        <p className="text-sm text-slate-400 font-medium">Analyzing your speaking performance</p>
                    </div>

                    {/* Progress steps */}
                    <div className="max-w-sm mx-auto space-y-3">
                        {[
                            { icon: AudioLines, label: "Processing audio recording", step: 1 },
                            { icon: Brain, label: "Analyzing fluency & pronunciation", step: 2 },
                            { icon: BarChart3, label: "Scoring band descriptors", step: 3 },
                        ].map(({ icon: StepIcon, label, step }) => (
                            <div
                                key={step}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500",
                                    processingStep >= step
                                        ? "bg-primary/5 text-slate-900"
                                        : "text-slate-300"
                                )}
                            >
                                {processingStep > step ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                ) : processingStep === step ? (
                                    <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                                ) : (
                                    <StepIcon className="h-5 w-5 shrink-0" />
                                )}
                                <span className="text-sm font-bold">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (status === "COMPLETE") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8">
                <div className="max-w-xl w-full bg-white rounded-[40px] border p-12 space-y-12 text-center shadow-2xl shadow-primary/5">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black font-outfit text-slate-900 uppercase tracking-tight">Practice Complete!</h2>
                        <p className="text-muted-foreground font-bold">Your speaking attempt has been analyzed and evaluated.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-16 rounded-[24px] border-2 font-black text-sm uppercase tracking-widest"
                            onClick={() => router.push("/dashboard/speaking")}
                        >
                            History
                        </Button>
                        <Button
                            className="h-16 rounded-[24px] bg-[#7C3AED] hover:bg-[#6D28D9] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/25"
                            onClick={() => setShowFeedback(true)}
                        >
                            View Score
                        </Button>
                    </div>
                </div>

                <FeedbackModal
                    open={showFeedback}
                    onOpenChange={setShowFeedback}
                    title="Speaking Evaluation"
                    type="speaking"
                />
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-80px)] bg-[#F9FAFB] overflow-hidden relative">
            {/* Sidebar Context */}
            <div
                className={cn(
                    "bg-white border-r flex flex-col transition-all duration-500 ease-in-out relative z-10",
                    sidebarExpanded ? "w-[400px]" : "w-0 overflow-hidden border-none"
                )}
            >
                {/* Fixed Header in Sidebar */}
                <div className="p-8 border-b bg-white shrink-0">
                    <div className="flex items-center justify-between mb-8">
                        <BackButton />
                        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Speaking Mode</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7C3AED]">
                            <History size={12} />
                            <span>Question {currentQuestion} of {questions.length}</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight font-outfit uppercase">
                            Part 1: Introduction
                        </h1>
                    </div>
                </div>

                {/* Scrollable Questions List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {questions.map((q, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "p-6 rounded-[32px] transition-all duration-300 border-2",
                                idx + 1 === currentQuestion
                                    ? "bg-white border-[#7C3AED] shadow-xl shadow-primary/5"
                                    : idx + 1 < currentQuestion
                                        ? "bg-slate-50 border-transparent opacity-50"
                                        : "bg-white border-transparent text-slate-300"
                            )}
                        >
                            <div className="flex gap-4">
                                <span className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black",
                                    idx + 1 === currentQuestion ? "bg-[#7C3AED] text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {idx + 1}
                                </span>
                                <p className="font-bold text-sm leading-relaxed">{q}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Footer in Sidebar */}
                <div className="p-8 border-t bg-slate-50/50">
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Progress</span>
                            <span className="text-sm font-black text-slate-900">{Math.round((currentQuestion / questions.length) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-white rounded-full border p-0.5 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#7C3AED] to-indigo-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Sidebar Button */}
            <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-24 bg-white border border-l-0 rounded-r-2xl flex items-center justify-center text-slate-400 hover:text-[#7C3AED] transition-all duration-500",
                    sidebarExpanded ? "translate-x-[400px]" : "translate-x-0"
                )}
            >
                {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Main Practice Area */}
            <div className="flex-1 flex flex-col bg-[#F9FAFB] relative overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    {/* Recording Visualization */}
                    <div className="w-full max-w-2xl text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 font-outfit uppercase tracking-tight">
                                {isRecording ? "Listening..." : "Your Turn"}
                            </h2>
                            <p className="text-muted-foreground font-bold max-w-md mx-auto leading-relaxed">
                                {isRecording
                                    ? "Speak clearly. Click the button again when you finish your answer."
                                    : "Practice your answer for the highlighted question. Click the mic to start."
                                }
                            </p>
                        </div>

                        {/* Mic Button & Timer */}
                        <div className="relative">
                            {isRecording && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 bg-primary/10 rounded-full animate-ping" />
                                    <div className="absolute w-64 h-64 bg-primary/5 rounded-full animate-pulse delay-75" />
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-8">
                                <button
                                    onClick={handleMicClick}
                                    className={cn(
                                        "w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 transform active:scale-95 shadow-2xl",
                                        isRecording
                                            ? "bg-rose-500 text-white shadow-rose-500/40 rotate-12"
                                            : "bg-white text-[#7C3AED] hover:scale-105 shadow-primary/10 border-2 border-[#E0E7FF]"
                                    )}
                                >
                                    {isRecording ? <Mic2 size={64} className="animate-pulse" /> : <Mic2 size={64} />}
                                </button>

                                <div className={cn(
                                    "px-8 py-3 rounded-full font-black text-2xl tracking-[0.2em] font-outfit border-2 transition-all duration-500",
                                    isRecording ? "bg-white border-rose-100 text-rose-500 scale-110" : "bg-white border-[#E0E7FF] text-slate-400"
                                )}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 flex justify-center gap-4">
                    <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-[32px] border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mic Ready</span>
                        </div>
                        <div className="w-px h-4 bg-slate-100" />
                        <div className="flex items-center gap-3">
                            <Volume2 className="h-4 w-4 text-slate-400" />
                            <div className="w-32 h-1.5 bg-slate-50 rounded-full overflow-hidden border">
                                <div className="h-full w-2/3 bg-slate-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
