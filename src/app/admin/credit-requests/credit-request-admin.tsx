"use client"

import { useState } from "react"
import { CreditRequest } from "@/types"
import { CREDIT_REQUEST_STATUS } from "@/lib/constants"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { approveCreditRequest, rejectCreditRequest } from "../actions"
import { Check, X, Search, Filter, History, User } from "lucide-react"
import { DataTable, DataTableColumn } from "@/components/ui/data-table"

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    [CREDIT_REQUEST_STATUS.PENDING]: { bg: "bg-amber-50", text: "text-amber-600" },
    [CREDIT_REQUEST_STATUS.APPROVED]: { bg: "bg-emerald-50", text: "text-emerald-600" },
    [CREDIT_REQUEST_STATUS.REJECTED]: { bg: "bg-rose-50", text: "text-rose-600" },
}

const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Pending", value: CREDIT_REQUEST_STATUS.PENDING },
    { label: "Approved", value: CREDIT_REQUEST_STATUS.APPROVED },
    { label: "Rejected", value: CREDIT_REQUEST_STATUS.REJECTED },
]

export function CreditRequestAdmin({ requests }: { requests: CreditRequest[] }) {
    const [filter, setFilter] = useState("all")
    const [notes, setNotes] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})

    const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter)

    const handleApprove = async (id: string) => {
        setLoading((prev) => ({ ...prev, [id]: true }))
        try {
            await approveCreditRequest(id, notes[id])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading((prev) => ({ ...prev, [id]: false }))
        }
    }

    const handleReject = async (id: string) => {
        setLoading((prev) => ({ ...prev, [id]: true }))
        try {
            await rejectCreditRequest(id, notes[id])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading((prev) => ({ ...prev, [id]: false }))
        }
    }

    const columns: DataTableColumn<CreditRequest>[] = [
        {
            key: "parties",
            header: "Stakeholders",
            render: (req) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <User size={12} />
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {req.teacher?.full_name || req.teacher?.email || "Teacher"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-white/5 ml-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">For</span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                            {req.student?.full_name || req.student?.email || "Student"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "details",
            header: "Reason & Date",
            render: (req) => (
                <div className="flex flex-col gap-1 max-w-md">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{req.reason}"
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        <History size={10} />
                        {formatDate(req.created_at)} at {formatTime(req.created_at)}
                    </div>
                </div>
            )
        },
        {
            key: "amount",
            header: "Amount",
            align: "center",
            render: (req) => (
                <div className="flex flex-col items-center gap-0.5 group/amount">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover/amount:text-primary transition-colors">
                        +{req.amount}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 italic">Stars</span>
                </div>
            )
        },
        {
            key: "status",
            header: "State",
            align: "center",
            render: (req) => {
                const style = STATUS_STYLES[req.status] || STATUS_STYLES[CREDIT_REQUEST_STATUS.PENDING]
                return (
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
                        req.status === CREDIT_REQUEST_STATUS.PENDING
                            ? "bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            : req.status === CREDIT_REQUEST_STATUS.APPROVED
                                ? "bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : "bg-rose-100/50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    )}>
                        {req.status}
                    </div>
                )
            }
        },
        {
            key: "resolution",
            header: "Resolution / Notes",
            width: "w-[300px]",
            align: "right",
            render: (req) => {
                const isPending = req.status === CREDIT_REQUEST_STATUS.PENDING
                const isProcessing = loading[req.id]

                if (!isPending) {
                    return req.admin_note ? (
                        <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 text-right">
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic">
                                Admin: {req.admin_note}
                            </p>
                        </div>
                    ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">No admin remarks</span>
                    )
                }

                return (
                    <div className="flex items-center gap-2 justify-end">
                        <Input
                            placeholder="Add note..."
                            value={notes[req.id] || ""}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                            className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest w-32 border-slate-200 dark:border-white/10 dark:bg-slate-900 focus:w-48 transition-all"
                        />
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                onClick={() => handleApprove(req.id)}
                                disabled={isProcessing}
                                className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white p-0 shadow-lg shadow-emerald-600/20"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(req.id)}
                                disabled={isProcessing}
                                className="h-8 w-8 rounded-lg border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )
            }
        }
    ];

    return (
        <DataTable
            data={filtered}
            columns={columns}
            rowKey={(r) => r.id}
            pageSize={10}
            toolbar={
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                        {FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    filter === opt.value
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-black/5 ring-1 ring-black/5"
                                        : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {opt.label}
                                <span className="ml-2 opacity-40 text-[9px] font-bold">
                                    {opt.value === "all" ? requests.length : requests.filter(r => r.status === opt.value).length}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col items-end">
                        <h2 className="text-xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Credit Manager</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Administrative Oversight</p>
                    </div>
                </div>
            }
            emptyState={{
                icon: <Filter className="h-8 w-8 text-slate-300" />,
                title: "All current requests handled",
                description: "There are no pending or history requests matching this filter."
            }}
        />
    )
}
