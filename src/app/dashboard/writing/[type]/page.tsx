"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { getExerciseById, startExerciseAttempt, submitAttempt, saveAttemptDraft } from "@/app/actions"
import { Exercise, Attempt } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { FeedbackModal } from "@/components/dashboard/feedback-modal"
import { useNotification } from "@/lib/contexts/notification-context"

export default function WritingExercisePage({ params }: { params: Promise<{ type: string }> }) {
    const resolvedParams = React.use(params)
    const exerciseId = resolvedParams.type

    const [exercise, setExercise] = React.useState<Exercise | null>(null)
    const [currentAttempt, setCurrentAttempt] = React.useState<Attempt | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [text, setText] = React.useState("")
    const [timeLeft, setTimeLeft] = React.useState(1200) // 20 mins for Task 1 default

    const [showFeedback, setShowFeedback] = React.useState(false)
    const [feedbackData, setFeedbackData] = React.useState<{ score?: number, feedback?: string, attemptId?: string }>({})
    const { notifySuccess, notifyWarning, notifyError } = useNotification()
    const router = useRouter()

    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length

    React.useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            try {
                // 1. Fetch Exercise
                const data = await getExerciseById(exerciseId)
                if (!data) {
                    setExercise(null)
                    return
                }
                setExercise(data)

                // 2. Start or Resume Attempt
                try {
                    const attempt = await startExerciseAttempt(exerciseId)
                    setCurrentAttempt(attempt)

                    // Resume content if any
                    if (attempt.content) {
                        setText(attempt.content)
                    }

                    // Adjust timer based on type if needed
                    if (data.type === "writing_task2") setTimeLeft(2400)

                } catch (err) {
                    console.error("Failed to start attempt:", err)
                    notifyError(
                        "Initialization Failed",
                        "We couldn't start your practice session. Please try refreshing the page.",
                        "Close"
                    )
                }

            } catch (error) {
                console.error("Failed to fetch exercise:", error)
            } finally {
                setIsLoading(false)
            }
        }
        init()
    }, [exerciseId])

    // Timer logic
    React.useEffect(() => {
        if (isLoading || !exercise) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [isLoading, exercise])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleFinish = async () => {
        if (!currentAttempt || !text.trim()) return;

        notifyWarning(
            "Confirm Evaluation",
            "This will use 1 StarCredit to evaluate your work and provide detailed AI feedback. Do you want to proceed?",
            "Evaluate Now",
            async () => {
                setIsSubmitting(true)
                try {
                    const result = await submitAttempt(currentAttempt.id, text)

                    if (result && 'error' in result && result.error === "INTERNAL_ERROR") {
                        notifyError(
                            "System Error",
                            "We encountered a problem while evaluating your work. Please provide the trace ID to support.",
                            "Close",
                            (result as any).traceId
                        )
                        return;
                    }

                    if (result && 'score' in result && result.score !== undefined && result.score !== null) {
                        setFeedbackData({
                            score: result.score as number,
                            feedback: result.feedback as string,
                            attemptId: result.id
                        })
                        setShowFeedback(true)
                    } else if (result && 'reason' in result && result.reason === "INSUFFICIENT_CREDITS") {
                        notifyWarning(
                            "Insufficient Credits",
                            "Your work has been saved securely, but you don't have enough StarCredits for evaluation. Please top up your balance.",
                            "Top Up"
                        )
                    } else {
                        notifyWarning(
                            "Daily Limit Reached",
                            "Your work has been saved securely, but your daily AI evaluation limit has been reached. You can request feedback for this attempt from the Reports tab once your limit resets.",
                            "View Reports"
                        )
                    }
                } catch (error) {
                    console.error("Submission failed:", error)

                    // Check if error is from server action with traceId
                    const errorObj = error as any;
                    const traceId = errorObj?.traceId || (typeof error === 'object' && error !== null && 'traceId' in error ? (error as any).traceId : undefined);

                    notifyError(
                        "Submission Failed",
                        "We were unable to save your work. Please check your internet connection and try again.",
                        "Try Again",
                        traceId
                    )
                } finally {
                    setIsSubmitting(false)
                }
            },
            "Cancel"
        )
    }

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <PulseLoader size="lg" color="primary" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading Exercise...
                    </p>
                </div>
            </div>
        )
    }

    if (!exercise) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <p className="text-lg font-bold text-slate-700">Exercise not found</p>
                    <Link href="/dashboard/writing">
                        <Button variant="outline">Back to Writing Hub</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-white">
            {/* Question Side */}
            <div className="w-1/2 overflow-y-auto p-12 border-r bg-[#F9FAFB] scrollbar-hide">
                <div className="max-w-xl mx-auto space-y-10 pb-20">
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                        <Link href="/dashboard/writing" className="hover:text-primary flex items-center gap-1 transition-colors">
                            Writing Tasks
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-slate-900">
                            {exercise.type === "writing_task1" ? "Academic Task 1" : "Task 2"}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black font-outfit">{exercise.title}</h2>
                        <div className="bg-white rounded-[40px] border p-10 space-y-8 shadow-sm">
                            <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {exercise.prompt}
                            </p>

                            {exercise.type === "writing_task1" && exercise.image_url && (
                                <div className="space-y-4">
                                    <div className="relative aspect-auto min-h-[300px] bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-muted-foreground/10 group overflow-hidden">
                                        <img
                                            src={exercise.image_url}
                                            alt="Task 1 Chart"
                                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                                                <Maximize2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
                                        Chart Visualization
                                    </p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-dashed space-y-4">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Minimum Requirements:</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                                        <span className="text-[10px] font-bold text-purple-700">
                                            {exercise.type === "writing_task1" ? "150+ Words" : "250+ Words"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                                        <span className="text-[10px] font-bold text-blue-700">
                                            {exercise.type === "writing_task1" ? "20 Minutes" : "40 Minutes"}
                                        </span>
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
                                <span className={cn("text-xl font-black font-mono", timeLeft < 60 && "text-rose-500 animate-pulse")}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div className="h-4 w-px bg-muted" />
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">Word Count:</span>
                                <span className={cn(
                                    "text-xs font-black",
                                    wordCount >= (exercise.type === "writing_task1" ? 150 : 250) ? "text-green-600" : "text-primary"
                                )}>
                                    {wordCount} / {exercise.type === "writing_task1" ? 150 : 250}
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
                            className="flex-1 w-full border-none focus-visible:ring-0 text-lg leading-relaxed font-medium placeholder:text-muted-foreground/60 resize-none scrollbar-hide bg-transparent"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-2 rounded-xl">
                                <Save className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Auto-saved 2s ago</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    if (!currentAttempt) return;
                                    setIsSubmitting(true);
                                    try {
                                        await saveAttemptDraft(currentAttempt.id, text);
                                        notifySuccess("Draft Saved", "Your work has been saved. You can request evaluation later from the Reports tab.");
                                        router.push("/dashboard/reports");
                                    } catch (error) {
                                        console.error("Submission failed:", error);
                                        // Refund animation on system error
                                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                                        notifyError("Save Failed", "We couldn't save your draft. Please try again.");
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting || !text.trim()}
                                className="h-14 px-8 rounded-2xl font-bold border-2"
                            >
                                Evaluate Later
                            </Button>
                            <Button
                                onClick={handleFinish}
                                disabled={isSubmitting || !text.trim()}
                                className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                {isSubmitting ? "Evaluating..." : "Finish and Get Feedback"}
                                {!isSubmitting && <Sparkles className="ml-2 h-5 w-5 fill-white" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <FeedbackModal
                open={showFeedback}
                onOpenChange={setShowFeedback}
                score={feedbackData.score}
                feedback={feedbackData.feedback}
                attemptId={feedbackData.attemptId}
                type={exercise.type as any}
            />
        </div>
    )
}
