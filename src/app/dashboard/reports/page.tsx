"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    type LucideIcon
} from "lucide-react"
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
            NOTIFY_MSGS.WARNING.CONFIRM_REEVALUATION.title,
            NOTIFY_MSGS.WARNING.CONFIRM_REEVALUATION.description,
            NOTIFY_MSGS.WARNING.CONFIRM_REEVALUATION.action,
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
                        notifySuccess(NOTIFY_MSGS.SUCCESS.EVALUATION_COMPLETE.title, NOTIFY_MSGS.SUCCESS.EVALUATION_COMPLETE.description, "View Report")
                        router.refresh()
                        await fetchReports()
                    } else {
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                        const billing = extractBillingError(result as any);
                        if (billing) {
                            notifyError(billing.title, billing.message, "Close")
                        } else {
                            notifyError(NOTIFY_MSGS.ERROR.EVALUATION_FAILED.title, NOTIFY_MSGS.ERROR.EVALUATION_FAILED.description, "Close", (result as any).traceId)
                        }
                    }
                } catch {
                    window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                    notifyError(NOTIFY_MSGS.ERROR.SYSTEM_ERROR.title, NOTIFY_MSGS.ERROR.SYSTEM_ERROR.description, "Close")
                } finally {
                    setReevaluatingId(null)
                    setReevalStep(0)
                }
            },
            "Cancel"
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <PulseLoader size="lg" color="primary" />
            </div>
        )
    }


    const historicalAttempts = filteredAttempts.slice(1);

    // Derived Stats
    const totalSessions = totalAttempts
    const avgScore = attempts.length > 0
        ? (attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length).toFixed(1)
        : "0.0"
    const writingCount = attempts.filter(a => a.exercises?.type?.startsWith('writing')).length
    const speakingCount = attempts.filter(a => a.exercises?.type?.startsWith('speaking')).length

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Header Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={TrendingUp}
                        label="Average Score"
                        value={avgScore}
                        subLabel="Across all tasks"
                        color="text-primary"
                        bgColor="bg-primary/5"
                    />
                    <StatCard
                        icon={History}
                        label="Total Sessions"
                        value={totalSessions.toString()}
                        subLabel="Completed attempts"
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        icon={ShieldCheck}
                        label="Skill Split"
                        value={`${writingCount}:${speakingCount}`}
                        subLabel="Writing vs Speaking"
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                    <StatCard
                        icon={Target}
                        label="Top Performance"
                        value={attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)).toFixed(1) : "0.0"}
                        subLabel="Highest band score"
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                    />
                </div>

                {/* 2. Featured Recent Report */}
                {recentAttempt && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-6 h-px bg-primary/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your Latest Performance</span>
                        </div>
                        <RecentReportCard
                            attempt={recentAttempt}
                            onReevaluate={handleReevaluate}
                            reevaluatingId={reevaluatingId}
                            reevalStep={reevalStep}
                        />
                    </div>
                )}

                {/* 3. Main Content */}
                <div className="bg-white border-none rounded-[2.5rem] p-4 lg:p-8 shadow-xl shadow-slate-200/50">

                    {/* Tabs & Filters */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-slate-50 pb-8 px-2">
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 self-start">
                            {["Reports", "Progress"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab
                                            ? "bg-white text-primary shadow-sm ring-1 ring-slate-100"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === "Reports" && (
                            <div className="flex flex-wrap items-center gap-4">
                                <FilterGroup
                                    label="Status"
                                    options={[
                                        { value: null, label: 'All' },
                                        { value: ATTEMPT_STATES.EVALUATED, label: 'Graded' },
                                        { value: ATTEMPT_STATES.SUBMITTED, label: 'Pending' }
                                    ]}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                />
                                <div className="w-px h-6 bg-slate-100 hidden sm:block" />
                                <FilterGroup
                                    label="Skill"
                                    options={[
                                        { value: null, label: 'All' },
                                        { value: 'writing', label: 'Writing' },
                                        { value: 'speaking', label: 'Speaking' }
                                    ]}
                                    value={toolFilter}
                                    onChange={setToolFilter}
                                />
                            </div>
                        )}
                    </div>

                    {activeTab === "Reports" ? (
                        <div className="space-y-8 px-2">
                            {filteredAttempts.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                    <div className="text-6xl grayscale opacity-30 mb-6 font-outfit">🐴💤</div>
                                    <h3 className="text-lg font-black text-slate-900 leading-none mb-2">No reports match your filters</h3>
                                    <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">Try adjusting your skill or status filters to see your practice history.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-6 h-px bg-slate-200" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Previous Sessions</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {historicalAttempts.map((attempt, idx) => (
                                            <div
                                                key={attempt.id}
                                                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <HistoricalReportRow
                                                    attempt={attempt}
                                                    onReevaluate={handleReevaluate}
                                                    reevaluatingId={reevaluatingId}
                                                    reevalStep={reevalStep}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Load More */}
                                    {hasMore && (
                                        <LoadMoreButton
                                            onClick={handleLoadMore}
                                            isLoading={isLoadingMore}
                                            remaining={totalAttempts - attempts.length}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-12 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-50">
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Criteria Performance</h4>
                                            <p className="text-[10px] font-medium text-slate-400">Based on your last 10 sessions</p>
                                        </div>
                                        <div className="p-2 bg-primary/5 rounded-xl text-primary">
                                            <TrendingUp size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <AnalyticsProgress label="Task Achievement" value={75} color="bg-primary" icon={Sparkles} />
                                        <AnalyticsProgress label="Coherence & Cohesion" value={60} color="bg-blue-500" icon={Activity} />
                                        <AnalyticsProgress label="Lexical Resource" value={85} color="bg-emerald-500" icon={BookOpen} />
                                        <AnalyticsProgress label="Grammatical Accuracy" value={50} color="bg-amber-500" icon={ShieldCheck} />
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Learning Momentum</h4>
                                        <div className="h-32 flex items-end justify-between px-4 pb-2 border-b border-slate-50">
                                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                <div key={i} className="w-3 rounded-full bg-slate-50 relative group">
                                                    <div
                                                        className="absolute bottom-0 w-full rounded-full bg-primary/20 group-hover:bg-primary transition-all duration-700"
                                                        style={{
                                                            height: `${h}%`,
                                                            transitionDelay: `${i * 100}ms`
                                                        }}
                                                    />
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        Band {((h / 100) * 9).toFixed(1)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7 Day Progress</div>
                                        <div className="text-xs font-black text-emerald-600">+12% Growth</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation Card */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Sparkles size={120} className="text-primary" />
                                </div>
                                <div className="relative flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl border border-white/10 shadow-lg">
                                        💡
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-2">
                                        <h3 className="text-2xl font-black font-outfit">Ready for a level up?</h3>
                                        <p className="text-slate-400 text-sm font-medium max-w-md">Our AI analyzed your recent Task 2 reports. Improving your **Coherence & Cohesion** will likely push your average score to a Band 7.5.</p>
                                    </div>
                                    <Link href="/dashboard/writing">
                                        <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-primary/20">
                                            Start Exercise <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-auto py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-50 bg-white/50">
                © 2026 IELTS LOVER &nbsp; • &nbsp; AI POWERED COACHING
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

/* Component B: The "History Area" Row */
function HistoricalReportRow({ attempt, onReevaluate, reevaluatingId, reevalStep }: ReportComponentProps) {
    const config = getBandScoreConfig(attempt.score);
    const isWriting = attempt.exercises?.type?.startsWith('writing');
    const dateObj = new Date(attempt.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="group bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-slate-200">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-outfit border shadow-sm",
                config.bg, config.border, config.color
            )}>
                {attempt.score != null ? attempt.score : "--"}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        isWriting ? "text-purple-600" : "text-blue-600"
                    )}>
                        {isWriting ? "Writing" : "Speaking"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">
                        {dateStr} · {timeStr}
                    </span>
                </div>
                <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-primary transition-colors">
                    {attempt.exercises?.title || "Exercise"}
                </h4>
            </div>

            <div className="hidden sm:flex items-center gap-4 px-4 border-l border-slate-50">
                <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Level</p>
                    <p className="text-[10px] font-black text-slate-600">{config.cefr}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Status</p>
                    <p className={cn("text-[8px] font-bold uppercase", attempt.state === "EVALUATED" ? "text-emerald-600" : "text-amber-600")}>
                        {attempt.state.toLowerCase()}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {attempt.state === "SUBMITTED" ? (
                    <Button
                        size="sm"
                        onClick={() => onReevaluate(attempt.id)}
                        disabled={reevaluatingId === attempt.id}
                        className="h-8 rounded-lg font-black uppercase tracking-widest text-[8px] bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 shadow-none"
                    >
                        {reevaluatingId === attempt.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : "Unlock"}
                    </Button>
                ) : (
                    <Link href={`/dashboard/reports/${attempt.id}`}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors"
                        >
                            <ArrowRight size={16} />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}

function DetailTag({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <Icon size={12} className="text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</span>
        </div>
    )
}

function AnalyticsProgress({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: LucideIcon }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50", color.replace('bg-', 'text-'))}>
                        <Icon size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                </div>
                <span className="text-xs font-black text-slate-900 font-outfit">{value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100/50">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", color)}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}
