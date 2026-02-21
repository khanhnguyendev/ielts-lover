"use client"

import { CreditRequest } from "@/types"
import { CREDIT_REQUEST_STATUS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    [CREDIT_REQUEST_STATUS.PENDING]: { bg: "bg-amber-50", text: "text-amber-600" },
    [CREDIT_REQUEST_STATUS.APPROVED]: { bg: "bg-emerald-50", text: "text-emerald-600" },
    [CREDIT_REQUEST_STATUS.REJECTED]: { bg: "bg-rose-50", text: "text-rose-600" },
}

export function CreditRequestList({ requests }: { requests: CreditRequest[] }) {
    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <p className="text-slate-400 font-medium">No credit requests yet.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
                {requests.map((req) => {
                    const style = STATUS_STYLES[req.status] || STATUS_STYLES[CREDIT_REQUEST_STATUS.PENDING]
                    return (
                        <div key={req.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-slate-900">
                                        {req.student?.full_name || req.student?.email || "Student"}
                                    </span>
                                    <span className="text-sm font-black text-indigo-600">
                                        +{req.amount} credits
                                    </span>
                                </div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", style.bg, style.text)}>
                                    {req.status}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mb-1">{req.reason}</p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                {req.admin_note && (
                                    <span className="text-slate-500">Admin: {req.admin_note}</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
