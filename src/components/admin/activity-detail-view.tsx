"use client"

import { ActivityDetail } from "@/repositories/interfaces"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
    User, Clock, CreditCard, Cpu, Zap, Timer,
    ExternalLink, ChevronDown, Hash,
} from "lucide-react"
import { useState } from "react"

interface ActivityDetailViewProps {
    detail: ActivityDetail
}

function MetaField({ icon: Icon, label, value, valueClass }: {
    icon: React.ElementType; label: string; value: string; valueClass?: string
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <p className={cn("text-sm font-bold text-slate-700 truncate", valueClass)}>{value}</p>
        </div>
    )
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition"
        >
            {label}
            <ExternalLink className="w-3 h-3" />
        </Link>
    )
}

export function ActivityDetailView({ detail }: ActivityDetailViewProps) {
    const { transaction: t, user, aiUsage } = detail
    const [debugOpen, setDebugOpen] = useState(false)
    const isPositive = t.amount > 0

    return (
        <div className="space-y-6">
            {/* User Header */}
            {user && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900 truncate">
                                    {user.full_name || user.email}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium truncate">{user.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</p>
                            <p className="text-lg font-black text-slate-900">{user.credits_balance}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Transaction Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetaField icon={Hash} label="ID" value={t.id.slice(0, 8)} />
                    <MetaField icon={CreditCard} label="Type" value={t.type.replace(/_/g, " ")} />
                    <MetaField icon={Zap} label="Feature" value={t.feature_key?.replace(/_/g, " ") || "N/A"} />
                    <MetaField
                        icon={Clock}
                        label="Timestamp"
                        value={new Date(t.created_at).toLocaleString("en-US", {
                            dateStyle: "medium", timeStyle: "short"
                        })}
                    />
                    <MetaField
                        icon={CreditCard}
                        label="Amount"
                        value={`${isPositive ? "+" : ""}${t.amount}`}
                        valueClass={isPositive ? "text-emerald-600" : "text-rose-500"}
                    />
                    {t.exercise_id && (
                        <MetaField icon={ExternalLink} label="Exercise ID" value={t.exercise_id.slice(0, 8)} />
                    )}
                    {t.granted_by_admin && (
                        <MetaField icon={User} label="Granted By" value={t.granted_by_admin.slice(0, 8)} />
                    )}
                </div>
                {t.description && (
                    <div className="pt-3 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                        <p className="text-sm text-slate-700">{t.description}</p>
                    </div>
                )}
            </div>

            {/* AI Usage */}
            {aiUsage && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">AI Usage (Correlated)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <MetaField icon={Cpu} label="Model" value={aiUsage.model_name} />
                        <MetaField icon={Zap} label="Method" value={aiUsage.ai_method} />
                        <MetaField icon={Hash} label="Prompt Tokens" value={aiUsage.prompt_tokens.toLocaleString()} />
                        <MetaField icon={Hash} label="Completion Tokens" value={aiUsage.completion_tokens.toLocaleString()} />
                        <MetaField icon={Hash} label="Total Tokens" value={aiUsage.total_tokens.toLocaleString()} />
                        <MetaField
                            icon={CreditCard}
                            label="USD Cost"
                            value={`$${Number(aiUsage.total_cost_usd).toFixed(6)}`}
                        />
                        <MetaField icon={CreditCard} label="Credits Charged" value={String(aiUsage.credits_charged)} />
                        {aiUsage.duration_ms != null && (
                            <MetaField icon={Timer} label="Latency" value={`${aiUsage.duration_ms}ms`} />
                        )}
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium italic">
                        Correlated by (user_id, feature_key, ~5s window). May not be exact.
                    </p>
                </div>
            )}

            {/* Quick Navigation */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Quick Navigation</h2>
                <div className="flex flex-wrap gap-3">
                    <NavLink href="/admin/users" label="User Management" />
                    {t.exercise_id && (
                        <NavLink href="/admin/exercises" label="Exercises" />
                    )}
                    <NavLink href="/admin/ai-costs" label="AI Cost Analytics" />
                    <NavLink href="/admin/attempts" label="Attempts Audit" />
                </div>
            </div>

            {/* Debug JSON */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                    onClick={() => setDebugOpen(!debugOpen)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                    <span className="text-sm font-black uppercase tracking-widest text-slate-400">Debug JSON</span>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", debugOpen && "rotate-180")} />
                </button>
                {debugOpen && (
                    <div className="px-4 pb-4">
                        <pre className="text-xs text-slate-600 overflow-x-auto bg-slate-50 rounded-xl p-4">
                            {JSON.stringify(detail, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
