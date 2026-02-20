"use client"

import { useState, useEffect, useTransition } from "react"
import { getMistakeDashboardData, generateWeaknessAnalysis, getFeaturePrice } from "@/app/actions"
import { SKILL_TYPES, FEATURE_KEYS, ERROR_CATEGORIES, SkillType } from "@/lib/constants"
import { UserMistake, UserActionPlan } from "@/repositories/interfaces"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditBadge } from "@/components/ui/credit-badge"

import { cn } from "@/lib/utils"
import {
    Sparkles,
    Brain,
    Target,
    AlertTriangle,
    ArrowRight,
    PenTool,
    Mic2,
    Loader2,
    Zap,
    BookOpen,
    CheckCircle2,
    FileText,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Quote,
    ArrowRightLeft
} from "lucide-react"
import { PulseLoader } from "@/components/global/pulse-loader"

const SKILL_TABS = [
    { key: undefined as SkillType | undefined, label: "All Mistakes" },
    { key: SKILL_TYPES.WRITING as SkillType, label: "Writing" },
    { key: SKILL_TYPES.SPEAKING as SkillType, label: "Speaking" },
]

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    grammar: { label: "Grammar", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
    vocabulary: { label: "Vocabulary", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
    coherence: { label: "Coherence", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    pronunciation: { label: "Pronunciation", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    high: { label: "High", color: "text-rose-600", bg: "bg-rose-50/80", icon: AlertTriangle },
    medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50/80", icon: Target },
    low: { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50/80", icon: CheckCircle2 },
}

// ─── Page Component ──────────────────────────────────────
export default function ImprovementPage() {
    const [mistakes, setMistakes] = useState<UserMistake[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [categoryStats, setCategoryStats] = useState<Record<string, number>>({})
    const [latestPlan, setLatestPlan] = useState<UserActionPlan | null>(null)
    const [activeTab, setActiveTab] = useState<SkillType | undefined>(undefined)
    const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)
    const [analysisCost, setAnalysisCost] = useState(30)
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const ITEMS_PER_PAGE = 8

    useEffect(() => {
        loadData()
        loadPrice()
    }, [activeTab])

    async function loadData() {
        setIsLoading(true)
        try {
            const data = await getMistakeDashboardData(activeTab)
            setMistakes(data.mistakes)
            setTotalCount(data.totalCount)
            setCategoryStats(data.categoryStats)
            setLatestPlan(data.latestPlan)
            setCurrentPage(1)
        } finally {
            setIsLoading(false)
        }
    }

    async function loadPrice() {
        const cost = await getFeaturePrice(FEATURE_KEYS.WEAKNESS_ANALYSIS)
        setAnalysisCost(cost)
    }

    async function handleGenerateAnalysis() {
        setIsGenerating(true)
        setError(null)
        try {
            const result = await generateWeaknessAnalysis()
            if (result.success && result.data) {
                setLatestPlan(result.data)
            } else if (result.error === "INSUFFICIENT_CREDITS") {
                setError("Insufficient StarCredits. Please top up to continue.")
            } else {
                setError("Analysis failed. Please try again later.")
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    // ─── Filtering & Pagination ─────────────────────────────────────────
    const filteredMistakes = activeCategory
        ? mistakes.filter(m => m.error_category === activeCategory)
        : mistakes
    const totalPages = Math.ceil(filteredMistakes.length / ITEMS_PER_PAGE)
    const paginatedMistakes = filteredMistakes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-8 lg:p-12 space-y-8 max-w-5xl mx-auto">

                {/* ─── AI Weakness Analyzer Section ─── */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Brain className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Weakness Analyzer</h2>
                            <p className="text-xs text-muted-foreground">Discover patterns in your mistakes and get a personalized action plan</p>
                        </div>
                    </div>

                    {latestPlan ? (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <Card className="border-violet-100 bg-gradient-to-br from-violet-50/50 to-purple-50/30 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-violet-900 mb-1">AI Analysis Summary</p>
                                            <p className="text-sm text-violet-700 leading-relaxed">{latestPlan.plan_data.summary}</p>
                                            <div className="flex items-center gap-4 mt-3 text-[10px] font-medium text-violet-500 uppercase tracking-wider">
                                                <span>{latestPlan.mistakes_analyzed} mistakes analyzed</span>
                                                <span>·</span>
                                                <span>Generated {new Date(latestPlan.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Weaknesses */}
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {latestPlan.plan_data.top_weaknesses.map((w, i) => {
                                    const severity = SEVERITY_CONFIG[w.severity] || SEVERITY_CONFIG.medium
                                    const catConfig = CATEGORY_CONFIG[w.category] || CATEGORY_CONFIG.grammar
                                    return (
                                        <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5", catConfig.bg, catConfig.border, catConfig.color)}>
                                                        {catConfig.label}
                                                    </Badge>
                                                    <div className={cn("flex items-center gap-1 text-[9px] font-bold uppercase", severity.color)}>
                                                        <severity.icon className="h-3 w-3" />
                                                        {severity.label}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed">{w.description}</p>
                                                <div className="mt-3 text-[10px] font-semibold text-muted-foreground">
                                                    {w.frequency} occurrence{w.frequency > 1 ? 's' : ''} found
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>

                            {/* Action Items */}
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        Action Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-0">
                                    {latestPlan.plan_data.action_items.map((item, i) => {
                                        const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.grammar
                                        return (
                                            <div key={i} className="group relative pl-8 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                                <div className={cn("absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold", catConfig.bg, catConfig.color)}>
                                                    {item.priority}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                                                    {item.examples.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {item.examples.slice(0, 2).map((ex, j) => (
                                                                <div key={j} className="flex items-center gap-2 text-xs">
                                                                    <span className="text-rose-500 line-through">{ex.wrong}</span>
                                                                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                                    <span className="text-emerald-600 font-medium">{ex.correct}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>

                            {/* Re-generate */}
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateAnalysis}
                                    disabled={isGenerating}
                                    className="text-xs gap-2"
                                >
                                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                                    Re-generate Analysis
                                    <CreditBadge amount={-analysisCost} size="sm" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <Card className="border-dashed border-2 border-violet-200 bg-gradient-to-br from-violet-50/30 to-purple-50/20">
                            <CardContent className="p-12 text-center space-y-4">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto">
                                    <Brain className="h-8 w-8 text-violet-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-800">Unlock Your Personalized Action Plan</h3>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                        Our AI will analyze your mistake patterns, identify recurring weaknesses,
                                        and create a prioritized improvement plan tailored to your IELTS goals.
                                    </p>
                                </div>
                                {totalCount === 0 ? (
                                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                                        Complete some exercises first to build your mistake bank
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleGenerateAnalysis}
                                        disabled={isGenerating}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 gap-2"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        Generate Deep Analysis
                                        <CreditBadge amount={-analysisCost} size="sm" />
                                    </Button>
                                )}
                                {error && (
                                    <p className="text-xs text-rose-500 mt-2">{error}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* ─── Mistake Ledger Section ─── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                            <BookOpen className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Mistake Ledger</h2>
                            <p className="text-xs text-muted-foreground">{totalCount} mistake{totalCount !== 1 ? 's' : ''} recorded across all sessions</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-2">
                        {/* Skill Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-12 shrink-0">Skill</span>
                            <div className="flex bg-slate-100/50 p-0.5 rounded-lg w-fit border border-slate-200/60">
                                {SKILL_TABS.map((tab) => (
                                    <button
                                        key={tab.label}
                                        onClick={() => {
                                            setActiveTab(tab.key)
                                            setActiveCategory(undefined)
                                            setCurrentPage(1)
                                        }}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                            activeTab === tab.key
                                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                                : "text-muted-foreground hover:text-slate-900"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-12 shrink-0">Type</span>
                            <div className="flex flex-wrap bg-slate-100/50 p-0.5 rounded-lg w-fit border border-slate-200/60">
                                <button
                                    onClick={() => { setActiveCategory(undefined); setCurrentPage(1) }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                        !activeCategory
                                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
                                            : "text-muted-foreground hover:text-slate-900"
                                    )}
                                >
                                    All ({totalCount})
                                </button>
                                {Object.entries(categoryStats).map(([cat, count]) => {
                                    const config = CATEGORY_CONFIG[cat]
                                    if (!config || count === 0) return null
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => { setActiveCategory(cat === activeCategory ? undefined : cat); setCurrentPage(1) }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                                activeCategory === cat
                                                    ? cn("bg-white shadow-sm ring-1 ring-black/5", config.color)
                                                    : "text-muted-foreground hover:text-slate-900"
                                            )}
                                        >
                                            <span className={cn("w-1.5 h-1.5 rounded-full", config.bg, activeCategory === cat && config.color.replace("text-", "bg-"))} />
                                            {config.label} ({count})
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mistake Cards */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <PulseLoader size="lg" color="primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading mistakes...</p>
                        </div>
                    ) : mistakes.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200">
                            <CardContent className="p-12 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                                    <FileText className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">No mistakes recorded yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Submit writing exercises and unlock corrections to start building your mistake bank.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {paginatedMistakes.map((m) => {
                                const catConfig = CATEGORY_CONFIG[m.error_category] || CATEGORY_CONFIG.grammar
                                return (
                                    <div key={m.id} className="group rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                                        {/* Header Row — metadata */}
                                        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100/80 bg-slate-50/40">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                <Calendar className="h-3 w-3 text-slate-400" />
                                                {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <span className="text-slate-300">·</span>
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                {new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 flex items-center gap-1 shadow-xs",
                                                    m.skill_type === 'writing'
                                                        ? "bg-indigo-50/50 border-indigo-100 text-indigo-600"
                                                        : "bg-amber-50/50 border-amber-100 text-amber-600"
                                                )}>
                                                    {m.skill_type === 'writing' ? <PenTool className="h-2.5 w-2.5" /> : <Mic2 className="h-2.5 w-2.5" />}
                                                    {m.skill_type}
                                                </Badge>
                                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 shadow-xs", catConfig.bg, catConfig.border, catConfig.color)}>
                                                    {catConfig.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Body — original context + correction */}
                                        <div className="px-5 py-4 space-y-3">
                                            {/* Source Sentence Quote — only shown when we have the full clause */}
                                            {m.source_sentence && (
                                                <div className="flex gap-3">
                                                    <Quote className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                                                    <p className="text-[13px] text-slate-600 leading-relaxed italic">
                                                        {m.source_sentence}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Mistake → Correction */}
                                            <div className={cn("flex items-start gap-3", m.source_sentence && "ml-7")}>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-bold text-rose-500 line-through bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                                                        {m.original_context}
                                                    </span>
                                                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                                        {m.correction}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            {m.explanation && (
                                                <div className={cn("text-[11px] text-slate-500 leading-relaxed bg-slate-50/60 rounded-lg px-3 py-2 border border-slate-100/50", m.source_sentence && "ml-7")}>
                                                    <span className="font-bold text-slate-600">Why: </span>
                                                    {m.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                        Showing {paginatedMistakes.length} of {filteredMistakes.length} mistakes
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Button variant="outline" size="icon" className="p-1.5" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="p-1.5" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="p-1.5" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="p-1.5" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            <footer className="mt-auto py-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] border-t bg-white/30">
                © 2026 IELTS Lover. &nbsp; Terms · Privacy · Contact us
            </footer>
        </div>
    )
}
