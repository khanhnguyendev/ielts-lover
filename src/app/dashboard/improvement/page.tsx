"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getMistakeDashboardData, generateWeaknessAnalysis, getFeaturePrice } from "@/app/actions"
import { SKILL_TYPES, FEATURE_KEYS, SkillType } from "@/lib/constants"
import { UserMistake, UserActionPlan } from "@/repositories/interfaces"
import { Button } from "@/components/ui/button"
import { CreditBadge } from "@/components/ui/credit-badge"
import { useNotification } from "@/lib/contexts/notification-context"
import { extractBillingError } from "@/lib/billing-errors"
import { cn } from "@/lib/utils"
import {
    Sparkles,
    Brain,
    Target,
    AlertTriangle,
    ArrowRight,
    Zap,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Quote,
    BarChart3,
    History,
    ShieldAlert,
    TrendingUp,
    Lightbulb,
    Loader2,
    ScanSearch,
    Route,
    Search
} from "lucide-react"
import { PulseLoader } from "@/components/global/pulse-loader"
import { NOTIFY_MSGS } from "@/lib/constants/messages"
import { StatCard } from "@/components/dashboard/stat-card"


const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    grammar: { label: "Grammar", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: ShieldAlert },
    vocabulary: { label: "Vocabulary", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: History },
    coherence: { label: "Coherence", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: BarChart3 },
    pronunciation: { label: "Pronunciation", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", icon: History },
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    high: { label: "High", color: "text-rose-600", bg: "bg-rose-50/80", icon: AlertTriangle },
    medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50/80", icon: Target },
    low: { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50/80", icon: CheckCircle2 },
}

export default function ImprovementPage() {
    const [mistakes, setMistakes] = React.useState<UserMistake[]>([])
    const [totalCount, setTotalCount] = React.useState(0)
    const [categoryStats, setCategoryStats] = React.useState<Record<string, number>>({})
    const [latestPlan, setLatestPlan] = React.useState<UserActionPlan | null>(null)
    const [activeTab, setActiveTab] = React.useState<SkillType | undefined>(undefined)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [targetScore, setTargetScore] = React.useState<number>(8.0)
    const [analysisCost, setAnalysisCost] = React.useState(30)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [genStep, setGenStep] = React.useState(0)
    const { notifyError } = useNotification()

    const ITEMS_PER_PAGE = 8

    const loadData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getMistakeDashboardData(activeTab)
            setMistakes(data.mistakes)
            setTotalCount(data.totalCount)
            setCategoryStats(data.categoryStats)
            setLatestPlan(data.latestPlan)
            if (data.target_score) setTargetScore(data.target_score)
            setCurrentPage(1)
        } finally {
            setIsLoading(false)
        }
    }, [activeTab])

    const loadPrice = React.useCallback(async () => {
        const cost = await getFeaturePrice(FEATURE_KEYS.WEAKNESS_ANALYSIS)
        setAnalysisCost(cost)
    }, [])

    React.useEffect(() => {
        loadData()
        loadPrice()
    }, [loadData, loadPrice])

    async function handleGenerateAnalysis() {
        setIsGenerating(true)
        setGenStep(1)
        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -analysisCost } }))

        const t1 = setTimeout(() => setGenStep(2), 2000)
        const t2 = setTimeout(() => setGenStep(3), 5000)

        try {
            const result = await generateWeaknessAnalysis()
            clearTimeout(t1)
            clearTimeout(t2)
            if (result.success && result.data) {
                setLatestPlan(result.data)
            } else {
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: analysisCost } }))
                const billing = extractBillingError(result as any);
                if (billing) {
                    notifyError(billing.title, billing.message, "Close")
                } else {
                    notifyError(NOTIFY_MSGS.ERROR.ANALYSIS_FAILED?.title || "Analysis Failed", NOTIFY_MSGS.ERROR.ANALYSIS_FAILED?.description || "Unable to generate analysis.", "Close")
                }
            }
        } catch {
            window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: analysisCost } }))
            notifyError(NOTIFY_MSGS.ERROR.UNEXPECTED?.title || "Unexpected Error", NOTIFY_MSGS.ERROR.UNEXPECTED?.description || "A system error occurred.")
        } finally {
            setIsGenerating(false)
            setGenStep(0)
        }
    }

    const filteredMistakes = mistakes
    const totalPages = Math.ceil(filteredMistakes.length / ITEMS_PER_PAGE)
    const paginatedMistakes = filteredMistakes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    if (isLoading && mistakes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50/30 dark:bg-slate-950/30">
                <PulseLoader size="lg" color="primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 animate-pulse">Scanning Error Patterns...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* 1. Header & Title */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary rounded-2xl text-white shadow-2xl shadow-primary/30">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Improvement Lab</h1>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">AI Weakness Detection & Strategy</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Mistake Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard
                        index={0}
                        icon={History}
                        label="Total Mistakes"
                        value={totalCount.toString()}
                        subLabel="Pattern Archive"
                        color="text-slate-900 dark:text-white"
                        bgColor="bg-slate-100 dark:bg-slate-800"
                    />
                    <StatCard
                        index={1}
                        icon={ShieldAlert}
                        label="Grammar"
                        value={categoryStats.grammar?.toString() || "0"}
                        subLabel="Critical Accuracy"
                        color="text-rose-600"
                        bgColor="bg-rose-100/50"
                    />
                    <StatCard
                        index={2}
                        icon={BookOpen}
                        label="Vocabulary"
                        value={categoryStats.vocabulary?.toString() || "0"}
                        subLabel="Lexical Depth"
                        color="text-indigo-600"
                        bgColor="bg-indigo-100/50"
                    />
                    <StatCard
                        index={3}
                        icon={TrendingUp}
                        label="Success Index"
                        value={totalCount > 10 ? "75%" : "20%"}
                        subLabel="Improvement Curve"
                        color="text-emerald-600"
                        bgColor="bg-emerald-100/50"
                    />
                </div>

                {/* 3. AI Analyzer Magical Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative overflow-hidden rounded-[3rem] bg-slate-900 text-white p-6 lg:p-12 shadow-2xl shadow-primary/20 group"
                >
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 mb-12 pb-12 border-b border-white/10">
                        <div className="space-y-4 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-4">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black font-outfit tracking-tight text-white uppercase">Neural Weakness Analyzer</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Precision Mining Active</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-400 text-base max-w-xl font-medium leading-relaxed">
                                Our neural engine scans your entire practice history to identify linguistic bottlenecks. Get an automated high-impact roadmap for Band {targetScore.toFixed(1)}.
                            </p>
                        </div>

                        <Button
                            onClick={handleGenerateAnalysis}
                            disabled={isGenerating}
                            className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[10px] h-16 px-12 rounded-2xl shadow-2xl shadow-primary/40 group/btn transition-all hover:-translate-y-1 active:scale-95 border-none"
                        >
                            {isGenerating ? "Analyzing Patterns..." : (latestPlan ? "Refresh Deep Analysis" : "Launch Deep Scan")}
                            <CreditBadge amount={-analysisCost} size="sm" className="ml-4 border-white/20 bg-white/10" />
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div
                                key="generating"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative z-10 py-12 flex flex-col items-center gap-10"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl">
                                        <Brain className="w-12 h-12 text-primary animate-pulse" />
                                    </div>
                                    <div className="absolute -inset-4 rounded-[3rem] border-2 border-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
                                </div>

                                <div className="w-full max-w-md space-y-4">
                                    {[
                                        { icon: ScanSearch, label: "Scanning mistake history", step: 1 },
                                        { icon: Brain, label: "Identifying weakness patterns", step: 2 },
                                        { icon: Route, label: "Building action plan", step: 3 },
                                    ].map(({ icon: StepIcon, label, step }) => (
                                        <div
                                            key={step}
                                            className={cn(
                                                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-700 backdrop-blur-md border",
                                                genStep >= step
                                                    ? "bg-white/10 text-white border-white/10"
                                                    : "bg-white/5 text-slate-600 border-transparent"
                                            )}
                                        >
                                            {genStep > step ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                            ) : genStep === step ? (
                                                <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                                            ) : (
                                                <StepIcon className="h-5 w-5 shrink-0" />
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : latestPlan ? (
                            <motion.div
                                key="plan"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative z-10 space-y-12"
                            >
                                {/* Summary Glass */}
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex gap-6 group/summary hover:bg-white/[0.08] transition-colors">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0 mt-1">
                                        <Quote size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-bold leading-relaxed text-slate-100">{latestPlan.plan_data.summary}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{latestPlan.mistakes_analyzed} Patterns Cataloged</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Weakness Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {latestPlan.plan_data.top_weaknesses.map((w, i) => {
                                        const severity = SEVERITY_CONFIG[w.severity] || SEVERITY_CONFIG.medium
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.08] transition-all duration-500 group/card hover:border-white/10"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg", severity.bg, severity.color)}>
                                                        {severity.label} Priority
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-1 px-1">
                                                        {w.frequency}x
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-sm font-bold text-slate-100 leading-relaxed">{w.description}</p>
                                                    <div className="w-8 h-1 bg-white/10 rounded-full group-hover/card:w-16 group-hover/card:bg-primary transition-all duration-700" />
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                {/* Action Roadmap */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">High-Impact Precision Roadmap</h3>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Calculated steps for Band {targetScore.toFixed(1)} Mastery</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {latestPlan.plan_data.action_items.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3 + (i * 0.1) }}
                                                className="group/action relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 lg:p-10 rounded-[3rem] hover:bg-white/[0.08] transition-all duration-700 hover:border-primary/40 hover:-translate-y-2 shadow-2xl"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-8">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex flex-col items-center justify-center text-primary shrink-0 border border-primary/20 shadow-2xl shadow-primary/20 transition-transform group-hover/action:scale-110 group-hover/action:rotate-3">
                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Step</span>
                                                        <span className="text-2xl font-black font-outfit leading-none">0{item.priority}</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="text-xl font-black text-white group-hover/action:text-primary transition-colors tracking-tight">{item.title}</h4>
                                                        <p className="text-[13px] text-slate-400 leading-relaxed font-medium group-hover/action:text-slate-300 transition-colors">{item.description}</p>

                                                        {item.examples.length > 0 && (
                                                            <div className="pt-6 border-t border-white/10 space-y-3">
                                                                {item.examples.slice(0, 1).map((ex, j) => (
                                                                    <div key={j} className="flex flex-col gap-3">
                                                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 px-4 py-3 rounded-2xl border border-rose-500/20 w-fit">
                                                                            <span className="opacity-40 line-through">Draft:</span>
                                                                            <span>{ex.wrong}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-4 py-3 rounded-2xl border border-emerald-500/20 w-fit">
                                                                            <span className="opacity-40">Elite:</span>
                                                                            <span>{ex.correct}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-24 text-center animate-in zoom-in-95 duration-1000 space-y-8">
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center text-5xl mx-auto shadow-2xl backdrop-blur-xl">
                                    🔍
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black font-outfit text-white">Analysis Data Insufficient</h3>
                                    <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Please initiate a deep scan to generate your Band {targetScore.toFixed(1)} mastery roadmap based on existing patterns.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* 4. Mistake Ledger */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-4 lg:p-10 shadow-2xl border border-white/20 dark:border-slate-800/50 space-y-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-10 px-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-1 text-center lg:text-left">
                            <h2 className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Pattern Ledger</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">{totalCount} Linguistic Entries cataloged</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <FilterGroup
                                label="Field"
                                options={[
                                    { value: null, label: 'All' },
                                    { value: SKILL_TYPES.WRITING, label: 'Writing' },
                                    { value: SKILL_TYPES.SPEAKING, label: 'Speaking' }
                                ]}
                                value={activeTab || null}
                                onChange={(val: SkillType | null) => { setActiveTab(val || undefined); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    {paginatedMistakes.length === 0 ? (
                        <div className="text-center py-32 space-y-8">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto grayscale opacity-50">
                                <Search size={40} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">Clean Performance Ledger</h3>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">No systematic patterns match your filters at this time.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 px-2">
                            {paginatedMistakes.map((m, idx) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <MistakeRow mistake={m} />
                                </motion.div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between pt-12 border-t border-slate-100 dark:border-slate-800 mt-8 gap-6">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
                                        Vault Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PaginationButton
                                            icon={ChevronLeft}
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        />
                                        <div className="flex gap-2">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl text-[10px] font-black transition-all duration-500",
                                                        currentPage === i + 1
                                                            ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110"
                                                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700"
                                                    )}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <PaginationButton
                                            icon={ChevronRight}
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-auto py-12 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                © 2026 IELTS LOVER COGNITIVE &nbsp; • &nbsp; AI DRIVEN GROWTH
            </footer>
        </div>
    )
}

/* Redesigned Sub-Components */

function MistakeRow({ mistake: m }: { mistake: UserMistake }) {
    const config = CATEGORY_CONFIG[m.error_category] || CATEGORY_CONFIG.grammar
    const isWriting = m.skill_type === 'writing'

    return (
        <div className="group bg-white/50 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50 rounded-[2.5rem] p-6 lg:p-10 transition-all duration-700 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-primary/20 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white dark:border-slate-700 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6",
                        isWriting ? "bg-purple-100/50 text-purple-600" : "bg-blue-100/50 text-blue-600"
                    )}>
                        {isWriting ? "✍️" : "🎤"}
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                config.bg, config.color, config.border.replace('border-', 'border-opacity-50 border-')
                            )}>
                                {config.label} Pattern
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{isWriting ? "Writing Lab" : "Speaking Lab"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                            {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-1" />
                            {new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                        Deep Context <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {m.source_sentence && (
                    <div className="relative pl-10 border-l-[3px] border-primary/10 dark:border-primary/5 py-2">
                        <Quote size={28} className="absolute -left-5 -top-3 text-primary/5 fill-primary/5" />
                        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic">&quot;{m.source_sentence}&quot;</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] items-center gap-6 lg:gap-12 bg-slate-50/50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-all duration-700 group-hover:bg-white dark:group-hover:bg-slate-900 shadow-inner group-hover:shadow-2xl group-hover:shadow-primary/5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center shadow-inner">
                                <span className="text-[10px] text-rose-500 font-black">!</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Inefficient Pattern</p>
                        </div>
                        <p className="text-lg font-black text-rose-600 line-through decoration-rose-600/30 font-outfit tracking-tighter leading-tight">{m.original_context}</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-900 transition-all duration-700 group-hover:rotate-[360deg] shrink-0 border border-slate-100 dark:border-slate-700">
                            <ArrowRight size={20} className="text-primary" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-inner">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Mastery Correction</p>
                        </div>
                        <p className="text-lg font-black text-emerald-600 font-outfit tracking-tighter leading-tight">{m.correction}</p>
                    </div>
                </div>

                {m.explanation && (
                    <div className="flex gap-6 p-8 bg-primary/5 dark:bg-primary/5 rounded-[2.5rem] border border-primary/10 border-dashed hover:border-solid hover:bg-primary/10 transition-all duration-700 group/explanation">
                        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-xl border border-primary/10 group-hover/explanation:scale-110 transition-transform">
                            <Lightbulb size={24} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Strategic Insight</h5>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{m.explanation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>
    )
}

interface FilterGroupProps {
    label: string;
    options: { value: SkillType | null; label: string }[];
    value: SkillType | null;
    onChange: (val: SkillType | null) => void;
}

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{label}</span>
            <div className="flex gap-1 bg-white/50 dark:bg-slate-950/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-md">
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-700",
                            value === opt.value
                                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

function PaginationButton({ icon: Icon, disabled, onClick }: { icon: React.ElementType, disabled: boolean, onClick: () => void }) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-xl hover:shadow-2xl disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        >
            <Icon size={20} />
        </button>
    )
}
