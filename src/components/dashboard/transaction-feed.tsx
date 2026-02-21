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
    Coins
} from "lucide-react"
import { CreditBadge } from "@/components/ui/credit-badge"
import Link from "next/link"

interface TransactionFeedProps {
    transactions: CreditTransaction[]
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
        <div className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

                {/* Left: Icon & Description */}
                <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                        config.bg, config.color, "border", config.border
                    )}>
                        <config.icon size={20} />
                    </div>

                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-sm transition-all duration-500 group-hover:shadow-md",
                                config.bg, config.color, config.border
                            )}>
                                {config.label}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Calendar size={12} className="opacity-60" />
                                {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                <div className="w-1 h-1 bg-slate-200 rounded-full mx-0.5" />
                                <Clock size={12} className="opacity-60" />
                                {new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 truncate capitalize leading-tight">
                            {formatDescription(t.description)}
                        </h4>
                        {t.exercise_id && (
                            <Link
                                href={`/dashboard/reports/${t.exercise_id}`}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-primary hover:text-primary/80 transition-colors mt-1"
                            >
                                Details <ExternalLink size={10} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right: Amount & Actor */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500",
                            isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100"
                        )}>
                            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>
                        <CreditBadge amount={t.amount} size="md" />
                    </div>
                    {t.granted_by_admin && (() => {
                        let adminLabel = "System Support"
                        if (t.description?.includes("Admin Adjustment")) {
                            const match = t.description.match(/Admin Adjustment \((.+)\):/)
                            if (match) adminLabel = match[1]
                        }

                        return (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-lg border border-slate-200/50 backdrop-blur-sm shadow-sm group-hover:bg-slate-100 transition-colors">
                                <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[7px] text-white">
                                    <UserIcon size={10} />
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">Admin: <span className="text-primary tracking-normal lowercase font-bold">{adminLabel}</span></span>
                            </div>
                        )
                    })()}
                </div>
            </div>
        </div>
    )
}

// ─── Main Feed Component ─────────────────────────────────────

export function TransactionFeed({ transactions }: TransactionFeedProps) {
    const [filter, setFilter] = React.useState<string | null>(null)
    const [currentPage, setCurrentPage] = React.useState(1)
    const ITEMS_PER_PAGE = 10

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
        <div className="space-y-8 animate-in fade-in duration-500">
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
                    {filteredTransactions.length} Total Records
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
                    {paginated.map((t) => (
                        <TransactionCard key={t.id} t={t} />
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
        </div>
    )
}
