"use client"

import * as React from "react"
import { CreditTransaction } from "@/repositories/interfaces"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TRANSACTION_TYPES } from "@/lib/constants"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    Calendar,
    Clock,
    CreditCard,
    Gift,
    Sparkles,
    Plus,
    Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionTableProps {
    transactions: CreditTransaction[]
}

const ITEMS_PER_PAGE = 20

export function TransactionTable({ transactions }: TransactionTableProps) {
    const [filter, setFilter] = React.useState<"all" | "earned" | "spent">("all")
    const [currentPage, setCurrentPage] = React.useState(1)

    // Filter Logic
    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t => {
            if (filter === "earned") return t.amount > 0
            if (filter === "spent") return t.amount < 0
            return true
        })
    }, [transactions, filter])

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Reset pagination when filter changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [filter])

    const getIcon = (type: string, amount: number) => {
        if (type === TRANSACTION_TYPES.DAILY_GRANT) return <Gift className="h-3 w-3 text-emerald-500" />
        if (type === TRANSACTION_TYPES.REWARD) return <Sparkles className="h-3 w-3 text-amber-500" />
        if (type === TRANSACTION_TYPES.USAGE) return <Sparkles className="h-3 w-3 text-indigo-500" /> // AI Usage
        if (amount > 0) return <CreditCard className="h-3 w-3 text-emerald-500" /> // Purchase?
        return <CreditCard className="h-3 w-3 text-slate-400" />
    }

    const formatType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const formatDescription = (desc: string | undefined, type: string) => {
        if (!desc) return formatType(type)

        // Handle legacy "Used feature: key" format
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

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100/50 p-0.5 rounded-lg w-fit border border-slate-200/60">
                {(["all", "earned", "spent"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                            filter === tab
                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                : "text-muted-foreground hover:text-slate-900"
                        )}
                    >
                        {tab}
                        <span className="ml-1.5 opacity-60 text-[9px] font-bold">
                            {tab === "all" ? transactions.length :
                                tab === "earned" ? transactions.filter(t => t.amount > 0).length :
                                    transactions.filter(t => t.amount < 0).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#F9FAFB]">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-[180px] pl-6 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1 cursor-pointer group">
                                    Date & Time <ArrowUpDown className="h-2.5 w-2.5 group-hover:text-primary" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[140px] py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1 cursor-pointer group">
                                    Amount <ArrowUpDown className="h-2.5 w-2.5 group-hover:text-primary" />
                                </div>
                            </TableHead>
                            <TableHead className="py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-1 cursor-pointer group">
                                    Description <ArrowUpDown className="h-2.5 w-2.5 group-hover:text-primary" />
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-[200px] text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                            <CreditCard className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-slate-700">No transactions found</p>
                                            <p className="text-[10px] font-medium">No credit history matches your filter.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransactions.map((t) => (
                                <TableRow key={t.id} className="group hover:bg-slate-50/50 border-slate-50">
                                    <TableCell className="pl-6 py-3">
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
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className={cn(
                                            "inline-flex items-center gap-1 text-[12px] font-black font-mono tracking-tight",
                                            t.amount > 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {t.amount > 0 ? "+" : ""}{t.amount}
                                            <span className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Credits</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm",
                                                t.amount > 0 ? "bg-emerald-50 border-emerald-100" : "bg-indigo-50 border-indigo-100"
                                            )}>
                                                {getIcon(t.type, t.amount)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black text-slate-900 leading-tight">
                                                    {formatDescription(t.description, t.type)}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {formatType(t.type)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Showing {paginatedTransactions.length} of {filteredTransactions.length} results
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <div className="flex items-center gap-1">
                        <PaginationButton
                            icon={ChevronsLeft}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                        />
                        <PaginationButton
                            icon={ChevronLeft}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        />
                        <PaginationButton
                            icon={ChevronRight}
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        />
                        <PaginationButton
                            icon={ChevronsRight}
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(totalPages)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function PaginationButton({ icon: Icon, disabled = false, onClick }: { icon: any, disabled?: boolean, onClick?: () => void }) {
    return (
        <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "h-8 w-8 p-0", // Adjusted to match report page style closer if needed, report page used "p-1.5" and size "icon" which is 10x10 usually? No size icon is 9x9 (h-9 w-9). Report used p-1.5.
                "p-1.5",
                disabled && "opacity-30"
            )}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}
