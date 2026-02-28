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
    X,
    FileText,
    Clock,
    Layout,
    HelpCircle,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIActionButton } from "@/components/global/ai-action-button"
import { Progress } from "@/components/ui/progress"
import { BackButton } from "@/components/global/back-button"
import { cn, formatDate } from "@/lib/utils"

import { WritingEvaluation } from "@/components/reports/writing-evaluation"
import { SpeakingEvaluation } from "@/components/reports/speaking-evaluation"
import { RewriterEvaluation } from "@/components/reports/rewriter-evaluation"
import { WritingFeedback } from "@/components/dashboard/writing-feedback"
import { ScoreOverview } from "@/components/reports/score-overview"
import { SAMPLE_REPORTS, WritingSampleData } from "@/lib/sample-data"
import { getAttemptWithExercise, getCurrentUser, reevaluateAttempt } from "@/app/actions"
import { Attempt, Exercise } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useTitle } from "@/lib/contexts/title-context"
import { useNotification } from "@/lib/contexts/notification-context"
import { extractBillingError } from "@/lib/billing-errors"
import { EvaluatingOverlay } from "@/components/global/evaluating-overlay"
import { ATTEMPT_STATES, USER_ROLES } from "@/lib/constants"
import { NOTIFY_MSGS } from "@/lib/constants/messages"

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [realData, setRealData] = React.useState<(Attempt & { exercise: Exercise | null }) | null>(null)
    const { setTitle } = useTitle()
    const { notifySuccess, notifyError, notifyWarning } = useNotification()
    const [isEvaluating, setIsEvaluating] = React.useState(false)
    const [pendingEvaluate, setPendingEvaluate] = React.useState(false)
    const [evalStep, setEvalStep] = React.useState(1)

    // Run the actual async evaluation when user confirms
    React.useEffect(() => {
        if (!pendingEvaluate || !realData) return
        setPendingEvaluate(false)
        setIsEvaluating(true);
        setEvalStep(1);

        const interval = setInterval(() => {
            setEvalStep(prev => prev < 3 ? prev + 1 : prev)
        }, 3000);

        (async () => {
            try {
                const result = await reevaluateAttempt(realData.id)
                if (result.success) {
                    const updatedData = await getAttemptWithExercise(realData.id)
                    setRealData(updatedData as any)
                    window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -10 } }))
                    notifySuccess(NOTIFY_MSGS.SUCCESS.ANALYSIS_COMPLETE.title, NOTIFY_MSGS.SUCCESS.ANALYSIS_COMPLETE.description, "View")
                } else if ('reason' in result && result.reason === "INSUFFICIENT_CREDITS") {
                    notifyError(NOTIFY_MSGS.ERROR.INSUFFICIENT_CREDITS.title, extractBillingError(new Error("INSUFFICIENT_CREDITS"))?.message || NOTIFY_MSGS.ERROR.INSUFFICIENT_CREDITS.description, "Close")
                } else {
                    const debugInfo = ('traceId' in result && result.traceId) ? `\n\nTrace ID: ${result.traceId}` : ""
                    notifyError(NOTIFY_MSGS.ERROR.EVALUATION_FAILED.title, ('message' in result && result.message ? result.message : NOTIFY_MSGS.ERROR.EVALUATION_FAILED.description) + debugInfo, "Close")
                }
            } catch (error: any) {
                console.error(error)
                const traceId = error.traceId ? `\n\nTrace ID: ${error.traceId}` : ""
                notifyError(NOTIFY_MSGS.ERROR.EVALUATION_FAILED.title, `${NOTIFY_MSGS.ERROR.EVALUATION_FAILED.description}${traceId}`, "Close")
            } finally {
                setIsEvaluating(false)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingEvaluate])

    const handleEvaluate = () => {
        notifyWarning(
            NOTIFY_MSGS.WARNING.CONFIRM_EVALUATION.title,
            NOTIFY_MSGS.WARNING.CONFIRM_EVALUATION.description,
            NOTIFY_MSGS.WARNING.CONFIRM_EVALUATION.action,
            () => setPendingEvaluate(true)
        )
    }

    React.useEffect(() => {
        if (realData?.exercise) {
            const typeLabel = realData.exercise.type.startsWith("writing") ? "Writing Report" : "Speaking Report"
            setTitle(typeLabel)
        }
    }, [realData, setTitle])
    const { id } = React.use(params)
    const [isCatbotOpen, setIsCatbotOpen] = React.useState(true)
    const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const [messages, setMessages] = React.useState<{ role: "user" | "assistant", content: string }[]>([
        { role: "assistant", content: "Hey! I'm your personal IELTS tutor. Got questions about your report? Go ahead and ask." }
    ])
    const [chatInput, setChatInput] = React.useState("")
    const [isTyping, setIsTyping] = React.useState(false)
    const chatContainerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSendMessage = (content: string) => {
        if (!content.trim()) return

        const userMessage = { role: USER_ROLES.USER as any, content }
        setMessages(prev => [...prev, userMessage])
        setChatInput("")
        setIsTyping(true)

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", content: "This feature is under development. I will be able to provide you with detailed support on this task soon!" }])
            setIsTyping(false)
        }, 1000)
    }

    // Check if it's a sample report
    const sampleData = SAMPLE_REPORTS[parseInt(id)]
    const isSample = !!sampleData

    const [targetScore, setTargetScore] = React.useState<number>(9.0);

    React.useEffect(() => {
        if (!isSample) {
            async function fetchData() {
                try {
                    const [data, user] = await Promise.all([
                        getAttemptWithExercise(id),
                        getCurrentUser()
                    ]);
                    setRealData(data as any)
                    if (user) {
                        setTargetScore(user.target_score || 9.0);
                    }
                } catch (error) {
                    console.error("Failed to fetch report:", error)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchData()
        } else {
            setIsLoading(false)
        }
    }, [id, isSample])

    const displayData = isSample ? {
        ...sampleData,
        overall_score: sampleData.overall_score,
        task_type: (sampleData as any).task_type || (sampleData as any).taskType?.split(' ')[0],
        general_comment: (sampleData as any).general_comment,
        // Map sample taskType to internal type for WritingFeedback
        writingType: sampleData.type === "Writing" ? (sampleData as any).taskType?.toLowerCase().replace("task ", "task") : undefined
    } : (realData?.feedback ? {
        ...JSON.parse(realData.feedback),
        id: realData.id,
        originalText: realData.content,
        prompt: realData.exercise?.prompt,
        imageUrl: realData.exercise?.image_url,
        type: realData.exercise?.type.startsWith('writing') ? "Writing" :
            realData.exercise?.type.startsWith('speaking') ? "Speaking" : "Rewriter"
    } : null)

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <PulseLoader size="lg" color="primary" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading Report...
                    </p>
                </div>
            </div>
        )
    }

    if (!isSample && !realData) {
        return <div className="flex h-screen items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold">Report not found</h1>
            <Link href="/dashboard/reports"><Button>Back to Reports</Button></Link>
        </div>
    }

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#F9FAFB] select-none relative">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* 1. Main Content: Analysis Result */}
            <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
                <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-12 pb-32">

                    {/* Header: Context & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">
                                    {isSample ? "Performance Analysis" : "Session Feedback"}
                                </h1>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                                    {isSample ? (
                                        <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Reference Sample No. {id}</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Completed {formatDate(realData!.created_at)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <BackButton href={isSample ? "/dashboard/samples" : "/dashboard/reports"} label="Back to List" />
                            <div className="hidden lg:flex flex-col items-end mr-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Identity Tag</span>
                                <span className="text-[10px] font-mono font-bold text-slate-400">ID: {isSample ? `REF-${id}` : realData?.exercise_id?.slice(0, 8)}</span>
                            </div>
                            <Button variant="white" size="icon" className="h-12 w-12 rounded-2xl shadow-sm border-slate-200 text-slate-400 hover:text-primary transition-all bg-white/50 backdrop-blur-md">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Question Prompt Section: Glass Style */}
                    {displayData?.prompt && (
                        <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-[2.5rem] blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 p-8 lg:p-10 space-y-6 shadow-2xl shadow-slate-200/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                        <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        Inquiry Context
                                    </div>
                                    <div className="h-px flex-1 mx-6 bg-slate-200/30" />
                                </div>

                                <div className="space-y-6">
                                    {displayData.imageUrl && (
                                        <div className="space-y-4">
                                            <div
                                                onClick={() => setIsLightboxOpen(true)}
                                                className="relative aspect-video bg-slate-50/50 rounded-3xl flex items-center justify-center border border-slate-200/50 group/img overflow-hidden cursor-zoom-in hover:border-primary/20 transition-all hover:shadow-2xl"
                                            >
                                                <img
                                                    src={displayData.imageUrl}
                                                    alt="Task Chart"
                                                    className="w-full h-full object-contain p-6 transition-transform duration-1000 group-hover/img:scale-105"
                                                />
                                                <div className="absolute top-6 right-6 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="white" className="rounded-2xl shadow-2xl border-white/20 h-12 w-12 bg-white/80 backdrop-blur-md">
                                                        <Maximize2 className="h-5 w-5 text-slate-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
                                            <HelpCircle className="h-3.5 w-3.5" />
                                            Prompt Content
                                        </div>
                                        <p className="text-lg font-medium text-slate-700 leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2">
                                            "{displayData.prompt}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Score & Evaluation Results */}
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        {(isSample || (realData && realData.state === ATTEMPT_STATES.EVALUATED)) ? (
                            <>
                                {(() => {
                                    const score = displayData?.overall_score || displayData?.bandScore || realData?.score || 0;
                                    return (
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-primary/10 rounded-[3rem] blur-2xl opacity-20" />
                                            <ScoreOverview
                                                score={score}
                                                showChatButton={!isSample}
                                                onChatClick={() => setIsCatbotOpen(true)}
                                                className="bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-2xl shadow-slate-200/20"
                                            />
                                        </div>
                                    );
                                })()}
                                <div className="space-y-16">
                                    {displayData ? (
                                        (displayData.type === "Writing" || (!isSample && realData?.exercise?.type?.startsWith('writing'))) ? (
                                            displayData.detailed_scores ? (
                                                <div className="space-y-12">
                                                    <WritingFeedback
                                                        result={displayData as any}
                                                        type={isSample ? (displayData as any).writingType : realData?.exercise?.type as any}
                                                        hideScore={true}
                                                        attemptId={isSample ? "sample-" + id : realData?.id}
                                                        originalText={isSample ? displayData.originalText : realData?.content}
                                                        isUnlocked={isSample ? true : realData?.is_correction_unlocked}
                                                        initialCorrection={isSample ? { edits: displayData.feedbackCards || [] } : (realData?.correction_data ? JSON.parse(realData.correction_data) : null)}
                                                        targetScore={targetScore}
                                                        isExampleEssayUnlocked={!isSample && realData?.is_example_essay_unlocked}
                                                        initialExampleEssay={!isSample && realData?.example_essay_data ? (typeof realData.example_essay_data === 'string' ? JSON.parse(realData.example_essay_data) : realData.example_essay_data) : null}
                                                    />
                                                </div>
                                            ) : (
                                                <WritingEvaluation data={displayData as any} />
                                            )
                                        ) : displayData.type === "Speaking" ? (
                                            <SpeakingEvaluation data={displayData as any} />
                                        ) : (
                                            <RewriterEvaluation data={displayData as any} />
                                        )
                                    ) : (
                                        <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white/40 p-16 text-center shadow-2xl">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                                <Info className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <p className="text-base font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Feedback Stream Offline</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Pending Evaluation Teaser */
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-primary rounded-[3rem] blur-2xl opacity-25 animate-pulse" />
                                <div className="relative bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white/40 p-16 text-center space-y-10 shadow-2xl shadow-primary/10 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

                                    <div className="flex flex-col items-center justify-center p-8 space-y-8 z-10 relative">
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '3s' }} />
                                            <div className="w-28 h-28 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 relative z-10">
                                                <Lock className="h-12 w-12 text-white" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">ANALYSIS LOCKED</h3>
                                            <p className="text-slate-500 text-lg font-bold max-w-md mx-auto leading-relaxed">
                                                Your masterpiece is waiting. Unlock deep AI diagnostics to reach your target Band {targetScore}.
                                            </p>
                                        </div>

                                        <AIActionButton
                                            label={isEvaluating ? "Analyzing..." : "Initialize Analysis"}
                                            icon={Sparkles}
                                            onClick={handleEvaluate}
                                            isLoading={isEvaluating}
                                            badge="-10"
                                            className="w-full max-w-md h-20 rounded-[2.5rem] text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Side Panel: Horsebot AI Tutor Redesign */}
            {!isSample && (
                <div
                    className={cn(
                        "bg-white/80 backdrop-blur-3xl border-l border-white/40 transition-all duration-700 ease-in-out flex flex-col relative hidden xl:flex shadow-2xl",
                        isCatbotOpen ? "w-[450px]" : "w-0 overflow-hidden border-none"
                    )}
                >
                    <div className="flex flex-col h-full relative z-10">
                        {/* Chat Header */}
                        <div className="p-8 border-b border-slate-100/50 flex items-center justify-between bg-white/50">
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl shadow-indigo-600/20 rotate-3 group-hover:rotate-0 transition-transform">
                                        <span className="text-3xl">🐴</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black font-outfit text-slate-900">Horsebot Intelligence</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Neural Tutor Active</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCatbotOpen(false)}
                                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Chat Feed */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto px-8 py-10 space-y-10 scrollbar-hide"
                        >
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex flex-col gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-500",
                                        msg.role === "assistant" ? "items-start" : "items-end ml-auto"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-6 rounded-[2rem] border transition-all duration-300 relative group",
                                            msg.role === "assistant"
                                                ? "bg-slate-50 border-slate-100 rounded-tl-none font-bold text-slate-700 text-[15px] leading-relaxed shadow-sm"
                                                : "bg-primary border-primary rounded-tr-none text-white font-black text-[15px] shadow-2xl shadow-primary/20"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <div className={cn("w-1 h-1 rounded-full", msg.role === "assistant" ? "bg-indigo-400" : "bg-primary")} />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                            {msg.role === "assistant" ? "Neural Tutor" : "Explorer"}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex flex-col gap-3">
                                    <div className="bg-slate-50/50 backdrop-blur-md p-6 rounded-[2rem] rounded-tl-none border border-slate-100 w-fit">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Interaction Area */}
                        <div className="p-8 bg-slate-50/50 backdrop-blur-xl border-t border-slate-100">
                            <div className="space-y-8">
                                {/* Suggestions */}
                                <div className="space-y-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Contextual Inquires</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {["Analyze errors", "Score criteria", "Target 8.0 roadmap"].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => handleSendMessage(q)}
                                                className="text-[10px] font-black px-5 py-2.5 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-2xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Input Field */}
                                <div className="relative group/chatinput">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-3xl blur opacity-0 group-focus-within/chatinput:opacity-10 transition duration-700" />
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSendMessage(chatInput)
                                        }}
                                        placeholder="Command Horsebot Intelligence..."
                                        className="relative w-full bg-white border border-slate-100 rounded-[1.5rem] h-20 pl-8 pr-20 text-base font-bold placeholder:text-slate-300 focus:outline-none focus:border-primary/30 transition-all shadow-xl shadow-slate-200/50"
                                    />
                                    <button
                                        onClick={() => handleSendMessage(chatInput)}
                                        className="absolute right-4 top-4 h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-primary transition-all active:scale-90 z-10"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>

                                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                                    Data-Driven Academic Support
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analyzing Overlay */}
            <EvaluatingOverlay isVisible={isEvaluating} step={evalStep} />

            {/* 3. Global Lightbox Overlay */}
            {isLightboxOpen && displayData?.imageUrl && (
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
                        src={displayData.imageUrl}
                        alt="Full Screen Chart"
                        className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in duration-500"
                        onClick={(e) => e.stopPropagation()}
                    />
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
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-pointer" />
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
