"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Zap, Clock, CreditCard, Coins } from "lucide-react"
import { getRollingAICostSummaries } from "@/app/admin/actions"
import { AICostSummary } from "@/repositories/interfaces"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SummaryCardProps {
    label: string
    value: string | number
    icon: React.ElementType
    color: string
}

function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
    return (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300", color)}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-lg font-black text-slate-900 tracking-tight truncate">{value}</p>
            </div>
        </div>
    )
}

export function AICostSummaryDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [summaries, setSummaries] = React.useState<{ last7Days: AICostSummary; last30Days: AICostSummary } | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [period, setPeriod] = React.useState<7 | 30>(7)

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await getRollingAICostSummaries()
            setSummaries(data)
        } catch (error) {
            console.error("Failed to fetch AI cost summaries", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (open && !summaries) {
            fetchData()
        }
    }, [open, summaries])

    const current = period === 7 ? summaries?.last7Days : summaries?.last30Days

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Cost Insights
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-4 ring-primary/5">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black font-outfit text-slate-900 tracking-tight">AI Cost Overview</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-slate-400 italic">Rolling performance & cost statistics</DialogDescription>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-full">
                            <button
                                onClick={() => setPeriod(7)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    period === 7 ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => setPeriod(30)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    period === 30 ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                30 Days
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-8 pb-8 pt-2">
                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 animate-pulse">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                            ))}
                        </div>
                    ) : current ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <SummaryCard
                                    label="Total AI Calls"
                                    value={current.total_calls.toLocaleString()}
                                    icon={Zap}
                                    color="bg-amber-100 text-amber-600"
                                />
                                <SummaryCard
                                    label="Estimated USD Cost"
                                    value={`$${Number(current.total_cost_usd).toFixed(4)}`}
                                    icon={CreditCard}
                                    color="bg-emerald-100 text-emerald-600"
                                />
                                <SummaryCard
                                    label="Total Tokens"
                                    value={current.total_tokens.toLocaleString()}
                                    icon={Coins}
                                    color="bg-blue-100 text-blue-600"
                                />
                                <SummaryCard
                                    label="Avg Latency"
                                    value={`${current.avg_duration_ms}ms`}
                                    icon={Clock}
                                    color="bg-purple-100 text-purple-600"
                                />
                                <SummaryCard
                                    label="Credits Charged"
                                    value={current.total_credits_charged.toLocaleString()}
                                    icon={Coins}
                                    color="bg-rose-100 text-rose-600"
                                />
                                <SummaryCard
                                    label="Prompt/Comp Ratio"
                                    value={`${Math.round((current.total_prompt_tokens / current.total_tokens) * 100)}% / ${Math.round((current.total_completion_tokens / current.total_tokens) * 100)}%`}
                                    icon={TrendingUp}
                                    color="bg-indigo-100 text-indigo-600"
                                />
                            </div>

                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <BarChart3 size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">Platform Health</h4>
                                    <p className="text-3xl font-black mb-1">{(current.total_calls / (period === 7 ? 7 : 30)).toFixed(1)} <span className="text-sm font-bold text-slate-400">Calls / day</span></p>
                                    <p className="text-xs font-medium text-slate-400 max-w-[340px]">
                                        This provides a snapshot of AI usage intensity across the platform. Use this data to project monthly token costs and credit burns.
                                    </p>
                                    <div className="mt-6">
                                        <Link href="/admin/ai-costs" onClick={() => setOpen(false)}>
                                            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full font-bold text-[10px] uppercase tracking-widest px-6 h-9 transition-all">
                                                Manage AI Economics & Pricing
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-slate-50 rounded-[2rem]">
                            <p className="text-sm font-bold text-slate-400">Failed to load summary data.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
