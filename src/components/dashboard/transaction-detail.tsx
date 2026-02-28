"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditBadge } from "@/components/ui/credit-badge"
import { Separator } from "@/components/ui/separator"
import { StarIcon } from "@/components/global/star-icon"
import {
    Zap,
    Clock,
    Fingerprint,
    Cpu,
    Database,
    Activity,
    Copy,
    Check,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck
} from "lucide-react"
import { getTransactionDetailAction } from "@/app/actions"
import { ActivityDetail } from "@/repositories/interfaces"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface TransactionDetailProps {
    transactionId: string | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function TransactionDetail({ transactionId, isOpen, onOpenChange }: TransactionDetailProps) {
    const [detail, setDetail] = React.useState<ActivityDetail | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [copiedId, setCopiedId] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (isOpen && transactionId) {
            async function loadDetail() {
                setIsLoading(true)
                try {
                    const data = await getTransactionDetailAction(transactionId!)
                    setDetail(data)
                } catch (err) {
                    console.error("Failed to load transaction detail:", err)
                } finally {
                    setIsLoading(false)
                }
            }
            loadDetail()
        } else {
            setDetail(null)
        }
    }, [isOpen, transactionId])

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(key)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const isPositive = detail?.transaction.amount ? detail.transaction.amount > 0 : false

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-slate-50 dark:bg-slate-950">
                <DialogHeader className="sr-only">
                    <DialogTitle>Transaction Receipt</DialogTitle>
                    <DialogDescription>
                        Detailed breakdown of your credit transaction and AI usage logs.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="p-8 space-y-6">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                ) : detail ? (
                    <div className="flex flex-col">
                        {/* 1. High-Contrast Header */}
                        <div className={cn(
                            "p-8 pb-12 text-white relative overflow-hidden",
                            isPositive ? "bg-slate-900" : "bg-slate-900"
                        )}>
                            {/* Subtle pattern instead of blur for clarity */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className={cn(
                                    "p-3 rounded-2xl ring-2 ring-white/20 backdrop-blur-sm",
                                    isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                )}>
                                    {isPositive ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-3">
                                        <StarIcon size="lg" className="text-[24px]" containerClassName="ring-2 ring-white/10" />
                                        <h2 className={cn(
                                            "text-4xl font-black font-outfit tracking-tight drop-shadow-sm",
                                            isPositive ? "text-emerald-400" : "text-rose-400"
                                        )}>
                                            {isPositive ? "+" : ""}{detail.transaction.amount}
                                            <span className="text-xl ml-2 font-medium text-white">Stars</span>
                                        </h2>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "px-3 py-1 border-white/20 text-[10px] font-black tracking-[0.2em] uppercase",
                                                isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-100/10 text-slate-300"
                                            )}
                                        >
                                            {detail.transaction.type.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Body Content */}
                        <div className="px-6 -mt-6 relative z-20 space-y-4 pb-8">
                            {/* Summary Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Service Description</p>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            {detail.transaction.description || "System Transaction"}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                        <Activity size={18} />
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Calendar size={10} /> Date
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            {formatDate(detail.transaction.created_at)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Clock size={10} /> Time
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            {formatTime(detail.transaction.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Laboratory Section */}
                            {detail.aiUsage && (
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-900 dark:bg-white rounded-lg text-white dark:text-slate-900">
                                            <Zap size={16} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Intelligence Lab</h4>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Compute & Cost Audit</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center space-y-1">
                                            <Database size={12} className="mx-auto text-slate-400" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tokens</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{detail.aiUsage.total_tokens}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center space-y-1">
                                            <Clock size={12} className="mx-auto text-slate-400" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                                                {detail.aiUsage.duration_ms ? `${(detail.aiUsage.duration_ms / 1000).toFixed(1)}s` : "N/A"}
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center space-y-1">
                                            <Cpu size={12} className="mx-auto text-slate-400" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Model</p>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white truncate" title={detail.aiUsage.model_name}>
                                                {detail.aiUsage.model_name.split('/').pop()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2 py-3 bg-slate-900 dark:bg-white rounded-2xl shadow-lg ring-1 ring-black/5">
                                        <div className="space-y-0.5 ml-2">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 dark:text-slate-500">System Compute Cost</p>
                                            <p className="text-sm font-black text-white dark:text-slate-900">
                                                ${parseFloat(detail.aiUsage.total_cost_usd.toString()).toFixed(4)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-400 dark:text-emerald-600 mr-2">
                                            <ShieldCheck size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Verified Log</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Audit Section */}
                            <div className="space-y-3 px-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Security & Audit</h4>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => copyToClipboard(detail.transaction.id, 'tx')}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Fingerprint size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">TXID: {detail.transaction.id}</span>
                                        </div>
                                        {copiedId === 'tx' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-300 group-hover:text-slate-500" />}
                                    </button>

                                    {detail.transaction.trace_id && (
                                        <button
                                            onClick={() => copyToClipboard(detail.transaction.trace_id!, 'trace')}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Activity size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]">TRACE: {detail.transaction.trace_id}</span>
                                            </div>
                                            {copiedId === 'trace' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-300 group-hover:text-slate-500" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <footer className="p-6 pt-0 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                IELTS LOVER SECURE LEDGER SYSTEM • V2.1
                            </p>
                        </footer>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400">
                        Failed to load details.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
