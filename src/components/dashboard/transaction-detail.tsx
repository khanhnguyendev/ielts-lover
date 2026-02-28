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
import { cn } from "@/lib/utils"
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
                        {/* 1. Gradient Header */}
                        <div className={cn(
                            "p-8 pb-12 text-white relative overflow-hidden",
                            isPositive ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-slate-800 to-slate-900"
                        )}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl ring-1 ring-white/30">
                                    {isPositive ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black font-outfit tracking-tight">
                                        {isPositive ? "+" : ""}{detail.transaction.amount}
                                        <span className="text-xl ml-1 font-medium opacity-80">Stars</span>
                                    </h2>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">
                                        {detail.transaction.type.replace(/_/g, ' ')}
                                    </p>
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
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                        <Activity size={18} />
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Calendar size={10} /> Date
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {new Date(detail.transaction.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Clock size={10} /> Time
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {new Date(detail.transaction.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Laboratory Section */}
                            {detail.aiUsage && (
                                <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-6 border border-primary/10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary rounded-lg text-white">
                                            <Zap size={16} fill="white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-primary uppercase tracking-widest">AI Intelligence Lab</h4>
                                            <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Compute & Cost Audit</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-primary/5 text-center space-y-1">
                                            <Database size={12} className="mx-auto text-primary/60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tokens</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{detail.aiUsage.total_tokens}</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-primary/5 text-center space-y-1">
                                            <Clock size={12} className="mx-auto text-primary/60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                                                {detail.aiUsage.duration_ms ? `${(detail.aiUsage.duration_ms / 1000).toFixed(1)}s` : "N/A"}
                                            </p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-primary/5 text-center space-y-1">
                                            <Cpu size={12} className="mx-auto text-primary/60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Model</p>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white truncate" title={detail.aiUsage.model_name}>
                                                {detail.aiUsage.model_name.split('/').pop()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">System Compute Cost</p>
                                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                                ${parseFloat(detail.aiUsage.total_cost_usd.toString()).toFixed(4)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-primary">
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
