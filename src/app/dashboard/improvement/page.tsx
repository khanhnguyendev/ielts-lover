"use client"

import * as React from "react"
import { getMistakeDashboardData, generateWeaknessAnalysis, getFeaturePrice } from "@/app/actions"
import { SKILL_TYPES, FEATURE_KEYS, SkillType } from "@/lib/constants"
import { UserMistake, UserActionPlan } from "@/repositories/interfaces"
import { Button } from "@/components/ui/button"
import { CreditBadge } from "@/components/ui/credit-badge"
import { useNotification } from "@/lib/contexts/notification-context"
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
    Lightbulb
} from "lucide-react"
import { PulseLoader } from "@/components/global/pulse-loader"


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
        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -analysisCost } }))

        try {
            const result = await generateWeaknessAnalysis()
            if (result.success && result.data) {
                setLatestPlan(result.data)
            } else {
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: analysisCost } }))
                notifyError("Analysis Failed", result.error === "INSUFFICIENT_CREDITS" ? "Insufficient Credits" : "Please try again later")
            }
        } catch {
            window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: analysisCost } }))
            notifyError("Unexpected Error", "Something went wrong.")
        } finally {
            setIsGenerating(false)
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
            <div className="flex items-center justify-center min-h-screen">
                <PulseLoader size="lg" color="primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Mistake Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={History}
                        label="Total Mistakes"
                        value={totalCount.toString()}
                        subLabel="Recorded patterns"
                        color="text-slate-900"
                        bgColor="bg-slate-50"
                    />
                    <StatCard
                        icon={ShieldAlert}
                        label="Grammar"
                        value={categoryStats.grammar?.toString() || "0"}
                        subLabel="Critical issues"
                        color="text-rose-600"
                        bgColor="bg-rose-50"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Vocabulary"
                        value={categoryStats.vocabulary?.toString() || "0"}
                        subLabel="Lexical resource"
                        color="text-indigo-600"
                        bgColor="bg-indigo-50"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Ready to Level"
                        value={totalCount > 10 ? "75%" : "20%"}
                        subLabel="Improvement score"
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                </div>

                {/* 2. AI Analyzer Magical Box */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-6 lg:p-10 shadow-2xl shadow-slate-900/20 group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-125 transition-transform duration-1000">
                        <Brain size={250} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-8 border-b border-white/10">
                        <div className="space-y-3 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-[1.5rem] border border-primary/20 backdrop-blur-xl shadow-lg shadow-primary/10">
                                    <Brain className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-white">AI Weakness Analyzer</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">System Active: Deep Scanning</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm max-w-md font-medium">Discover deep patterns in your mistakes and get a personalized action plan to hit your target band score.</p>
                        </div>

                        <Button
                            onClick={handleGenerateAnalysis}
                            disabled={isGenerating}
                            className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-16 px-10 rounded-2xl shadow-xl shadow-primary/30 group/btn transition-all hover:-translate-y-1 active:scale-95"
                        >
                            {isGenerating ? "Analyzing Patterns..." : (latestPlan ? "Refresh Deep Analysis" : "Generate Deep Analysis")}
                            <CreditBadge amount={-analysisCost} size="sm" className="ml-4 border-white/20 bg-white/10" />
                        </Button>
                    </div>

                    {latestPlan ? (
                        <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                            {/* Summary Glass */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex gap-4">
                                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <p className="text-base font-medium leading-relaxed text-slate-200">{latestPlan.plan_data.summary}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{latestPlan.mistakes_analyzed} patterns detected</p>
                                </div>
                            </div>

                            {/* Weakness Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {latestPlan.plan_data.top_weaknesses.map((w, i) => {
                                    const severity = SEVERITY_CONFIG[w.severity] || SEVERITY_CONFIG.medium
                                    return (
                                        <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:bg-white/[0.08] transition-colors group/card">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest", severity.bg, severity.color)}>
                                                    {severity.label} Priority
                                                </div>
                                                <div className="text-[10px] font-black text-slate-500 opacity-60 group-hover/card:opacity-100 transition-opacity">
                                                    {w.frequency}x Observed
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-100 leading-relaxed">{w.description}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Action Items */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">High-Impact Roadmap</span>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase">Immediate corrections for Band {targetScore.toFixed(1)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {latestPlan.plan_data.action_items.map((item, i) => (
                                        <div key={i} className="group/action relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-7 rounded-[2.5rem] hover:bg-white/[0.08] transition-all hover:border-primary/30 hover:-translate-y-1 shadow-sm">
                                            <div className="flex gap-6">
                                                <div className="w-14 h-14 bg-primary/20 rounded-[1.5rem] flex flex-col items-center justify-center text-primary shrink-0 border border-primary/20 shadow-lg shadow-primary/10 transition-transform group-hover/action:scale-110">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-60">Step</span>
                                                    <span className="text-xl font-black leading-none">0{item.priority}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-base font-black text-white group-hover/action:text-primary transition-colors">{item.title}</h4>
                                                    <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2 group-hover/action:line-clamp-none transition-all">{item.description}</p>

                                                    {item.examples.length > 0 && (
                                                        <div className="pt-3 border-t border-white/5 space-y-2">
                                                            {item.examples.slice(0, 1).map((ex, j) => (
                                                                <div key={j} className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-rose-500/10 text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/20">
                                                                        <span className="opacity-60 line-through">{ex.wrong}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                                                        <span>{ex.correct}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center animate-in zoom-in-95 duration-1000">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-white/10 shadow-inner">
                                🔍
                            </div>
                            <h3 className="text-xl font-black font-outfit mb-2">Analyzing your progress...</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">Generate a deep analysis to see exactly what&apos;s holding you back from a Band {targetScore.toFixed(1)}.</p>
                        </div>
                    )}
                </div>

                {/* 3. Mistake Ledger */}
                <div className="bg-white rounded-[2.5rem] p-4 lg:p-8 shadow-xl shadow-slate-200/50 space-y-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 px-2">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black font-outfit text-slate-900 leading-none">Mistake Ledger</h2>
                            <p className="text-xs font-medium text-slate-500">{totalCount} recorded patterns in your history</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <FilterGroup
                                label="Skill"
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
                        <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                            <div className="text-6xl opacity-30 mb-6 grayscale font-outfit">💎✨</div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Clean Ledger!</h3>
                            <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">No mistakes match your filters. Keep practicing to build your intelligence bank.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 px-2">
                            {paginatedMistakes.map((m) => (
                                <MistakeRow key={m.id} mistake={m} />
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Showing {paginatedMistakes.length} of {filteredMistakes.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <PaginationButton
                                            icon={ChevronLeft}
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        />
                                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-900 border border-slate-100 shadow-sm">
                                            {currentPage} / {totalPages}
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

            <footer className="mt-auto py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-50 bg-white/50">
                © 2026 IELTS LOVER &nbsp; • &nbsp; LEARNING INTELLIGENCE
            </footer>
        </div>
    )
}

/* Redesigned Sub-Components */

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    subLabel: string;
    color: string;
    bgColor: string;
}

function StatCard({ icon: Icon, label, value, subLabel, color, bgColor }: StatCardProps) {
    return (
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3">
                <div className={cn("p-2 rounded-xl", bgColor, color)}>
                    <Icon size={18} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {label}
                </div>
            </div>
            <div className="space-y-0.5" >
                <div className="text-2xl font-black font-outfit text-slate-900">{value}</div>
                <div className="text-[10px] font-medium text-slate-400">{subLabel}</div>
            </div>
        </div>
    )
}

function MistakeRow({ mistake: m }: { mistake: UserMistake }) {
    const config = CATEGORY_CONFIG[m.error_category] || CATEGORY_CONFIG.grammar
    const isWriting = m.skill_type === 'writing'

    return (
        <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 lg:p-8 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white transition-transform group-hover:scale-110 group-hover:rotate-3",
                        isWriting ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                    )}>
                        {isWriting ? "✍️" : "🎤"}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", config.bg, config.color, config.border)}>
                                {config.label}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                {isWriting ? "Writing" : "Speaking"}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            {new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5">
                        View Context <ArrowRight size={12} className="ml-2" />
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {m.source_sentence && (
                    <div className="relative pl-8 border-l-2 border-slate-100 py-1">
                        <Quote size={20} className="absolute -left-3 -top-2 text-slate-100 fill-slate-100" />
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">&quot;{m.source_sentence}&quot;</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50 relative overflow-hidden group/box">
                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <span className="text-[8px] text-rose-500 font-black">X</span>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400">Inefficient Pattern</p>
                        </div>
                        <p className="text-base font-black text-rose-600 line-through decoration-rose-600/30 font-outfit">{m.original_context}</p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center gap-2 py-4 md:py-0">
                        <div className="w-10 h-10 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center ring-1 ring-slate-100 transition-transform group-hover/box:rotate-90">
                            <ArrowRight size={16} className="text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 size={10} className="text-emerald-500" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">IELTS Recommendation</p>
                        </div>
                        <p className="text-base font-black text-emerald-600 font-outfit">{m.correction}</p>
                    </div>
                </div>

                {m.explanation && (
                    <div className="flex gap-4 p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/30 hover:bg-indigo-50/50 transition-colors">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                            <Lightbulb size={20} />
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Coach Insight & Strategy</h5>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">{m.explanation}</p>
                        </div>
                    </div>
                )}
            </div>
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
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                            value === opt.value
                                ? "bg-white text-slate-900 shadow-sm shadow-slate-200 ring-1 ring-slate-100"
                                : "text-slate-400 hover:text-slate-600"
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
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 transition-all shadow-sm active:scale-95"
        >
            <Icon size={16} />
        </button>
    )
}

