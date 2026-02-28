"use client"

import * as React from "react"
import { CreditTransaction } from "@/repositories/interfaces"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TRANSACTION_TYPES } from "@/lib/constants"
import {
    Calendar,
    Clock,
    CreditCard,
    Gift,
    Sparkles,
    PenTool,
    Mic2,
    RefreshCw,
    FileText,
    MessageCircle,
    ExternalLink,
    User as UserIcon
} from "lucide-react"
import { CreditBadge } from "@/components/ui/credit-badge"
import { DataTable, DataTableColumn } from "@/components/ui/data-table"
import Link from "next/link"

interface TransactionTableProps {
    transactions: CreditTransaction[]
}

// ─── Helpers ─────────────────────────────────────────────
const formatType = (type: string) =>
    type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

function getFeatureContext(t: CreditTransaction) {
    const textToAnalyze = (t.feature_key || t.description || "").toLowerCase()

    if (t.amount > 0) {
        return {
            label: formatType(t.type),
            icon: Sparkles,
            bg: "bg-emerald-50/50",
            border: "border-emerald-100",
            text: "text-emerald-600"
        }
    }

    if (textToAnalyze.includes("writing") || textToAnalyze.includes("sentence") || textToAnalyze.includes("correction")) {
        return { label: "Writing", icon: PenTool, bg: "bg-indigo-50/50", border: "border-indigo-100", text: "text-indigo-600" }
    }
    if (textToAnalyze.includes("speaking")) {
        return { label: "Speaking", icon: Mic2, bg: "bg-amber-50/50", border: "border-amber-100", text: "text-amber-600" }
    }
    if (textToAnalyze.includes("rewriter")) {
        return { label: "Rewriter", icon: RefreshCw, bg: "bg-blue-50/50", border: "border-blue-100", text: "text-blue-600" }
    }
    if (textToAnalyze.includes("mock")) {
        return { label: "Mock Test", icon: FileText, bg: "bg-rose-50/50", border: "border-rose-100", text: "text-rose-600" }
    }
    if (textToAnalyze.includes("tutor")) {
        return { label: "AI Tutor", icon: MessageCircle, bg: "bg-purple-50/50", border: "border-purple-100", text: "text-purple-600" }
    }

    return { label: "General", icon: Sparkles, bg: "bg-slate-50/50", border: "border-slate-200", text: "text-slate-500" }
}

function formatDescription(desc: string | undefined, type: string) {
    if (!desc) return formatType(type)
    if (desc.startsWith("Used feature: ")) {
        const key = desc.replace("Used feature: ", "")
        const map: Record<string, string> = {
            "writing_evaluation": "Writing Task Evaluation",
            "speaking_evaluation": "Speaking Practice Assessment",
            "text_rewriter": "IELTS Text Rewriter",
            "mock_test": "Full Mock Test Access"
        }
        return map[key] || key.replace(/_/g, ' ')
    }
    return desc
}

// ─── Column Definitions ──────────────────────────────────
const columns: DataTableColumn<CreditTransaction>[] = [
    {
        key: "datetime",
        header: "Date & Time",
        width: "w-[160px]",
        render: (t) => (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-[11px] font-black text-slate-900">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                    <Clock className="h-3 w-3" />
                    {new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        )
    },
    {
        key: "context",
        header: "Context",
        width: "w-[160px]",
        render: (t) => {
            const context = getFeatureContext(t)
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter flex items-center gap-1.5 w-fit shadow-xs",
                        context.bg, context.border, context.text
                    )}
                >
                    <context.icon className="h-2.5 w-2.5" />
                    {context.label}
                </Badge>
            )
        }
    },
    {
        key: "description",
        header: "Description",
        render: (t) => (
            <div className="flex flex-col gap-1">
                <span className="text-[12px] font-black text-slate-900 leading-tight">
                    {formatDescription(t.description, t.type)}
                </span>
                {t.attempt_id && (
                    <Link
                        href={`/dashboard/reports/${t.attempt_id}`}
                        className="text-[9px] font-black text-primary hover:underline flex items-center gap-0.5 w-fit"
                    >
                        View Report <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                )}
            </div>
        )
    },
    {
        key: "amount",
        header: "Amount",
        width: "w-[120px]",
        align: "right",
        render: (t) => <CreditBadge amount={t.amount} size="sm" />
    },
    {
        key: "actor",
        header: "User / Actor",
        width: "w-[160px]",
        render: (t) => (
            <div className="flex flex-col gap-0.5">
                {t.amount > 0 ? (
                    <span className="text-[11px] font-black text-slate-700">
                        {t.granted_by_admin ? "Admin Grant" : "System Grant"}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Action</span>
                )}
                {t.granted_by_admin && (
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium italic">
                        <UserIcon className="h-2.5 w-2.5" />
                        by {t.granted_by_admin}
                    </div>
                )}
            </div>
        )
    },
]

// ─── Component ───────────────────────────────────────────
export function TransactionTable({ transactions }: TransactionTableProps) {
    const [filter, setFilter] = React.useState<"all" | "earned" | "spent">("all")

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t => {
            if (filter === "earned") return t.amount > 0
            if (filter === "spent") return t.amount < 0
            return true
        })
    }, [transactions, filter])

    const earnedCount = React.useMemo(() => transactions.filter(t => t.amount > 0).length, [transactions])
    const spentCount = React.useMemo(() => transactions.filter(t => t.amount < 0).length, [transactions])

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                {(["all", "earned", "spent"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            filter === tab
                                ? "bg-white dark:bg-slate-800 text-primary shadow-lg shadow-black/5 ring-1 ring-black/5"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        {tab}
                        <span className="ml-2 opacity-40 text-[9px] font-bold">
                            {tab === "all" ? transactions.length :
                                tab === "earned" ? earnedCount : spentCount}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <DataTable<CreditTransaction>
                columns={columns}
                data={filteredTransactions}
                rowKey={(t) => t.id}
                pageSize={20}
                emptyState={{
                    icon: <CreditCard className="h-6 w-6 text-slate-300" />,
                    title: "No transactions found",
                    description: "No credit history matches your filter."
                }}
            />
        </div>
    )
}
