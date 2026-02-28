"use client"

import * as React from "react"
import { CreditTransaction } from "@/repositories/interfaces"
import { cn, formatDate, formatTime, formatDateTime } from "@/lib/utils"
import {
    Calendar,
    Clock,
    Sparkles,
    ExternalLink,
    User as UserIcon,
    ArrowUpRight,
    ArrowDownLeft,
    PenTool,
    Mic2,
    RefreshCw,
    History,
    Zap,
    BookOpen,
    Gift,
    ShoppingCart,
    UserPlus,
    Ticket,
    PlusCircle,
    CalendarCheck,
    Coins,
    ChevronRight,
} from "lucide-react"
import { CreditBadge } from "@/components/ui/credit-badge"
import { DataTable, DataTableColumn } from "@/components/ui/data-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getUserTransactionsPaginated, getTransactionDetailAction } from "@/app/actions"
import { TransactionDetail } from "./transaction-detail"

interface TransactionFeedProps {
    initialTransactions: CreditTransaction[]
    totalTransactions: number
    pageSize: number
    initialSelectedTxId?: string | null
}

// ─── Constants & Helpers ─────────────────────────────────────

interface FeatureConfig {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
}

function getFeatureContext(t: CreditTransaction): FeatureConfig {
    const feature = (t.feature_key || "").toLowerCase()
    const desc = (t.description || "").toLowerCase()
    const content = `${feature} ${desc}`

    if (t.amount > 0) {
        const typeMap: Record<string, FeatureConfig> = {
            daily_grant: { label: "Daily Perk", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            purchase: { label: "Star Store", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            gift_code: { label: "Admin Topup", icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
            referral_reward: { label: "Referral", icon: UserPlus, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
            bonus: { label: "Bonus Star", icon: PlusCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            teacher_grant: { label: "Teacher Gift", icon: Gift, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
            reward: { label: "Reward", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" }
        }
        return typeMap[t.type] || { label: "Star Charge", icon: Coins, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" }
    }

    if (content.includes("writing") || content.includes("correction")) {
        return { label: "Writing", icon: PenTool, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" }
    }
    if (content.includes("speaking")) {
        return { label: "Speaking", icon: Mic2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" }
    }
    if (content.includes("rewriter")) {
        return { label: "Rewriter", icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" }
    }
    if (content.includes("analysis") || content.includes("improvement")) {
        return { label: "AI Analysis", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" }
    }
    if (content.includes("vocabulary") || content.includes("lexical")) {
        return { label: "Vocab", icon: BookOpen, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" }
    }

    return {
        label: t.type === 'refund' ? "Refund" : "Practice",
        icon: t.type === 'refund' ? History : History,
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-100"
    }
}



function formatDescription(desc: string | undefined) {
    if (!desc) return "StarCredit Transaction"

    // Pattern: Admin Adjustment (email): actual reason
    const adminMatch = desc.match(/Admin Adjustment \((.+)\): (.+)/)
    if (adminMatch) return adminMatch[2]

    return desc.replace("Used feature: ", "").replace(/_/g, ' ')
}

// ─── Components ──────────────────────────────────────────

function FilterGroup({ label, options, value, onChange }: {
    label: string,
    options: { value: string | null, label: string }[],
    value: string | null,
    onChange: (val: string | null) => void
}) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">{label}</span>
            <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            value === opt.value
                                ? "bg-white dark:bg-slate-800 text-primary shadow-lg shadow-black/5 ring-1 ring-black/5"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

function TransactionCard({ t }: { t: CreditTransaction }) {
    const config = getFeatureContext(t)
    const isPositive = t.amount > 0

    return (
        <div className={cn(
            "group bg-white border border-slate-100 rounded-[1.5rem] p-4 flex flex-row items-center gap-4 transition-all hover:shadow-md hover:border-slate-200",
            t.attempt_id && "hover:bg-slate-50/50"
        )}>
            {/* 1. Boxed Icon */}
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-110",
                config.bg, config.color, config.border
            )}>
                <config.icon size={20} />
            </div>

            {/* 2. Main Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        config.color
                    )}>
                        {config.label}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                        {formatDate(t.created_at)}
                        <span className="hidden sm:inline">{' at '}</span>
                        <span className="hidden sm:inline">{formatTime(t.created_at)}</span>
                    </span>
                    {t.granted_by_admin && (() => {
                        let adminLabel = "Support"
                        if (t.description?.includes("Admin Adjustment")) {
                            const match = t.description.match(/Admin Adjustment \((.+)\):/)
                            if (match) adminLabel = match[1]
                        }
                        return (
                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded truncate max-w-[80px] sm:max-w-[none]">
                                Admin · {adminLabel}
                            </span>
                        )
                    })()}
                </div>
                <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-primary transition-colors">
                    {formatDescription(t.description)}
                </h4>
            </div>

            {/* 3. Right: Amount */}
            <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2 sm:ml-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center border",
                        isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                        {isPositive ? <ArrowUpRight size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowDownLeft size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    </div>
                    <CreditBadge amount={t.amount} size="sm" />
                </div>
                {t.attempt_id && (
                    <Link
                        href={`/dashboard/reports/${t.attempt_id}`}
                        className="text-[8px] sm:text-[9px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest flex items-center gap-0.5 group-hover:translate-x-1 duration-300"
                    >
                        Report <ChevronRight size={10} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Link>
                )}
            </div>
        </div>
    )
}

// ─── Main Feed Component ─────────────────────────────────────

export function TransactionFeed({
    initialTransactions,
    totalTransactions,
    pageSize,
    initialSelectedTxId = null
}: TransactionFeedProps) {
    const [transactions, setTransactions] = React.useState(initialTransactions)
    const [totalCount, setTotalCount] = React.useState(totalTransactions)
    const [isLoadingMore, setIsLoadingMore] = React.useState(false)
    const [filter, setFilter] = React.useState<string | null>(null)
    const [selectedTxId, setSelectedTxId] = React.useState<string | null>(initialSelectedTxId)
    const [isDetailOpen, setIsDetailOpen] = React.useState(!!initialSelectedTxId)

    const hasMore = transactions.length < totalCount

    const handleLoadMore = React.useCallback(async () => {
        setIsLoadingMore(true)
        try {
            const { data, total } = await getUserTransactionsPaginated(pageSize, transactions.length)
            setTransactions(prev => [...prev, ...data])
            setTotalCount(total)
        } finally {
            setIsLoadingMore(false)
        }
    }, [transactions.length, pageSize])

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t => {
            if (filter === "earned") return t.amount > 0
            if (filter === "spent") return t.amount < 0
            return true
        })
    }, [transactions, filter])

    const columns: DataTableColumn<CreditTransaction>[] = [
        {
            key: "context",
            header: "Activity Type",
            width: "w-[200px]",
            render: (t) => {
                const config = getFeatureContext(t)
                const Icon = config.icon
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-110",
                            config.bg, config.color, config.border, "dark:bg-white/5 dark:border-white/10"
                        )}>
                            <Icon size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>
                                {config.label}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                <span>{formatDate(t.created_at, false)}</span>
                                <span className="text-[8px] opacity-40">•</span>
                                <span className="font-medium opacity-80">{formatTime(t.created_at)}</span>
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            key: "type",
            header: "Activity Type",
            width: "w-[140px]",
            render: (t) => {
                const isRefund = t.type.includes('refund');
                const isUsage = t.type.includes('usage') || t.type.includes('billing');
                const isReward = t.type.includes('reward') || t.type.includes('bonus');

                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            "px-2 py-0.5 rounded-md border text-[8px]",
                            isRefund && "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                            isUsage && "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                            isReward && "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
                            !isRefund && !isUsage && !isReward && "bg-slate-50 text-slate-600 border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
                        )}
                    >
                        {t.type.replace(/_/g, ' ')}
                    </Badge>
                )
            }
        },
        {
            key: "description",
            header: "Description & Audit Trace",
            render: (t) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {formatDescription(t.description)}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-600">
                            ID: {t.id.slice(0, 8)}...
                        </span>
                        {t.granted_by_admin && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                Admin Adjustment
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "amount",
            header: "Transaction",
            align: "right",
            width: "w-[120px]",
            render: (t) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border",
                        t.amount > 0
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    )}>
                        {t.amount > 0 ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                    </div>
                    <CreditBadge amount={t.amount} size="sm" />
                </div>
            )
        },
        {
            key: "actions",
            header: "Details",
            align: "right",
            width: "w-[150px]",
            render: (t) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => {
                            setSelectedTxId(t.id);
                            setIsDetailOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-all text-[9px] font-black uppercase tracking-widest border border-primary/10"
                    >
                        Receipt
                    </button>
                    {t.attempt_id && (
                        <Link
                            href={`/dashboard/reports/${t.attempt_id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 hover:text-primary dark:hover:text-primary transition-all text-[9px] font-black uppercase tracking-widest group/link border border-transparent hover:border-primary/20"
                        >
                            Report <ChevronRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <DataTable
                data={filteredTransactions}
                columns={columns}
                rowKey={(t) => t.id}
                pageSize={pageSize}
                totalCount={totalCount}
                navigation={{
                    type: "load-more",
                    onLoadMore: handleLoadMore,
                    isLoadingMore: isLoadingMore,
                    hasMore: hasMore
                }}
                toolbar={
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex bg-slate-100/30 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                            {[
                                { value: null, label: "All Activity" },
                                { value: "earned", label: "Earned" },
                                { value: "spent", label: "Spent" }
                            ].map((opt) => (
                                <button
                                    key={String(opt.value)}
                                    onClick={() => setFilter(opt.value)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        filter === opt.value
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-black/5 ring-1 ring-black/5"
                                            : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 dark:text-slate-700">
                                Real-time Ledger Sync
                            </span>
                        </div>
                    </div>
                }
                emptyState={{
                    icon: <History className="h-10 w-10 text-slate-200" />,
                    title: "No transactions found",
                    description: "Your financial transactions are currently empty for this filter."
                }}
            />
            <TransactionDetail
                transactionId={selectedTxId}
                isOpen={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </>
    )
}
