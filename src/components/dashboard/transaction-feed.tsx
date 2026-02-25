"use client"

import * as React from "react"
import { CreditTransaction } from "@/repositories/interfaces"
import { cn } from "@/lib/utils"
import {
    Calendar,
    Clock,
    Sparkles,
    ArrowRight,
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
    ChevronDown,
    Loader2
} from "lucide-react"
import { CreditBadge } from "@/components/ui/credit-badge"
import Link from "next/link"
import { getUserTransactionsPaginated } from "@/app/actions"

interface TransactionFeedProps {
    initialTransactions: CreditTransaction[]
    totalTransactions: number
    pageSize: number
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
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                            value === opt.value
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-100"
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
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="hidden sm:inline">{' at '}</span>
                        <span className="hidden sm:inline">{new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
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

export function TransactionFeed({ initialTransactions, totalTransactions, pageSize }: TransactionFeedProps) {
    const [transactions, setTransactions] = React.useState(initialTransactions)
    const [totalCount, setTotalCount] = React.useState(totalTransactions)
    const [isLoadingMore, setIsLoadingMore] = React.useState(false)
    const [filter, setFilter] = React.useState<string | null>(null)
    const [currentPage, setCurrentPage] = React.useState(1)
    const ITEMS_PER_PAGE = 10

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

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
    const paginated = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="space-y-8">
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                <FilterGroup
                    label="Filter By"
                    options={[
                        { value: null, label: "All Activity" },
                        { value: "earned", label: "Earned" },
                        { value: "spent", label: "Spent" }
                    ]}
                    value={filter}
                    onChange={(val) => { setFilter(val); setCurrentPage(1); }}
                />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    {transactions.length} of {totalCount} Records
                </div>
            </div>

            {/* List */}
            {paginated.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <History size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">No activity found</h3>
                    <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">Try changing your filters or keep practicing to generate more records.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {paginated.map((t, i) => (
                        <div
                            key={t.id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <TransactionCard t={t} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            <ArrowRight size={16} className="rotate-180" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-60 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        {isLoadingMore ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <ChevronDown size={14} />
                        )}
                        {isLoadingMore ? "Loading..." : `Load More (${totalCount - transactions.length} remaining)`}
                    </button>
                </div>
            )}
        </div>
    )
}
