"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronRight,
    Sparkles,
    Clock,
    FileText,
    Activity,
    TrendingUp,
    ShieldCheck,
    History,
    Target,
    ArrowRight,
    BookOpen,
    Loader2,
    BarChart3,
    PieChart,
    Search,
    type LucideIcon
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    Cell
} from 'recharts'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getUserAttemptsPaginated, getMostRecentAttempt, reevaluateAttempt } from "@/app/actions";
import { useNotification } from "@/lib/contexts/notification-context";
import { Attempt } from "@/types";
import { PulseLoader } from "@/components/global/pulse-loader";
import { LoadMoreButton } from "@/components/global/load-more-button";
import { getBandScoreConfig } from "@/lib/score-utils";
import { ATTEMPT_STATES } from "@/lib/constants";
import { extractBillingError } from "@/lib/billing-errors";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentReportCard, ReportComponentProps } from "@/components/dashboard/recent-report-card";
import { NOTIFY_MSGS } from "@/lib/constants/messages";

export default function ReportsPage() {
    const [activeTab, setActiveTab] = React.useState("Reports")
    const [attempts, setAttempts] = React.useState<Attempt[]>([])
    const [totalAttempts, setTotalAttempts] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isLoadingMore, setIsLoadingMore] = React.useState(false)
    const [reevaluatingId, setReevaluatingId] = React.useState<string | null>(null)
    const [reevalStep, setReevalStep] = React.useState(0)
    const [recentAttempt, setRecentAttempt] = React.useState<Attempt | null>(null)

    const PAGE_SIZE = 5

    // Filters
    const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
    const [toolFilter, setToolFilter] = React.useState<string | null>(null)

    const { notifySuccess, notifyError, notifyWarning } = useNotification()
    const router = useRouter()

    const fetchReports = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [result, recent] = await Promise.all([
                getUserAttemptsPaginated(PAGE_SIZE, 0),
                getMostRecentAttempt()
            ])
            setAttempts(result.data as Attempt[])
            setTotalAttempts(result.total)
            setRecentAttempt(recent as Attempt | null)
        } catch (error) {
            console.error("Failed to fetch reports:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchReports()
    }, [fetchReports])

    const handleLoadMore = async () => {
        setIsLoadingMore(true)
        try {
            const result = await getUserAttemptsPaginated(PAGE_SIZE, attempts.length)
            setAttempts(prev => [...prev, ...(result.data as Attempt[])])
            setTotalAttempts(result.total)
        } catch (error) {
            console.error("Failed to load more reports:", error)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const hasMore = attempts.length < totalAttempts

    // Filter Logic
    const filteredAttempts = React.useMemo(() => {
        return attempts.filter(attempt => {
            if (statusFilter && attempt.state !== statusFilter) return false
            if (toolFilter) {
                const type = attempt.exercises?.type || ""
                if (toolFilter === "writing" && !type.startsWith("writing")) return false
                if (toolFilter === "speaking" && !type.startsWith("speaking")) return false
            }
            return true
        })
    }, [attempts, statusFilter, toolFilter])

    const handleReevaluate = async (id: string) => {
        notifyWarning(
            NOTIFY_MSGS.WARNING.CONFIRM_REEVALUATION?.title || "Re-evaluate Attempt?",
            NOTIFY_MSGS.WARNING.CONFIRM_REEVALUATION?.description || "This will consume 1 credit.",
            NOTIFY_MSGS.WARNING.CONFIRM_REEVALUATION?.action || "Re-evaluate",
            async () => {
                setReevaluatingId(id)
                setReevalStep(1)
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -1 } }))

                const t1 = setTimeout(() => setReevalStep(2), 2000)
                const t2 = setTimeout(() => setReevalStep(3), 4500)

                try {
                    const result = await reevaluateAttempt(id)
                    clearTimeout(t1)
                    clearTimeout(t2)
                    if (result.success) {
                        notifySuccess(NOTIFY_MSGS.SUCCESS.EVALUATION_COMPLETE?.title || "Success", NOTIFY_MSGS.SUCCESS.EVALUATION_COMPLETE?.description || "Evaluation complete.", "View Report")
                        router.refresh()
                        await fetchReports()
                    } else {
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                        const billing = extractBillingError(result as any);
                        if (billing) {
                            notifyError(billing.title, billing.message, "Close")
                        } else {
                            notifyError(NOTIFY_MSGS.ERROR.EVALUATION_FAILED?.title || "Error", NOTIFY_MSGS.ERROR.EVALUATION_FAILED?.description || "Evaluation failed.", "Close", (result as any).traceId)
                        }
                    }
                } catch {
                    window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                    notifyError(NOTIFY_MSGS.ERROR.SYSTEM_ERROR?.title || "System Error", NOTIFY_MSGS.ERROR.SYSTEM_ERROR?.description || "A system error occurred.", "Close")
                } finally {
                    setReevaluatingId(null)
                    setReevalStep(0)
                }
            },
            "Cancel"
        )
    }

    // Prepare chart data
    const scoreTrendData = React.useMemo(() => {
        return attempts
            .filter(a => a.score != null)
            .slice(0, 10)
            .reverse()
            .map(a => ({
                date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: a.score
            }))
    }, [attempts])

    const radarData = [
        { subject: 'Task Achievement', A: 75, fullMark: 100 },
        { subject: 'Coherence', A: 60, fullMark: 100 },
        { subject: 'Lexical', A: 85, fullMark: 100 },
        { subject: 'Grammar', A: 50, fullMark: 100 },
        { subject: 'Pronunciation', A: 70, fullMark: 100 },
    ]

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50/30 dark:bg-slate-950/30">
                <PulseLoader size="lg" color="primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 animate-pulse">Assembling Intelligence Hub...</p>
            </div>
        )
    }

    const historicalAttempts = filteredAttempts.slice(1);
    const totalSessions = totalAttempts
    const avgScore = attempts.length > 0
        ? (attempts.filter(a => a.score != null).reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.filter(a => a.score != null).length || 0).toFixed(1)
        : "0.0"
    const writingCount = attempts.filter(a => a.exercises?.type?.startsWith('writing')).length
    const speakingCount = attempts.filter(a => a.exercises?.type?.startsWith('speaking')).length

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* 1. Header & Quick View */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary rounded-2xl text-white shadow-2xl shadow-primary/30">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Intelligence Hub</h1>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Deep Analytics & Practice History</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/20 dark:border-slate-800/50 shadow-sm">
                        {["Reports", "Progress"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                    activeTab === tab
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard
                        index={0}
                        icon={TrendingUp}
                        label="Average Score"
                        value={avgScore}
                        subLabel="Mastery Index"
                        color="text-primary"
                        bgColor="bg-primary/5"
                    />
                    <StatCard
                        index={1}
                        icon={History}
                        label="Exercises"
                        value={totalSessions.toString()}
                        subLabel="Total Practice"
                        color="text-indigo-600"
                        bgColor="bg-indigo-100/50"
                    />
                    <StatCard
                        index={2}
                        icon={ShieldCheck}
                        label="Skill Balance"
                        value={`${writingCount}:${speakingCount}`}
                        subLabel="W : S Distribution"
                        color="text-emerald-600"
                        bgColor="bg-emerald-100/50"
                    />
                    <StatCard
                        index={3}
                        icon={Target}
                        label="Peak Score"
                        value={attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)).toFixed(1) : "0.0"}
                        subLabel="Personal Best"
                        color="text-amber-600"
                        bgColor="bg-amber-100/50"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "Reports" ? (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-10"
                        >
                            {/* Featured Latest */}
                            {recentAttempt && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 pl-2">
                                        <Sparkles size={18} className="text-primary" />
                                        <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Latest Intelligence Report</h2>
                                    </div>
                                    <RecentReportCard
                                        attempt={recentAttempt}
                                        onReevaluate={handleReevaluate}
                                        reevaluatingId={reevaluatingId}
                                        reevalStep={reevalStep}
                                    />
                                </div>
                            )}

                            {/* Filters & List Area */}
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-4 lg:p-10 shadow-2xl border border-white/20 dark:border-slate-800/50">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-6">
                                        <FilterGroup
                                            label="Status"
                                            options={[
                                                { value: null, label: 'All' },
                                                { value: ATTEMPT_STATES.EVALUATED, label: 'Graded' },
                                                { value: ATTEMPT_STATES.SUBMITTED, label: 'Analysis' }
                                            ]}
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                        />
                                        <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 hidden sm:block" />
                                        <FilterGroup
                                            label="Field"
                                            options={[
                                                { value: null, label: 'All' },
                                                { value: 'writing', label: 'Writing' },
                                                { value: 'speaking', label: 'Speaking' }
                                            ]}
                                            value={toolFilter}
                                            onChange={setToolFilter}
                                        />
                                    </div>

                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
                                        {totalAttempts} Total Sessions Cataloged
                                    </div>
                                </div>

                                {filteredAttempts.length === 0 ? (
                                    <div className="text-center py-32 space-y-8">
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
                                            <Search size={40} className="text-slate-200 dark:text-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">Intelligence data not found</h3>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Adjust filters or begin a new practice session.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pl-2 mb-6">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Archive Retrieval</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {historicalAttempts.map((attempt, idx) => (
                                                <motion.div
                                                    key={attempt.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                >
                                                    <HistoricalReportRow
                                                        attempt={attempt}
                                                        onReevaluate={handleReevaluate}
                                                        reevaluatingId={reevaluatingId}
                                                        reevalStep={reevalStep}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>

                                        {hasMore && (
                                            <div className="pt-8">
                                                <LoadMoreButton
                                                    onClick={handleLoadMore}
                                                    isLoading={isLoadingMore}
                                                    remaining={totalAttempts - attempts.length}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            {/* Data Visualization Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Band Score Trend */}
                                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/20 dark:border-slate-800/50 shadow-2xl">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-black uppercase tracking-widest text-slate-800 dark:text-white">Band Mastery Trend</h4>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest pt-1">Velocity Tracking</p>
                                        </div>
                                        <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={scoreTrendData}>
                                                <defs>
                                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    domain={[0, 9]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '1.5rem',
                                                        border: 'none',
                                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                        fontSize: '10px',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth={4}
                                                    fillOpacity={1}
                                                    fill="url(#colorScore)"
                                                    animationDuration={2000}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Skill Balance Radar */}
                                <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16" />
                                    <div className="relative z-10 space-y-8">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-black uppercase tracking-widest text-white">Skill Topology</h4>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Dimension Analysis</p>
                                        </div>
                                        <div className="h-[250px] w-full mt-4 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                    <PolarGrid stroke="#334155" />
                                                    <PolarAngleAxis
                                                        dataKey="subject"
                                                        tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }}
                                                    />
                                                    <Radar
                                                        name="Performance"
                                                        dataKey="A"
                                                        stroke="hsl(var(--primary))"
                                                        fill="hsl(var(--primary))"
                                                        fillOpacity={0.5}
                                                        animationDuration={2500}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stability Index</div>
                                            <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">High (82%)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Criterion Specific Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/20 dark:border-slate-800/50 shadow-2xl space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-black uppercase tracking-widest text-slate-800 dark:text-white">Criterion Distribution</h4>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Writing & Speaking Balance</p>
                                        </div>
                                        <PieChart size={20} className="text-indigo-500" />
                                    </div>
                                    <div className="space-y-6">
                                        <AnalyticsProgress label="Task Achievement" value={75} color="bg-primary" icon={Sparkles} />
                                        <AnalyticsProgress label="Coherence & Cohesion" value={60} color="bg-blue-500" icon={Activity} />
                                        <AnalyticsProgress label="Lexical Resource" value={85} color="bg-emerald-500" icon={BookOpen} />
                                        <AnalyticsProgress label="Grammatical Accuracy" value={50} color="bg-amber-500" icon={ShieldCheck} />
                                    </div>
                                </div>

                                <div className="bg-primary rounded-[3rem] p-10 text-white relative overflow-hidden group flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                        <Sparkles size={160} className="text-white" />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-lg mb-8">
                                            🧠
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black font-outfit tracking-tighter leading-tight">Your AI Insight</h3>
                                            <p className="text-white/70 text-base font-bold leading-relaxed max-w-sm">
                                                Based on your last 10 sessions, focusing on **Lexical Resource** variety in Task 2 will likely unlock a Band 8.0 trajectory.
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/dashboard/writing" className="relative z-10 pt-10">
                                        <Button className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
                                            Target Next Practice <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="mt-auto py-10 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                © 2026 IELTS LOVER INTELLIGENCE &nbsp; • &nbsp; DATA SHAPED EXCELLENCE
            </footer>
        </div>
    )
}

/* Redesigned Sub-Components */

interface FilterGroupProps {
    label: string;
    options: { value: string | null; label: string }[];
    value: string | null;
    onChange: (val: string | null) => void;
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
                            "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-500",
                            value === opt.value
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
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

function HistoricalReportRow({ attempt, onReevaluate, reevaluatingId, reevalStep }: ReportComponentProps) {
    const config = getBandScoreConfig(attempt.score);
    const isWriting = attempt.exercises?.type?.startsWith('writing');
    const dateObj = new Date(attempt.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="group bg-white/50 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50 rounded-3xl p-5 flex items-center gap-6 transition-all duration-500 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-primary/20 group relative overflow-hidden">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black font-outfit border-2 shadow-lg transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 shrink-0 relative z-10",
                config.bg, config.border, config.color
            )}>
                {attempt.score != null ? attempt.score : "--"}
            </div>

            <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        isWriting ? "bg-purple-100/50 text-purple-600" : "bg-blue-100/50 text-blue-600"
                    )}>
                        {isWriting ? "Writing Lab" : "Speaking Lab"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={10} className="text-slate-300" />
                        {dateStr} · {timeStr}
                    </span>
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors leading-tight">
                    {attempt.exercises?.title || "IELTS Practice Session"}
                </h4>
            </div>

            <div className="hidden sm:flex items-center gap-8 px-8 border-l border-slate-100 dark:border-slate-800 z-10">
                <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mastery</p>
                    <p className="text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-tighter">{config.cefr}</p>
                </div>
                <div className="text-right space-y-0.5 min-w-[60px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</p>
                    <div className="flex items-center justify-end gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", attempt.state === "EVALUATED" ? "bg-emerald-500" : "bg-amber-500")} />
                        <p className={cn("text-[9px] font-black uppercase tracking-widest", attempt.state === "EVALUATED" ? "text-emerald-600" : "text-amber-600")}>
                            {attempt.state === "EVALUATED" ? "Ready" : "Pending"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 z-10">
                {attempt.state === "SUBMITTED" ? (
                    <Button
                        size="sm"
                        onClick={() => onReevaluate(attempt.id)}
                        disabled={reevaluatingId === attempt.id}
                        className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        {reevaluatingId === attempt.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles size={12} /> Unlock
                            </span>
                        )}
                    </Button>
                ) : (
                    <Link href={`/dashboard/reports/${attempt.id}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10 rounded-xl hover:bg-primary/10 text-slate-300 hover:text-primary transition-all duration-500 hover:rotate-[360deg]"
                        >
                            <ArrowRight size={20} />
                        </Button>
                    </Link>
                )}
            </div>

            {/* Subtle background glow on hover */}
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>
    )
}

function AnalyticsProgress({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: LucideIcon }) {
    return (
        <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50", color.replace('bg-', 'text-'))}>
                        <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-black text-slate-900 dark:text-white font-outfit leading-none">{value}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">%</span>
                </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-lg transition-all duration-1000", color)}
                />
            </div>
        </div>
    )
}
