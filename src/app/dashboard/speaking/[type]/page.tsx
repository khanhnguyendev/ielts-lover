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
    Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getExerciseById, startExerciseAttempt, submitAttempt, saveAttemptDraft } from "@/app/actions"
import { Exercise, Attempt } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { FeedbackModal } from "@/components/dashboard/feedback-modal"
import { useNotification } from "@/lib/contexts/notification-context"

export default function SpeakingPracticePage({ params }: { params: { type: string } }) {
    const [currentQuestion, setCurrentQuestion] = React.useState(1)
    const [isRecording, setIsRecording] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(0)
    const [status, setStatus] = React.useState<"PRACTICE" | "PROCESSING" | "COMPLETE">("PRACTICE")
    const [sidebarExpanded, setSidebarExpanded] = React.useState(true)

    const [exercise, setExercise] = React.useState<Exercise | null>(null)
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
                <div className="max-w-xl w-full bg-white rounded-[40px] border p-12 space-y-12 text-center shadow-2xl shadow-primary/5">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black font-outfit text-[#7C3AED]">Processing...</h2>
                        <p className="text-muted-foreground font-bold italic">Your report will be ready in a few minutes...</p>
                    </div>

                    <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
                        {/* Orbiting Icons */}
                        <div className="absolute top-0 left-1/2 -ml-5 -mt-5 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                            <Volume2 className="h-5 w-5" />
                        </div>
                        <div className="absolute top-1/2 -right-5 -mt-5 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="absolute bottom-4 left-4 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 animate-pulse">
                            <Settings className="h-5 w-5" />
                        </div>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-bounce">
                            <BookOpen className="h-5 w-5" />
                        </div>

                        <div className="relative z-10 w-24 h-24 bg-[#EEF2FF] rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12">
                            <FileText className="h-10 w-10 text-[#7C3AED]" />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#7C3AED]">
                            <span>Analysis Progress</span>
                            <span>1%</span>
                        </div>
                        <div className="w-full bg-[#EEF2FF] h-3 rounded-full overflow-hidden">
                            <div className="bg-[#7C3AED] h-full w-[1%] transition-all duration-1000" />
                        </div>
                    </div>

                    <Button disabled className="w-full h-16 rounded-[24px] bg-[#E5E7EB] text-slate-600 font-black text-sm">
                        Processing...
                    </Button>
                </div>
            </div>
        )
    }

    if (status === "COMPLETE") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8">
                <div className="max-w-xl w-full bg-white rounded-[40px] border p-12 space-y-12 text-center shadow-2xl shadow-primary/5">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black font-outfit text-[#C026D3]">Task Completed 🎉</h2>
                        <p className="text-muted-foreground font-bold italic">Your report is ready!</p>
                    </div>

                    <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-50 rounded-full animate-pulse" />
                        <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-emerald-500">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#C026D3]">
                            <span>Analysis Progress</span>
                            <span>100%</span>
                        </div>
                        <div className="w-full bg-[#F5F3FF] h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-[#7C3AED] to-[#C026D3] h-full w-full" />
                        </div>
                    </div>

                    <Link href="/dashboard/reports/next-report">
                        <Button className="w-full h-18 rounded-[24px] bg-gradient-to-r from-[#C33AF1] to-[#6366F1] hover:opacity-90 text-white font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                            Go to My Report
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F9FAFB] flex overflow-hidden">
            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-12 border-b bg-white">
                    <Link href="/dashboard/speaking" className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F9FAFB] border hover:bg-white hover:shadow-md transition-all group">
                        <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>

                    <div className="flex items-center gap-4">
                        {questions.map((_, i) => (
                            <React.Fragment key={i}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all",
                                    i + 1 === currentQuestion
                                        ? "bg-[#7C3AED] text-white ring-4 ring-primary/10"
                                        : i + 1 < currentQuestion
                                            ? "bg-emerald-500 text-white"
                                            : "bg-[#F3F4F6] text-slate-600"
                                )}>
                                    {i + 1 < currentQuestion ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                </div>
                                {i < questions.length - 1 && (
                                    <div className="w-8 h-px bg-slate-200" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-16">
                    {/* Question Card */}
                    <div className="w-full max-w-3xl bg-white rounded-3xl border p-10 space-y-4 shadow-sm">
                        <h3 className="text-xl font-black font-outfit text-slate-900">Question {currentQuestion}/{questions.length}</h3>
                        <p className="text-lg font-bold text-slate-600 leading-relaxed">
                            {questions[currentQuestion - 1]}
                        </p>
                    </div>

                    {/* Mic Area */}
                    <div className="flex flex-col items-center space-y-8">
                        <button
                            onClick={handleMicClick}
                            className={cn(
                                "w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 relative",
                                isRecording
                                    ? "bg-rose-500 shadow-rose-500/40"
                                    : "bg-gradient-to-br from-[#60A5FA] to-[#A855F7] shadow-blue-500/30"
                            )}>
                            {isRecording && (
                                <div className="absolute inset-0 rounded-full animate-ping bg-rose-400/30" />
                            )}
                            <Mic2 className="h-10 w-10 text-white" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400">
                                    {isRecording ? "Click to stop and finish answer" : "Click the microphone to start recording"}
                                </p>
                                <p className="text-lg font-black font-outfit text-[#94A3B8]">
                                    {isRecording ? "Recording your answer..." : "Ready to record"}
                                </p>
                            </div>

                            <div className="bg-[#F1F5F9] px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-inner border border-slate-100">
                                <span className="text-lg font-black font-outfit text-slate-600">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            <div className="pt-4 flex flex-col items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        if (!currentAttempt) return;
                                        setIsSubmitting(true);
                                        try {
                                            // In a real speaking app, we'd upload audio here
                                            // But for this mock/proto, we'll just save the draft
                                            await saveAttemptDraft(currentAttempt.id, "Audio recording placeholder");
                                            notifySuccess("Draft Saved", "Your speaking practice has been saved. You can request evaluation later from the Reports tab.");
                                            router.push("/dashboard/reports");
                                        } catch (error) {
                                            console.error("Save failed:", error);
                                            notifyError("Save Failed", "We couldn't save your draft. Please try again.");
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                    disabled={isSubmitting || isRecording}
                                    className="px-10 rounded-2xl font-bold border-2"
                                >
                                    Evaluate Later
                                </Button>
                                {currentQuestion === questions.length && !isRecording && timeLeft > 0 && (
                                    <Button
                                        onClick={async () => {
                                            if (!currentAttempt) return;
                                            // Redirect or trigger similar logic to writing finish
                                            notifyWarning("Finish Session", "Ready to get feedback on your speaking?", "Evaluate Now", async () => {
                                                // Optimistic decrement animation
                                                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -1 } }))

                                                try {
                                                    // In a real app, we'd call submitAttempt here
                                                    // For now, we simulate success
                                                    setStatus("PROCESSING");
                                                    setTimeout(() => setStatus("COMPLETE"), 2000);
                                                } catch (error) {
                                                    // Refund animation on system error
                                                    window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                                                    notifyError("Evaluation Failed", "We couldn't process your speaking evaluation. Please try again.");
                                                }
                                            });
                                        }}
                                        className="bg-primary text-white px-10 rounded-2xl font-black"
                                    >
                                        Finish and Get Feedback <Sparkles className="ml-2 h-4 w-4 fill-white" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (Horsebot) */}
            <div className={cn(
                "w-[400px] border-l bg-white flex flex-col transition-all duration-500 relative",
                !sidebarExpanded && "w-0 overflow-hidden border-l-0"
            )}>
                {/* Sidebar Header */}
                <div className="h-20 flex items-center justify-between px-8 border-b">
                    <div className="flex items-center gap-3">
                        <span className="text-lg py-1 px-1 bg-white border rounded-lg whitespace-nowrap">🐴 Horsebot - Personal Tutor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                            <History className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
                            <Maximize2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setSidebarExpanded(false)}
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-primary transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Chat */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 bg-[#F9FAFB]">
                            <span className="text-xl">🐴</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-[#7C3AED]">Horsebot</p>
                            <div className="bg-[#F9FAFB] p-6 rounded-3xl rounded-tl-none border border-slate-100">
                                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                    Hey! I am your personal tutor. Need help with the task? Go ahead and ask.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Bottom */}
                <div className="p-8 border-t bg-[#F9FAFB]/50 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { text: "How do I start?", icon: Play },
                            { text: "Useful Vocabulary", icon: BookOpen },
                            { text: "Help with ideas", icon: Lightbulb },
                            { text: "Answer Guide", icon: HelpCircle },
                            { text: "Sample Answer", icon: FileText }
                        ].map((chip, i) => (
                            <button
                                key={i}
                                className="px-4 py-2.5 rounded-xl bg-white border text-[11px] font-black text-slate-600 hover:border-primary/40 hover:text-primary transition-all shadow-sm flex items-center gap-2"
                            >
                                {chip.text}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ask anything in your language"
                            className="w-full h-14 pl-6 pr-14 rounded-2xl border bg-white shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-bold placeholder:text-slate-500"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expand Sidebar Widget (if collapsed) */}
            {!sidebarExpanded && (
                <button
                    onClick={() => setSidebarExpanded(true)}
                    className="absolute right-8 bottom-8 w-14 h-14 bg-[#7C3AED] text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            )}
        </div>
    )
}

