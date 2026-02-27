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
import { EvaluatingOverlay } from "@/components/global/evaluating-overlay"

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
    const [currentUserCredits, setCurrentUserCredits] = React.useState<number>(0)
    const { notifySuccess, notifyWarning, notifyError } = useNotification()
    const router = useRouter()

    const DRAFT_KEY = `ielts_guest_draft_${exerciseId}`
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
                setCurrentUserCredits(userProfile.credits_balance || 0);

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

                    // Restore content: prefer server-saved content, then guest draft from localStorage
                    if (attempt.content) {
                        setText(attempt.content)
                    } else {
                        const guestDraft = localStorage.getItem(DRAFT_KEY)
                        if (guestDraft) {
                            setText(guestDraft)
                            localStorage.removeItem(DRAFT_KEY)
                        }
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

        // Guests must sign in before submitting — save their draft first
        if (isGuest || !currentAttempt) {
            if (text.trim()) localStorage.setItem(DRAFT_KEY, text)
            setShowAuthGate(true)
            return
        }

        // Pre-check credits: stop immediately if not enough
        if (currentUserCredits < evalCost) {
            notifyWarning(
                "Insufficient Credits",
                `This evaluation requires ${evalCost} StarCredit${evalCost > 1 ? 's' : ''}, but you only have ${currentUserCredits}. Please get more credits to evaluate this work.`,
                "Buy Credits",
                () => router.push("/dashboard/credits"),
                "Close"
            )
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
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F9FAFB] select-none relative">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            {/* 1. Left Side: Question Panel */}
            <div className="w-[45%] lg:w-[52%] flex flex-col border-r border-slate-200/50 bg-white/40 backdrop-blur-3xl relative overflow-hidden z-10">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-20" />

                <div className="flex-1 overflow-y-auto px-6 py-10 lg:px-12 scrollbar-hide relative">
                    <div className="max-w-2xl mx-auto space-y-10">
                        {/* Question Title & Prompt */}
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight leading-tight">
                                    {exercise.title}
                                </h1>
                                <div className="h-2 w-20 bg-primary rounded-full" />
                            </div>

                            <div className="relative group">
                                {/* Glass card effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-[3rem] blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-1000" />

                                <div className="relative bg-white/70 backdrop-blur-2xl rounded-[3rem] border border-white/50 p-10 lg:p-12 space-y-12 shadow-2xl shadow-slate-200/20 transition-all duration-700">

                                    {/* Task Data (Chart) - Stacked on top for Task 1 */}
                                    {exercise.type === "writing_task1" && exercise.image_url && (
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                                                        <Layout className="h-4 w-4" />
                                                    </div>
                                                    Visual Data Set
                                                </div>
                                                <button
                                                    onClick={() => setIsLightboxOpen(true)}
                                                    className="text-[11px] font-black text-slate-400 hover:text-primary flex items-center gap-2 transition-all hover:translate-x-1"
                                                >
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                    EXPAND VIEW
                                                </button>
                                            </div>

                                            <div
                                                onClick={() => setIsLightboxOpen(true)}
                                                className="relative aspect-video bg-white/5 rounded-3xl flex items-center justify-center border border-slate-200/50 group/img overflow-hidden cursor-zoom-in hover:border-primary/20 transition-all hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
                                            >
                                                <img
                                                    src={exercise.image_url}
                                                    alt="Task 1 Chart"
                                                    className="w-full h-full object-contain p-6 transition-transform duration-1000 group-hover/img:scale-[1.03]"
                                                />
                                                <div className="absolute inset-0 bg-primary/0 group-hover/img:bg-primary/[0.01] transition-colors" />
                                                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 text-[9px] font-black text-slate-400 shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    CLICK TO ENLARGE
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">
                                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                                                <HelpCircle className="h-4 w-4" />
                                            </div>
                                            Academic Directive
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/40 to-indigo-500/40 rounded-full" />
                                            <p className="text-xl font-medium text-slate-700 leading-relaxed italic selection:bg-primary/20 px-2 min-h-[100px]">
                                                "{exercise.prompt}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Task Stats Footnote */}
                                    <div className="flex flex-wrap items-center gap-10 pt-10 border-t border-slate-100">
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Submission Target</span>
                                            <div className="flex items-center gap-3 text-emerald-600">
                                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <span className="text-base font-black tracking-tight">{exercise.type === "writing_task1" ? "150 Words" : "250 Words"}</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-12 bg-slate-100 hidden sm:block" />
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Temporal Guidance</span>
                                            <div className="flex items-center gap-3 text-indigo-600">
                                                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <span className="text-base font-black tracking-tight">{exercise.type === "writing_task1" ? "20 Minutes" : "40 Minutes"}</span>
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
                        className="fixed inset-0 z-[100] bg-slate-900/98 backdrop-blur-xl animate-in fade-in duration-500 flex items-center justify-center p-8 lg:p-24"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-10 right-10 text-white/30 hover:text-white transition-all hover:rotate-90 p-4"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X className="h-12 w-12" />
                        </button>
                        <div className="relative group/zoom">
                            <img
                                src={exercise.image_url}
                                alt="Full Screen Chart"
                                className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
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
                    <EvaluatingOverlay isVisible={isSubmitting} step={evalStep} />

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
                                        if (text.trim()) localStorage.setItem(DRAFT_KEY, text)
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

                            {currentUserCredits < evalCost ? (
                                <Button
                                    onClick={() => {
                                        if (text.trim()) localStorage.setItem(DRAFT_KEY, text)
                                        router.push("/dashboard/credits")
                                    }}
                                    className="group relative h-14 pl-8 pr-6 rounded-[2rem] bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-xl shadow-amber-500/20 transition-all duration-500 hover:translate-y-[-2px]"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        Get Credits to Finish
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                                            <span className="text-xs">⭐</span>
                                        </div>
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFinish}
                                    disabled={isSubmitting || !text.trim()}
                                    className="group relative h-14 pl-8 pr-6 rounded-[2rem] bg-slate-900 hover:bg-primary text-white font-black text-sm shadow-2xl shadow-slate-200 transition-all duration-500 hover:translate-y-[-2px] hover:shadow-primary/30"
                                >
                                    <span className="relative z-10 flex items-center gap-4">
                                        {isSubmitting ? "Processing..." : "Finish Analysis"}
                                        {!isSubmitting && (
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/5">
                                                <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Cost</span>
                                                <span className="text-xs font-mono font-black">{evalCost}</span>
                                                <span className="text-xs">⭐</span>
                                            </div>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                                </Button>
                            )}
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
