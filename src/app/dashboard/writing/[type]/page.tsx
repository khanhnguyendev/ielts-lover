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
    BarChart3,
    PenTool
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getExerciseById, startExerciseAttempt, submitAttempt, saveAttemptDraft, getFeaturePrice, getCurrentUser } from "@/app/actions"
import { WritingExercise, WritingAttempt } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { FeedbackModal } from "@/components/dashboard/feedback-modal"
import { useNotification } from "@/lib/contexts/notification-context"
import { BackButton } from "@/components/global/back-button"
import { FEATURE_KEYS } from "@/lib/constants"
import { extractBillingError } from "@/lib/billing-errors"
import { useTitle } from "@/lib/contexts/title-context"
import { AuthGate } from "@/components/global/auth-gate"
import { EvaluatingOverlay } from "@/components/global/evaluating-overlay"
import { AIActionButton } from "@/components/global/ai-action-button"

export default function WritingExercisePage({ params }: { params: Promise<{ type: string }> }) {
    const resolvedParams = React.use(params)
    const exerciseId = resolvedParams.type

    const [exercise, setExercise] = React.useState<WritingExercise | null>(null)
    const [activeTab, setActiveTab] = React.useState<"question" | "editor">("question")
    const { setTitle } = useTitle()

    React.useEffect(() => {
        if (exercise) {
            const label = exercise.type === "writing_task1" ? "Writing Task 1" : "Writing Task 2"
            setTitle(label)
        }
        return () => setTitle(null)
    }, [exercise, setTitle])
    const [currentAttempt, setCurrentAttempt] = React.useState<WritingAttempt | null>(null)
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
            <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-white">
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
            <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-white">
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
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#F9FAFB] select-none relative">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            {/* Mobile Tab Switcher (Floating) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center p-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-2xl border border-white/20 dark:border-slate-800 shadow-2xl">
                <button
                    onClick={() => setActiveTab("question")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === "question" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Question
                </button>
                <button
                    onClick={() => setActiveTab("editor")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === "editor" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <PenTool className="h-3.5 w-3.5" />
                    Practice
                </button>
            </div>

            {/* 1. Left Side: Question Panel */}
            <div className={cn(
                "w-full lg:w-[40%] flex-col border-r border-slate-200/50 bg-white/40 backdrop-blur-3xl relative overflow-hidden z-20 lg:flex",
                activeTab === "question" ? "flex flex-1" : "hidden"
            )}>
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-30" />

                <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-10 scrollbar-hide relative">
                    <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8">
                        {/* Question Title & Prompt */}
                        <div className="space-y-4">
                            <h1 className="text-2xl lg:text-3xl font-black font-outfit text-slate-900 tracking-tight leading-[1.2] selection:bg-primary/20">
                                {exercise.title}
                            </h1>
                            <div className="h-1.5 w-20 lg:w-24 bg-gradient-to-r from-primary to-indigo-500 rounded-full" />
                        </div>

                        <div className="relative group">
                            <div className="relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[3rem] border border-white/60 dark:border-white/5 p-6 lg:p-10 space-y-8 lg:space-y-10 shadow-2xl shadow-slate-200/40 transition-all duration-1000 hover:translate-y-[-4px]">

                                {/* Task Data (Chart) - Stacked on top for Task 1 */}
                                {exercise.type === "writing_task1" && exercise.image_url && (
                                    <div className="space-y-6 lg:space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.4em] text-primary/60">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                    <BarChart3 className="h-5 w-5" />
                                                </div>
                                                Visual Data Synthesis
                                            </div>
                                            <button
                                                onClick={() => setIsLightboxOpen(true)}
                                                className="text-[10px] lg:text-[11px] font-black text-slate-400 hover:text-primary flex items-center gap-2.5 transition-all hover:tracking-[0.15em]"
                                            >
                                                <Maximize2 className="h-4 w-4" />
                                                FULL VIEW
                                            </button>
                                        </div>

                                        <div
                                            onClick={() => setIsLightboxOpen(true)}
                                            className="relative aspect-video lg:aspect-[16/9] bg-white/30 dark:bg-black/20 rounded-2xl lg:rounded-[2rem] flex items-center justify-center border border-white/60 dark:border-white/5 group/img overflow-hidden cursor-zoom-in hover:border-primary/30 transition-all shadow-inner"
                                        >
                                            <img
                                                src={exercise.image_url}
                                                alt="Task 1 Chart"
                                                className="w-full h-full object-contain p-6 lg:p-10 transition-transform duration-1000 group-hover/img:scale-[1.05]"
                                            />
                                            <div className="absolute inset-0 bg-primary/0 group-hover/img:bg-primary/[0.02] transition-colors" />
                                            <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black tracking-widest text-slate-900 border border-white">
                                                    CLICK TO MAGNIFY
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6 lg:space-y-8">
                                    <div className="flex items-center gap-4 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.4em] text-primary/60">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                            <HelpCircle className="h-5 w-5" />
                                        </div>
                                        Core Directive
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-5 lg:-left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-indigo-500 to-primary/20 rounded-full" />
                                        <p className="text-lg lg:text-xl font-medium text-slate-800 dark:text-slate-200 leading-[1.6] italic selection:bg-primary/20 px-2 lg:px-4 drop-shadow-sm">
                                            "{exercise.prompt}"
                                        </p>
                                    </div>

                                    {/* AI Outline Tool - Relocated for better accessibility */}
                                    <div className="pt-2">
                                        <AIActionButton
                                            label="Generate Structure Outline"
                                            icon={Brain}
                                            badge="LABS"
                                            disabled
                                        />
                                    </div>
                                </div>

                                {/* Task Stats Footnote */}
                                <div className="flex flex-wrap items-center gap-8 lg:gap-10 pt-8 lg:pt-10 border-t border-slate-100/50 dark:border-white/5">
                                    <div className="space-y-2 lg:space-y-3">
                                        <span className="text-[9px] lg:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] block">Word Target</span>
                                        <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
                                            <div className="p-2 lg:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <span className="text-lg lg:text-xl font-black tracking-tighter">{exercise.type === "writing_task1" ? "150+" : "250+"} Words</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-10 lg:h-12 bg-slate-100 dark:bg-white/5 hidden sm:block" />
                                    <div className="space-y-2 lg:space-y-3">
                                        <span className="text-[9px] lg:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] block">Duration</span>
                                        <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400">
                                            <div className="p-2 lg:p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <span className="text-lg lg:text-xl font-black tracking-tighter">{exercise.type === "writing_task1" ? "20min" : "40min"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Right Side: Writing Panel */}
            <div className={cn(
                "flex-1 flex flex-col bg-white dark:bg-slate-950 relative z-10 lg:flex lg:w-[60%]",
                activeTab === "editor" ? "flex flex-1" : "hidden"
            )}>
                {/* AuthGate overlay */}
                {showAuthGate && (
                    <AuthGate
                        title="Sign in to evaluate your essay"
                        description="Create a free account to submit your writing and get detailed AI band score feedback."
                        overlay
                    />
                )}

                {/* Header: Immersive Status Bar */}
                <div className="h-14 lg:h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 lg:px-12 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl z-40 sticky top-0 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-10 lg:gap-16">
                        {/* Timer */}
                        <div className="group flex flex-col items-start px-4 py-1.5 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                            <span className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1 leading-none">
                                {timerStopped ? "Session Over" : "Time Elapsed"}
                            </span>
                            <div className={cn(
                                "flex items-center gap-3 transition-all duration-300",
                                timerStopped
                                    ? "text-emerald-500"
                                    : timeLeft < 60
                                        ? "text-rose-500 scale-110 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                        : "text-slate-900 dark:text-white"
                            )}>
                                <Clock className={cn("h-4 w-4 lg:h-5 lg:w-5", !timerStopped && timeLeft < 60 ? "animate-pulse" : "")} />
                                <span className="text-lg lg:text-xl font-black font-mono tracking-[-0.05em] leading-none">
                                    {timerStopped
                                        ? formatTime((exercise?.type === "writing_task2" ? 2400 : 1200) - timeLeft)
                                        : formatTime(timeLeft)
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Word Count Progress */}
                        <div className="hidden lg:flex flex-col items-start min-w-[180px]">
                            <div className="flex items-center justify-between w-full mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Words Count</span>
                                <span className={cn(
                                    "text-sm font-black tracking-tighter",
                                    wordCount >= (exercise.type === "writing_task1" ? 150 : 250) ? "text-emerald-500" : "text-primary"
                                )}>
                                    {wordCount} / {(exercise.type === "writing_task1" ? 150 : 250)}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-[1px] border border-slate-200/20 shadow-inner">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                        wordCount >= (exercise.type === "writing_task1" ? 150 : 250) ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                    )}
                                    style={{ width: `${Math.min(100, (wordCount / (exercise.type === "writing_task1" ? 150 : 250)) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-50">
                        <BackButton href="/dashboard/writing" label="Safe Exit" className="h-9 lg:h-11 px-6 lg:px-8 text-[11px] tracking-[0.2em] font-black uppercase rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5" />
                    </div>
                </div>

                {/* Editor Container */}
                <div className="flex-1 relative group/typing flex flex-col overflow-hidden">
                    {/* Evaluating Overlay */}
                    <EvaluatingOverlay isVisible={isSubmitting} step={evalStep} />

                    {/* Editor Composition Area */}

                    {/* Immersive Guidelines */}
                    <div className="absolute inset-x-0 bottom-0 top-[100px] pointer-events-none opacity-[0.03] dark:opacity-[0.05] flex flex-col px-12 lg:px-24 pt-16 gap-12 overflow-hidden">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="w-full h-[1px] bg-slate-500 border-b border-dashed border-slate-400" />
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col z-10 p-6 lg:p-14 overflow-y-auto scrollbar-hide focus-within:bg-slate-50/10 transition-colors">
                        <div className="max-w-[850px] mx-auto w-full flex-1 flex flex-col">
                            <textarea
                                value={text}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                                placeholder="Begin your academic response here..."
                                disabled={isSubmitting}
                                className={cn(
                                    "flex-1 w-full border-none focus:ring-0 text-lg lg:text-xl lg:leading-[1.9] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none bg-transparent selection:bg-primary/20 transition-all duration-300 min-h-[400px] text-slate-900 dark:text-slate-100",
                                    isSubmitting && "opacity-60 cursor-not-allowed"
                                )}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 lg:p-10 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl z-40 gap-6">
                        <div className="hidden sm:flex items-center gap-6 group/autosave">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400/20 blur-xl animate-pulse" />
                                <div className="relative w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                                    <Save className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 block leading-none">Security</span>
                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block leading-none">Cloud Encryption</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
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
                                        notifySuccess("Backup Synchronized", "Session saved to cloud.");
                                        router.push("/dashboard/reports");
                                    } catch (error) {
                                        notifyError("Sync Interrupted", "Check internet connectivity.");
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                disabled={isSubmitting || !text.trim()}
                                className="h-11 lg:h-13 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex-1 sm:flex-none border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                            >
                                Save Draft
                            </Button>

                            {currentUserCredits < evalCost ? (
                                <Button
                                    onClick={() => {
                                        if (text.trim()) localStorage.setItem(DRAFT_KEY, text)
                                        router.push("/dashboard/credits")
                                    }}
                                    className="h-11 lg:h-13 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-2xl shadow-amber-500/30 transition-all flex-1 sm:flex-none active:scale-95"
                                >
                                    Get Credits to Finish
                                </Button>
                            ) : (
                                <AIActionButton
                                    label="Analyze Submission"
                                    icon={Sparkles}
                                    showChevron
                                    onClick={handleFinish}
                                    isLoading={isSubmitting}
                                    disabled={!text.trim()}
                                />
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
