"use client"

import { useState } from "react"
import { CreditRequest } from "@/types"
import { CREDIT_REQUEST_STATUS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { approveCreditRequest, rejectCreditRequest } from "../actions"
import { Check, X } from "lucide-react"

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

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
                {FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black transition-all",
                            filter === opt.value
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-medium">
                    No credit requests found.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {filtered.map((req) => {
                            const style = STATUS_STYLES[req.status] || STATUS_STYLES[CREDIT_REQUEST_STATUS.PENDING]
                            const isPending = req.status === CREDIT_REQUEST_STATUS.PENDING
                            const isProcessing = loading[req.id]

                            return (
                                <div key={req.id} className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-sm font-black text-slate-900">
                                                    {req.teacher?.full_name || req.teacher?.email || "Teacher"}
                                                </span>
                                                <span className="text-xs text-slate-400">requested for</span>
                                                <span className="text-sm font-black text-indigo-600">
                                                    {req.student?.full_name || req.student?.email || "Student"}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500">{req.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-slate-900">+{req.amount}</span>
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", style.bg, style.text)}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>

                                    {isPending && (
                                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                                            <Input
                                                placeholder="Admin note (optional)"
                                                value={notes[req.id] || ""}
                                                onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                                                className="flex-1 rounded-xl text-xs h-9"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(req.id)}
                                                disabled={isProcessing}
                                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs gap-1"
                                            >
                                                <Check className="h-3.5 w-3.5" /> Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReject(req.id)}
                                                disabled={isProcessing}
                                                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-black text-xs gap-1"
                                            >
                                                <X className="h-3.5 w-3.5" /> Reject
                                            </Button>
                                        </div>
                                    )}

                                    {req.admin_note && (
                                        <p className="mt-2 text-[11px] font-medium text-slate-400">
                                            Admin note: {req.admin_note}
                                        </p>
                                    )}

                                    <p className="text-[10px] font-bold text-slate-300 mt-2">
                                        {new Date(req.created_at).toLocaleDateString()} at{" "}
                                        {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
