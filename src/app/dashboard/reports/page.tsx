"use client"

import * as React from "react"
import Link from "next/link"
import {
    ChevronDown,
    Search,
    Globe,
    ArrowUpDown,
    Mic2,
    CheckCircle2,
    Video,
    PenTool,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Sparkles,
    Info,
    Calendar,
    Clock,
    FileText,
    Activity,
    BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { getUserAttempts, reevaluateAttempt } from "@/app/actions";
import { useNotification } from "@/lib/contexts/notification-context";
import { Attempt } from "@/types";
import { PulseLoader } from "@/components/global/PulseLoader";
import { getBandScoreConfig } from "@/lib/score-utils";

export default function ReportsPage() {
    const [activeTab, setActiveTab] = React.useState("Reports")
    const [attempts, setAttempts] = React.useState<Attempt[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [reevaluatingId, setReevaluatingId] = React.useState<string | null>(null)
    const { notifySuccess, notifyError, notifyWarning } = useNotification()

    const fetchReports = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getUserAttempts()
            setAttempts(data as any)
        } catch (error) {
            console.error("Failed to fetch reports:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchReports()
    }, [fetchReports])

    const handleReevaluate = async (id: string) => {
        setReevaluatingId(id)
        try {
            const result = await reevaluateAttempt(id)
            if (result.success) {
                notifySuccess(
                    "Evaluation Complete",
                    "Your report has been updated with the latest AI feedback. You can now view your score and detailed analysis.",
                    "View Report"
                )
                await fetchReports()
            } else {
                if (result.reason === "DAILY_LIMIT_REACHED") {
                    notifyWarning(
                        "Daily Limit Reached",
                        "You have reached your daily AI evaluation limit. Please try again tomorrow or upgrade to Premium for unlimited access.",
                        "Upgrade Now"
                    )
                } else {
                    notifyError(
                        "Evaluation Failed",
                        "We encountered an error while processing your request. Please try again in a few moments.",
                        "Try Again"
                    )
                }
            }
        } catch (error) {
            console.error("Re-evaluation failed:", error)
            notifyError(
                "System Error",
                "An unexpected error occurred. Please contact support if the issue persists.",
                "Close"
            )
        } finally {
            setReevaluatingId(null)
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">

            <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {/* Tabs */}
                <div className="flex bg-[#F9FAFB] p-1.5 m-6 rounded-2xl w-fit border border-slate-100">
                    {["Reports", "Progress"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === tab
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === "Reports" ? (
                    <>
                        {/* Filters */}
                        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs font-bold border-muted-foreground/20">
                                    <span className="mr-2 text-muted-foreground">+</span> Status
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs font-bold border-muted-foreground/20">
                                    <span className="mr-2 text-muted-foreground">+</span> Tool
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border">
                                    <Globe className="h-3.5 w-3.5" />
                                    Feedback Language
                                    <span className="text-foreground font-bold">English</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1">
                            <Table>
                                <TableHeader className="bg-[#F9FAFB]">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="w-[200px] py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-10">
                                            <div className="flex items-center gap-1 cursor-pointer group">
                                                Time <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <div className="flex items-center gap-1 cursor-pointer group">
                                                Task <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <div className="flex items-center gap-1 cursor-pointer group">
                                                Status <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <div className="flex items-center gap-1 cursor-pointer group">
                                                Score <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right pr-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <PulseLoader size="lg" color="primary" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing reports...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : attempts.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10">No reports found.</TableCell></TableRow>
                                    ) : (
                                        attempts.map((attempt) => (
                                            <TableRow key={attempt.id} className="group hover:bg-slate-50/50 border-slate-50/50 transition-colors">
                                                <TableCell className="py-6 pl-10">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            {new Date(attempt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {new Date(attempt.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                            attempt.exercises?.type?.startsWith('speaking')
                                                                ? "bg-cyan-50 border-cyan-100 text-cyan-600"
                                                                : "bg-indigo-50 border-indigo-100 text-indigo-600"
                                                        )}>
                                                            {attempt.exercises?.type?.startsWith('speaking') ? <Mic2 className="h-5 w-5" /> : <PenTool className="h-5 w-5" />}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[13px] font-black text-slate-900 leading-none group-hover:text-primary transition-colors">
                                                                {attempt.exercises?.title || "Exercise"}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                {attempt.exercises?.type?.replace('_', ' ') || "Practice"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className={cn(
                                                        "w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm",
                                                        attempt.state === "EVALUATED"
                                                            ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                                                            : "text-amber-700 bg-amber-50 border-amber-100"
                                                    )}>
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                                            attempt.state === "EVALUATED" ? "bg-emerald-500" : "bg-amber-500"
                                                        )} />
                                                        {attempt.state}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {(() => {
                                                        const config = getBandScoreConfig(attempt.score);
                                                        return (
                                                            <div className={cn(
                                                                "w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black border transition-all shadow-sm",
                                                                config.bg,
                                                                config.border,
                                                                config.color
                                                            )}>
                                                                <span className="text-sm leading-none">{attempt.score || "-"}</span>
                                                                <span className="text-[8px] uppercase tracking-tighter opacity-60">{config.cefr}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell className="py-6 text-right pr-10">
                                                    {attempt.state === "SUBMITTED" ? (
                                                        <Button
                                                            onClick={() => handleReevaluate(attempt.id)}
                                                            disabled={reevaluatingId === attempt.id}
                                                            className="h-9 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm active:scale-95 border-none"
                                                        >
                                                            {reevaluatingId === attempt.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                                    Evaluating...
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    Get AI Feedback <Sparkles className="ml-1.5 h-3 w-3 fill-primary" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Link href={`/dashboard/reports/${attempt.id}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-95"
                                                            >
                                                                View Report <ChevronRight className="ml-1.5 h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="px-10 py-6 flex items-center justify-between border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rows per page</span>
                                <div className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:border-primary transition-all">
                                    20 <ChevronDown className="h-3 w-3" />
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Page 1 of 1</span>
                                <div className="flex items-center gap-2">
                                    <PaginationButton icon={ChevronsLeft} disabled />
                                    <PaginationButton icon={ChevronLeft} disabled />
                                    <PaginationButton icon={ChevronRight} disabled />
                                    <PaginationButton icon={ChevronsRight} disabled />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-10 space-y-10 bg-[#F9FAFB]">
                        {/* Summary Stats Row */}
                        <div className="bg-white rounded-[32px] border p-8 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-10">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Mock Test</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-muted-foreground/60">— sessions</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-slate-100" />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Latest</h4>
                                    <div className="text-2xl font-black font-outfit text-slate-500">—</div>
                                </div>
                                <div className="w-px h-10 bg-slate-100" />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-1">
                                        Avg <Info className="h-3 w-3" />
                                    </h4>
                                    <div className="text-2xl font-black font-outfit text-slate-500">—</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Target</h4>
                                <div className="text-2xl font-black font-outfit text-primary">7.5</div>
                            </div>
                        </div>

                        {/* Task Specific Boxes */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-[32px] border p-8 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900">Academic Task 1</h4>
                                    <span className="text-[10px] font-black text-muted-foreground/60">0 attempts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Latest</p>
                                        <p className="text-xl font-black font-outfit text-slate-500">—</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                            Avg <Info className="h-3 w-3" />
                                        </p>
                                        <p className="text-xl font-black font-outfit text-slate-500">—</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary pt-4 border-t border-dashed rounded-none h-auto">
                                    Show details <ChevronDown className="ml-2 h-3 w-3" />
                                </Button>
                            </div>

                            <div className="bg-white rounded-[32px] border p-8 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900">Task 2</h4>
                                    <span className="text-[10px] font-black text-muted-foreground/60">0 attempts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Latest</p>
                                        <p className="text-xl font-black font-outfit text-slate-500">—</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                            Avg <Info className="h-3 w-3" />
                                        </p>
                                        <p className="text-xl font-black font-outfit text-slate-500">—</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary pt-4 border-t border-dashed rounded-none h-auto">
                                    Show details <ChevronDown className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Next Step Card */}
                        <div className="bg-[#FAF9FF] border border-primary/10 rounded-[32px] p-8 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border shadow-sm">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black font-outfit text-slate-900">Your Next Step to a Higher Band</h4>
                                    <p className="text-sm font-medium text-muted-foreground">Complete your first practice to learn the one skill you need to improve for a higher band.</p>
                                </div>
                            </div>
                            <Button variant="premium" size="lg">
                                Start Writing
                            </Button>
                        </div>

                        {/* Chart Placeholder */}
                        <div className="bg-white rounded-[32px] border p-10 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black font-outfit text-slate-900">Progress over time</h4>
                                    <p className="text-xs font-medium text-muted-foreground">Shows only the latest score for each day</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold border-muted-foreground/10">
                                        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                    </Button>
                                    <span className="text-xs font-black text-slate-500">Feb 9 - Feb 15, 2026</span>
                                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold border-muted-foreground/10">
                                        Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>

                            <div className="h-[200px] flex items-end justify-between px-10 relative">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between py-2 border-b border-slate-100 pointer-events-none">
                                    {[9, 6, 3, 0].map(val => (
                                        <div key={val} className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-500 w-4">{val}</span>
                                            <div className="flex-1 h-px bg-slate-50 relative">
                                                {val === 6 && <div className="absolute inset-0 border-t border-dashed border-slate-300" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Days */}
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                    <div key={day} className="flex flex-col items-center gap-4 relative z-10 w-full">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center">
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{day}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-primary/20" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mock Test</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-indigo-200" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Academic Task 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-orange-200" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Task 2</span>
                                </div>
                            </div>
                        </div>

                        {/* Criteria Breakdown */}
                        <div className="space-y-8">
                            <h4 className="text-xl font-black font-outfit text-slate-900">Criteria Performance</h4>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: "Task Achievement", color: "bg-cyan-500" },
                                    { label: "Coherence and Cohesion", color: "bg-emerald-500" },
                                    { label: "Lexical Resource", color: "bg-amber-500" },
                                    { label: "Grammatical Range and accuracy", color: "bg-rose-500" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white border rounded-[32px] p-8 space-y-6 shadow-sm group hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-3 h-3 rounded-full", stat.color)} />
                                                <span className="text-sm font-black text-slate-700">{stat.label}</span>
                                                <Info className="h-3 w-3 text-muted-foreground/30" />
                                            </div>
                                            <div className="text-xl font-black font-outfit text-slate-300">—</div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            <div className="space-y-1">
                                                <p>Latest</p>
                                                <p className="text-slate-500">—</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p>Avg</p>
                                                <p className="text-slate-500">—</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary pt-4 border-t border-dashed rounded-none h-auto">
                                            Show details <ChevronDown className="ml-2 h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function PaginationButton({ icon: Icon, disabled = false }: { icon: any, disabled?: boolean }) {
    return (
        <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            className={cn(
                "p-1.5",
                disabled && "opacity-30"
            )}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}
