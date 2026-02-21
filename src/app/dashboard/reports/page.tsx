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
    BarChart3,
    TrendingUp,
    ShieldCheck,
    History,
    Target,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getUserAttempts, reevaluateAttempt } from "@/app/actions";
import { useNotification } from "@/lib/contexts/notification-context";
import { Attempt } from "@/types";
import { PulseLoader } from "@/components/global/pulse-loader";
import { getBandScoreConfig } from "@/lib/score-utils";
import { ATTEMPT_STATES } from "@/lib/constants";

export default function ReportsPage() {
    const [activeTab, setActiveTab] = React.useState("Reports")
    const [attempts, setAttempts] = React.useState<Attempt[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [reevaluatingId, setReevaluatingId] = React.useState<string | null>(null)

    // Filters
    const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
    const [toolFilter, setToolFilter] = React.useState<string | null>(null)

    const { notifySuccess, notifyError, notifyWarning } = useNotification()
    const router = useRouter()

    const fetchReports = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getUserAttempts()
            setAttempts(data as Attempt[])
        } catch (error) {
            console.error("Failed to fetch reports:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchReports()
    }, [fetchReports])

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
            "Confirm Re-evaluation",
            "This will use 1 StarCredit to get a detailed AI report for this attempt. Do you want to proceed?",
            "Get AI Feedback",
            async () => {
                setReevaluatingId(id)
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -1 } }))

                try {
                    const result = await reevaluateAttempt(id)
                    if (result.success) {
                        notifySuccess("Evaluation Complete", "Your report has been updated with the latest AI feedback.", "View Report")
                        router.refresh()
                        await fetchReports()
                    } else {
                        window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                        notifyError("Evaluation Failed", result.reason || "Try again later", "Close")
                    }
                } catch {
                    window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: 1 } }))
                    notifyError("System Error", "Please try again later", "Close")
                } finally {
                    setReevaluatingId(null)
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

    const latestAttempt = filteredAttempts[0];
    const historicalAttempts = filteredAttempts.slice(1);

    // Derived Stats
    const totalSessions = attempts.length
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

                {/* 2. Main Content */}
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
                                <>
                                    {/* Component A: Featured Recent Report */}
                                    {latestAttempt && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-6 h-px bg-primary/20" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your Latest Performance</span>
                                            </div>
                                            <RecentReportCard
                                                attempt={latestAttempt}
                                                onReevaluate={handleReevaluate}
                                                reevaluatingId={reevaluatingId}
                                            />
                                        </div>
                                    )}

                                    {/* Component B: History List */}
                                    {historicalAttempts.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-6 h-px bg-slate-200" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Previous Sessions</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {historicalAttempts.map((attempt) => (
                                                    <HistoricalReportRow
                                                        key={attempt.id}
                                                        attempt={attempt}
                                                        onReevaluate={handleReevaluate}
                                                        reevaluatingId={reevaluatingId}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-12 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-50">
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Criteria Performance</h4>
                                        <BarChart3 className="text-primary w-5 h-5" />
                                    </div>
                                    <div className="space-y-4">
                                        <AnalyticsProgress label="Task Achievement" value={75} color="bg-primary" />
                                        <AnalyticsProgress label="Coherence & Cohesion" value={60} color="bg-blue-500" />
                                        <AnalyticsProgress label="Lexical Resource" value={85} color="bg-emerald-500" />
                                        <AnalyticsProgress label="Grammatical Accuracy" value={50} color="bg-amber-500" />
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Learning Momentum</h4>
                                        <div className="h-32 flex items-end justify-between px-4 pb-2 border-b border-slate-50">
                                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                <div key={i} className="w-3 rounded-full bg-slate-100 relative group">
                                                    <div
                                                        className="absolute bottom-0 w-full rounded-full bg-primary/20 group-hover:bg-primary transition-all duration-500"
                                                        style={{ height: `${h}%` }}
                                                    />
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
            <div className="space-y-0.5">
                <div className="text-2xl font-black font-outfit text-slate-900">{value}</div>
                <div className="text-[10px] font-medium text-slate-400">{subLabel}</div>
            </div>
        </div>
    )
}

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

/* Component A: The "Featured" Card */
interface ReportComponentProps {
    attempt: Attempt;
    onReevaluate: (id: string) => void;
    reevaluatingId: string | null;
}

function RecentReportCard({ attempt, onReevaluate, reevaluatingId }: ReportComponentProps) {
    const config = getBandScoreConfig(attempt.score);
    const dateStr = new Date(attempt.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const isWriting = attempt.exercises?.type?.startsWith('writing');

    return (
        <div className="group relative overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <FileText size={180} />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-10">
                {/* Score Orb */}
                <div className={cn(
                    "w-32 h-32 rounded-[2.5rem] flex flex-col items-center justify-center border-4 transition-transform group-hover:scale-105 duration-500 shadow-lg",
                    config.bg, config.border, config.color
                )}>
                    <span className="text-4xl font-black font-outfit leading-none mb-1">{attempt.score || "--"}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Band Score</span>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                                isWriting ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {isWriting ? "✍️ Writing" : "🎤 Speaking"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                            {attempt.exercises?.title || "IELTS Practice Session"}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <DetailTag icon={Activity} label={attempt.exercises?.type?.replace('_', ' ') || "Practice"} />
                        <DetailTag icon={Target} label={`CEFR ${config.cefr}`} />
                        <DetailTag icon={Clock} label={new Date(attempt.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[160px]">
                    {attempt.state === "SUBMITTED" ? (
                        <Button
                            onClick={() => onReevaluate(attempt.id)}
                            disabled={reevaluatingId === attempt.id}
                            className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-primary/20"
                        >
                            {reevaluatingId === attempt.id ? "Analyzing..." : "Get AI Feedback"}
                        </Button>
                    ) : (
                        <Link href={`/dashboard/reports/${attempt.id}`}>
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl shadow-xl shadow-slate-200">
                                Full Report <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

/* Component B: The "History Area" Row */
function HistoricalReportRow({ attempt, onReevaluate, reevaluatingId }: ReportComponentProps) {
    const config = getBandScoreConfig(attempt.score);
    const isWriting = attempt.exercises?.type?.startsWith('writing');

    return (
        <div className="group bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-slate-200">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-outfit border shadow-sm",
                config.bg, config.border, config.color
            )}>
                {attempt.score || "--"}
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
                        {new Date(attempt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                        {reevaluatingId === attempt.id ? "..." : "Unlock"}
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

function AnalyticsProgress({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-900">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
            </div>
        </div>
    )
}
