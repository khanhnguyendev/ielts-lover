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
import { Progress } from "@/components/ui/progress"
import { BackButton } from "@/components/global/back-button"
import { cn } from "@/lib/utils"

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
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white">
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
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50/30 select-none">
            {/* 1. Main Content: Analysis Result */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-12 pb-32">

                    {/* Header: Context & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">
                                    {isSample ? "Performance Analysis" : "Session Feedback"}
                                </h1>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">
                                    {isSample ? (
                                        <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-amber-500" /> Reference Sample No. {id}</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Completed {new Date(realData!.created_at).toLocaleDateString()}</span>
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
                            <Button variant="white" size="icon" className="h-12 w-12 rounded-2xl shadow-sm border-slate-200 text-slate-400 hover:text-primary transition-all">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Question Prompt Section: Using the Practice Page 'Glass' Style */}
                    {displayData?.prompt && (
                        <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-[2.5rem] blur opacity-25" />
                            <div className="relative bg-white rounded-[2rem] border border-slate-200 p-6 lg:p-8 space-y-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                        <FileText className="h-3.5 w-3.5" />
                                        Inquiry Context
                                    </div>
                                    <div className="h-px flex-1 mx-6 bg-slate-50" />
                                </div>

                                <div className="space-y-5">
                                    {displayData.imageUrl && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                                    <Layout className="h-4 w-4" />
                                                    Chart Data
                                                </div>
                                            </div>
                                            <div
                                                onClick={() => setIsLightboxOpen(true)}
                                                className="relative aspect-video bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-200 group/img overflow-hidden cursor-zoom-in hover:border-primary/20 transition-all"
                                            >
                                                <img
                                                    src={displayData.imageUrl}
                                                    alt="Task Chart"
                                                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover/img:scale-105"
                                                />
                                                <div className="absolute top-4 right-4 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="white" className="rounded-xl shadow-xl border border-slate-200 h-10 w-10">
                                                        <Maximize2 className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                            <HelpCircle className="h-3.5 w-3.5" />
                                            Question Text
                                        </div>
                                        <p className="text-[15px] font-medium text-slate-700 leading-relaxed italic border-l-4 border-primary/20 pl-5 py-1.5">
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
                                        <ScoreOverview
                                            score={score}
                                            showChatButton={!isSample}
                                            onChatClick={() => setIsCatbotOpen(true)}
                                            className="bg-white rounded-[2rem] border border-slate-200 shadow-sm"
                                        />
                                    );
                                })()}
                                <div className="space-y-12">
                                    {displayData ? (
                                        (displayData.type === "Writing" || (!isSample && realData?.exercise?.type?.startsWith('writing'))) ? (
                                            displayData.detailed_scores ? (
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
                                            ) : (
                                                <WritingEvaluation data={displayData as any} />
                                            )
                                        ) : displayData.type === "Speaking" ? (
                                            <SpeakingEvaluation data={displayData as any} />
                                        ) : (
                                            <RewriterEvaluation data={displayData as any} />
                                        )
                                    ) : (
                                        // Evaluated but feedback data is not available (legacy or processing)
                                        <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center space-y-4">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No feedback data found for this report.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Pending Evaluation Teaser */
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-primary rounded-[3rem] blur opacity-20 transition duration-1000" />
                                <div className="relative bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center space-y-8 shadow-2xl shadow-slate-200/50 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                                    <div className="flex flex-col items-center justify-center p-8 space-y-6 z-10 relative">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-transform duration-500 relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                                            <Lock className="h-10 w-10 text-white relative z-10" />
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black font-outfit text-slate-900">Analysis Pending</h3>
                                            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                                Your response has been saved. Activate AI analysis to receive precision scoring and personalized improvement tips.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4 justify-center">
                                            <Button
                                                onClick={handleEvaluate}
                                                disabled={isEvaluating}
                                                className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                                {isEvaluating ? <Loader2 className="h-6 w-6 animate-spin" /> : "Evaluate with AI (10 Credits)"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Mock Blur Background */}
                                    <div className="grid grid-cols-2 gap-8 opacity-[0.03] select-none pointer-events-none absolute inset-0 -z-0 blur-sm">
                                        <div className="h-64 bg-slate-900 rounded-2xl" />
                                        <div className="h-64 bg-slate-900 rounded-2xl" />
                                        <div className="h-80 bg-slate-900 rounded-2xl col-span-2" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Side Panel: Horsebot AI Tutor */}
            {!isSample && (
                <div
                    className={cn(
                        "bg-white border-l transition-all duration-700 flex flex-col relative hidden xl:flex shadow-[-20px_0_40px_rgba(0,0,0,0.02)]",
                        isCatbotOpen ? "w-[420px]" : "w-0 overflow-hidden"
                    )}
                >
                    <div className="p-8 flex flex-col h-full bg-white relative z-10">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-400/20 shadow-lg shadow-indigo-600/20 rotate-2">
                                    <span className="text-2xl">🐴</span>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-black font-outfit text-slate-900">Horsebot AI</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Expert</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCatbotOpen(false)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat Feed */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto py-10 space-y-8 scrollbar-hide"
                        >
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex flex-col gap-2 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                                        msg.role === "assistant" ? "items-start" : "items-end ml-auto"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-5 rounded-3xl border transition-all selection:bg-primary/20",
                                            msg.role === "assistant"
                                                ? "bg-slate-50 border-slate-100 rounded-tl-none font-medium text-slate-700 text-sm leading-relaxed"
                                                : "bg-primary border-primary rounded-tr-none text-white font-bold text-sm shadow-lg shadow-primary/20"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">
                                        {msg.role === "assistant" ? "Tutor" : "Researcher"}
                                    </span>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="bg-slate-50 p-5 rounded-3xl rounded-tl-none border border-slate-100 w-fit animate-pulse">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Interaction Area */}
                        <div className="pt-8 border-t border-slate-100 mt-auto space-y-8">
                            {/* Suggestions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400/60">Guidance Prompts</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {["Improvement tips", "Key mistakes", "Explain score"].map(q => (
                                        <button
                                            key={q}
                                            onClick={() => handleSendMessage(q)}
                                            className="text-[10px] font-black px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-full transition-all shadow-sm active:scale-95"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="relative group/chatinput">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-focus-within/chatinput:opacity-100 transition duration-500" />
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSendMessage(chatInput)
                                    }}
                                    placeholder="Inquire with Horsebot..."
                                    className="relative w-full bg-white border border-slate-200 rounded-2xl h-16 pl-6 pr-16 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-primary transition-all shadow-sm"
                                />
                                <button
                                    onClick={() => handleSendMessage(chatInput)}
                                    className="absolute right-3 top-3 h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-primary transition-all active:scale-90 z-10"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                Horsebot analyze 100% of your current response
                            </p>
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
