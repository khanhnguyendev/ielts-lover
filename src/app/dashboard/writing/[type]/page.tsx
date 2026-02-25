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
    Layout,
    X,
    Loader2,
    FileCheck,
    Brain,
    BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getExerciseById, startExerciseAttempt, submitAttempt, saveAttemptDraft, getFeaturePrice, getCurrentUser } from "@/app/actions"
import { Exercise, Attempt } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { FeedbackModal } from "@/components/dashboard/feedback-modal"
import { useNotification } from "@/lib/contexts/notification-context"
import { BackButton } from "@/components/global/back-button"
import { FEATURE_KEYS } from "@/lib/constants"
import { extractBillingError } from "@/lib/billing-errors"
import { useTitle } from "@/lib/contexts/title-context"
import { AuthGate } from "@/components/global/auth-gate"

export default function WritingExercisePage({ params }: { params: Promise<{ type: string }> }) {
    const resolvedParams = React.use(params)
    const exerciseId = resolvedParams.type

    const [exercise, setExercise] = React.useState<Exercise | null>(null)
    const { setTitle } = useTitle()

    React.useEffect(() => {
        if (exercise) {
            const label = exercise.type === "writing_task1" ? "Writing Task 1" : "Writing Task 2"
            setTitle(label)
        }
        return () => setTitle(null)
    }, [exercise, setTitle])
    const [currentAttempt, setCurrentAttempt] = React.useState<Attempt | null>(null)
    const [isGuest, setIsGuest] = React.useState(false)
    const [showAuthGate, setShowAuthGate] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [text, setText] = React.useState("")
    const [timeLeft, setTimeLeft] = React.useState(1200) // 20 mins for Task 1 default
    const [timerStopped, setTimerStopped] = React.useState(false)
    const [evalStep, setEvalStep] = React.useState(0) // 0=not started, 1=submitting, 2=analyzing, 3=scoring
    const [evalCost, setEvalCost] = React.useState<number>(1) // Default 1
    const [targetScore, setTargetScore] = React.useState<number>(9.0);

    const [showFeedback, setShowFeedback] = React.useState(false)
    const [feedbackData, setFeedbackData] = React.useState<{ score?: number, feedback?: string, attemptId?: string }>({})
    const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)
    const { notifySuccess, notifyWarning, notifyError } = useNotification()
    const router = useRouter()

    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length

    React.useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            try {
                // 1. Fetch Exercise (no auth required — public read)
                const data = await getExerciseById(exerciseId)
                if (!data) {
                    setExercise(null)
                    return
                }
                setExercise(data)

                // 2. Check auth — guests can browse + write, but not submit
                const userProfile = await getCurrentUser();
                if (!userProfile) {
                    setIsGuest(true)
                    // Guests see the exercise but skip attempt creation
                    return
                }

                setTargetScore(userProfile.target_score || 9.0);

                // 3. Fetch Pricing
                const featureKey = data.type.startsWith("writing")
                    ? FEATURE_KEYS.WRITING_EVALUATION
                    : FEATURE_KEYS.SPEAKING_EVALUATION;
                const price = await getFeaturePrice(featureKey);
                setEvalCost(price);

                // 4. Start or Resume Attempt
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

    // Timer logic — stops when submission begins
    React.useEffect(() => {
        if (isLoading || !exercise || timerStopped) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [isLoading, exercise, timerStopped])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleFinish = async () => {
        if (!text.trim()) return;

        // Guests must sign in before submitting
        if (isGuest || !currentAttempt) {
            setShowAuthGate(true)
            return
        }

        notifyWarning(
            "Confirm Evaluation",
            `This will use ${evalCost} StarCredit${evalCost > 1 ? 's' : ''} to evaluate your work and provide detailed AI feedback. Do you want to proceed?`,
            "Evaluate Now",
            async () => {
                setIsSubmitting(true)
                setTimerStopped(true)
                setEvalStep(1)
                // Optimistic decrement animation
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -evalCost } }))

                // Progress steps on timers to give visual feedback during AI wait
                const stepTimer1 = setTimeout(() => setEvalStep(2), 1500)
                const stepTimer2 = setTimeout(() => setEvalStep(3), 4000)

                try {
                    const result = await submitAttempt(currentAttempt.id, text)
                    clearTimeout(stepTimer1)
                    clearTimeout(stepTimer2)

                    const billing = result ? extractBillingError(result as any) : null;
                    if (billing) {
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: evalCost } }))
                        notifyWarning(billing.title, `Your work has been saved securely. ${billing.message}`, "OK")
                        return;
                    }

                    if (result && 'error' in result && result.error === "INTERNAL_ERROR") {
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: evalCost } }))
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
                            attemptId: result.id,
                            originalText: result.content,
                            isUnlocked: result.is_correction_unlocked,
                            initialCorrection: result.correction_data ? JSON.parse(result.correction_data) : null
                        } as any)
                        setShowFeedback(true)
                    } else {
                        // Refund if we didn't get a score (logic failure)
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: evalCost } }))
                        notifyError(
                            "Evaluation Problem",
                            "Your work was saved, but we couldn't complete the AI evaluation. Your StarCredit has been refunded. Please try again from the Reports tab.",
                            "Close"
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
                    setEvalStep(0)
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
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white select-none">
            {/* 1. Left Side: Question Panel */}
            <div className="w-[45%] lg:w-[52%] flex flex-col border-r bg-slate-50/50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-20" />

                <div className="flex-1 overflow-y-auto px-6 py-10 lg:px-10 scrollbar-none">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Question Title & Prompt */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight leading-tight">
                                    {exercise.title}
                                </h1>
                                <div className="h-1.5 w-16 bg-primary rounded-full" />
                            </div>

                            <div className="relative group">
                                {/* Glass card effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-[2.5rem] blur opacity-25" />

                                <div className="relative bg-white rounded-[2.5rem] border border-slate-200 p-8 lg:p-10 space-y-10 shadow-sm transition-all duration-300">

                                    {/* Task Data (Chart) - Stacked on top for Task 1 */}
                                    {exercise.type === "writing_task1" && exercise.image_url && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary/60">
                                                    <Layout className="h-4 w-4" />
                                                    Chart Visualization
                                                </div>
                                                <button
                                                    onClick={() => setIsLightboxOpen(true)}
                                                    className="text-[11px] font-bold text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Maximize2 className="h-3 w-3" />
                                                    Full Screen
                                                </button>
                                            </div>

                                            <div
                                                onClick={() => setIsLightboxOpen(true)}
                                                className="relative aspect-video bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-slate-100 group/img overflow-hidden cursor-zoom-in hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5"
                                            >
                                                <img
                                                    src={exercise.image_url}
                                                    alt="Task 1 Chart"
                                                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover/img:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-primary/0 group-hover/img:bg-primary/[0.02] transition-colors" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary/60">
                                            <HelpCircle className="h-4 w-4" />
                                            Question Prompt
                                        </div>
                                        <p className="text-lg font-medium text-slate-700 leading-relaxed italic selection:bg-primary/10">
                                            "{exercise.prompt}"
                                        </p>
                                    </div>

                                    {/* Task Stats Footnote */}
                                    <div className="flex flex-wrap items-center gap-8 pt-10 border-t border-dashed border-slate-200">
                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Min Target</span>
                                            <div className="flex items-center gap-2.5 text-emerald-600">
                                                <div className="p-1 rounded-md bg-emerald-50">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-black tracking-tight">{exercise.type === "writing_task1" ? "150 Words" : "250 Words"}</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Recommended Time</span>
                                            <div className="flex items-center gap-2.5 text-blue-600">
                                                <div className="p-1 rounded-md bg-blue-50">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-black tracking-tight">{exercise.type === "writing_task1" ? "20 Minutes" : "40 Minutes"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lightbox Overlay */}
                {isLightboxOpen && exercise.image_url && (
                    <div
                        className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 flex items-center justify-center p-8 lg:p-20"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/40 hover:text-white transition-all hover:rotate-90"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X className="h-10 w-10" />
                        </button>
                        <img
                            src={exercise.image_url}
                            alt="Full Screen Chart"
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in duration-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </div>

            {/* 2. Right Side: Writing Panel */}
            <div className="flex-1 flex flex-col bg-white relative">
                {/* AuthGate overlay — shown on demand when guest tries to submit */}
                {showAuthGate && (
                    <AuthGate
                        title="Sign in to evaluate your essay"
                        description="Create a free account to submit your writing and get detailed AI band score feedback."
                        overlay
                    />
                )}
                {/* Header: Immersive Status Bar */}
                <div className="h-20 border-b flex items-center justify-between px-8 lg:px-12 bg-white/80 backdrop-blur-md z-40 sticky top-0">
                    <div className="flex items-center gap-10">
                        {/* Timer */}
                        <div className="group flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-primary transition-colors">
                                {timerStopped ? "Time Used" : "Time Remaining"}
                            </span>
                            <div className={cn(
                                "flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 transition-all duration-300",
                                timerStopped
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    : timeLeft < 60
                                        ? "bg-rose-50 border-rose-200 text-rose-500 animate-pulse scale-105 shadow-lg shadow-rose-200/50"
                                        : "bg-slate-50 border-slate-100 text-slate-900 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary"
                            )}>
                                {timerStopped
                                    ? <CheckCircle2 className="h-4 w-4" />
                                    : <Clock className={cn("h-4 w-4", timeLeft < 60 ? "animate-spin-slow" : "")} />
                                }
                                <span className="text-base font-black font-mono tracking-tighter">
                                    {timerStopped
                                        ? formatTime((exercise?.type === "writing_task2" ? 2400 : 1200) - timeLeft)
                                        : formatTime(timeLeft)
                                    }
                                </span>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-slate-100" />

                        {/* Word Count Progress */}
                        <div className="group flex flex-col items-start min-w-[140px]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-primary transition-colors">Word Progress</span>
                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "text-sm font-black transition-colors",
                                        wordCount >= (exercise.type === "writing_task1" ? 150 : 250) ? "text-emerald-500" : "text-slate-900"
                                    )}>
                                        {wordCount} Words
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-400">/{exercise.type === "writing_task1" ? 150 : 250}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-[1px]">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            wordCount >= (exercise.type === "writing_task1" ? 150 : 250) ? "bg-emerald-500" : "bg-primary"
                                        )}
                                        style={{ width: `${Math.min(100, (wordCount / (exercise.type === "writing_task1" ? 150 : 250)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-50">
                        <BackButton href="/dashboard/writing" label="Back to Hub" />
                    </div>
                </div>

                {/* Main Typing Area */}
                <div className="flex-1 relative group/typing flex flex-col">
                    {/* Evaluating Overlay */}
                    {isSubmitting && (
                        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                            <div className="flex flex-col items-center gap-8 max-w-sm text-center">
                                {/* Animated icon */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center">
                                        <Brain className="w-12 h-12 text-primary animate-pulse" />
                                    </div>
                                    <div className="absolute -inset-2 rounded-[2.5rem] border-2 border-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black font-outfit text-slate-900">AI Evaluating...</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Analyzing your writing across all IELTS criteria
                                    </p>
                                </div>

                                {/* Progress steps */}
                                <div className="w-full space-y-3">
                                    {[
                                        { icon: FileCheck, label: "Submitting your essay", step: 1 },
                                        { icon: Brain, label: "Analyzing content & structure", step: 2 },
                                        { icon: BarChart3, label: "Scoring band descriptors", step: 3 },
                                    ].map(({ icon: StepIcon, label, step }) => (
                                        <div
                                            key={step}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500",
                                                evalStep >= step
                                                    ? "bg-primary/5 text-slate-900"
                                                    : "text-slate-300"
                                            )}
                                        >
                                            {evalStep > step ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                            ) : evalStep === step ? (
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
                    )}

                    {/* Background indicators or guidelines */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex flex-col px-12 pt-16 gap-8">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-full h-px bg-slate-900 border-b border-dashed border-slate-900" />
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col z-10 px-8 py-10 lg:px-12 lg:py-12">
                        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
                            <Textarea
                                value={text}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                                placeholder="Once there was a horse..."
                                disabled={isSubmitting}
                                className={cn(
                                    "flex-1 w-full border-none focus-visible:ring-0 text-lg leading-[1.8] font-medium placeholder:text-slate-300 resize-none scrollbar-none bg-transparent selection:bg-primary/10 transition-all duration-300",
                                    isSubmitting && "opacity-60 cursor-not-allowed"
                                )}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 lg:px-12 border-t flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
                        <div className="flex items-center gap-4 group/autosave">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 group-hover/autosave:bg-emerald-100 transition-colors">
                                <Save className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">Status</span>
                                <span className="text-[11px] font-bold text-emerald-600 block">Cloud Sync Active</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={async () => {
                                    if (isGuest || !currentAttempt) {
                                        setShowAuthGate(true)
                                        return
                                    }
                                    if (!text.trim()) return;
                                    setIsSubmitting(true);
                                    try {
                                        await saveAttemptDraft(currentAttempt.id, text);
                                        notifySuccess("Draft Saved", "Your work has been saved successfully.");
                                        router.push("/dashboard/reports");
                                    } catch (error) {
                                        console.error("Save failed:", error);
                                        notifyError("Save Failed", "We couldn't save your draft.");
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting || !text.trim()}
                                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Save as Draft
                            </Button>

                            <Button
                                onClick={handleFinish}
                                disabled={isSubmitting || !text.trim()}
                                className="group relative h-14 pl-10 pr-8 rounded-[2rem] bg-slate-900 hover:bg-primary text-white font-black text-sm shadow-2xl shadow-slate-200 transition-all duration-500 hover:translate-y-[-2px] hover:shadow-primary/30"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {isSubmitting ? "Processing..." : "Finish Analysis"}
                                    {!isSubmitting && <Sparkles className="h-5 w-5 fill-white group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
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
                originalText={(feedbackData as any).originalText}
                isUnlocked={(feedbackData as any).isUnlocked}
                initialCorrection={(feedbackData as any).initialCorrection}
                targetScore={targetScore}
            />
        </div>
    )
}
