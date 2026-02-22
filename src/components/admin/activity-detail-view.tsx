"use client"

import { ActivityDetail } from "@/repositories/interfaces"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
    User, Clock, CreditCard, Cpu, Zap, Timer,
    ExternalLink, ChevronDown, Hash,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditBadge } from "@/components/ui/credit-badge"

function useIsMounted() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    return mounted
}

interface ActivityDetailViewProps {
    detail: ActivityDetail
}

function getInitials(name?: string, email?: string) {
    if (name) {
        const parts = name.trim().split(/\s+/)
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return parts[0].substring(0, 2).toUpperCase()
    }
    if (email) {
        return email.substring(0, 2).toUpperCase()
    }
    return "?"
}

function RoleBadge({ role }: { role: string }) {
    const config = {
        admin: "bg-amber-100 text-amber-700 border-amber-200",
        teacher: "bg-indigo-100 text-indigo-700 border-indigo-200",
        staff: "bg-slate-100 text-slate-600 border-slate-200",
        user: "bg-blue-100 text-blue-700 border-blue-200",
    }[role.toLowerCase()] || "bg-slate-100 text-slate-500 border-slate-200"

    return (
        <span className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm font-outfit",
            config
        )}>
            {role}
        </span>
    )
}

function MetaField({ icon: Icon, label, value, valueClass }: {
    icon: React.ElementType; label: string; value: string; valueClass?: string
}) {
    return (
        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 transition-all duration-300 hover:bg-white hover:shadow-sm">
            <div className="flex items-center gap-2">
                <Icon className="w-3 h-3 text-slate-300" />
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 font-outfit">{label}</span>
            </div>
            <p className={cn("text-[12px] font-black text-slate-700 truncate font-outfit", valueClass)}>{value}</p>
        </div>
    )
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
        >
            <span className="uppercase tracking-widest font-outfit">{label}</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </Link>
    )
}

export function ActivityDetailView({ detail }: ActivityDetailViewProps) {
    const { transaction: t, user, aiUsage } = detail
    const [debugOpen, setDebugOpen] = useState(false)
    const mounted = useIsMounted()
    const isPositive = t.amount > 0
    const avatarUrl = user?.avatar_url || t.user_avatar_url

    return (
        <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
            {/* User Profile Card */}
            {user && (
                <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6 relative z-10 transition-all duration-500 group-hover:shadow-md">
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Avatar className="w-16 h-16 border-2 border-white shadow-lg relative">
                                <AvatarImage
                                    src={avatarUrl}
                                    alt={user.full_name || t.user_full_name || "User"}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-slate-50 text-slate-400 font-black text-xs">
                                    {getInitials(user.full_name || t.user_full_name, user.email || t.user_email)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                <h1 className="text-xl font-black text-slate-900 font-outfit tracking-tight truncate">
                                    {user.full_name || t.user_full_name || "IELTS Learner"}
                                </h1>
                                <div className="flex justify-center md:justify-start">
                                    <RoleBadge role={user.role} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium font-outfit truncate">{user.email || t.user_email}</p>
                        </div>

                        <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-[20px] min-w-[160px] text-center md:text-right shadow-inner flex flex-col items-center md:items-end gap-1.5">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 font-outfit">Current Balance</p>
                            <CreditBadge amount={user.credits_balance} size="md" className="shadow-none border-none bg-transparent p-0" />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Main Transaction Card */}
                <div className="lg:col-span-3 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                            </div>
                            <h2 className="text-md font-black text-slate-900 font-outfit tracking-tight">Transaction Overview</h2>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">
                            {mounted ? (
                                <>
                                    {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </>
                            ) : (
                                <span className="animate-pulse">Loading...</span>
                            )}
                        </span>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-outfit">Amount Adjustment</p>
                                <div className="flex items-center gap-3">
                                    <CreditBadge amount={t.amount} size="lg" className="px-4 py-2 border-2" />
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest font-outfit shadow-sm mt-1",
                                isPositive ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-500"
                            )}>
                                {isPositive ? "Credit Added" : "Usage Charge"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <MetaField icon={Hash} label="Transaction ID" value={t.id} />
                            <MetaField icon={Zap} label="Feature Context" value={t.feature_key?.replace(/_/g, " ") || "No Feature"} />
                            <MetaField
                                icon={Clock}
                                label="Execution Time"
                                value={mounted ? new Date(t.created_at).toLocaleString("en-US", {
                                    dateStyle: "medium", timeStyle: "medium"
                                }) : "Loading..."}
                            />
                            <MetaField icon={CreditCard} label="Payment Map" value={t.type.replace(/_/g, " ")} />
                        </div>

                        {t.description && (
                            <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100/50 space-y-1.5 flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1 shrink-0" />
                                <div>
                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] font-outfit mb-0.5">Audit Note</p>
                                    <p className="text-[13px] font-bold text-slate-700 leading-snug font-outfit">{t.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI & Correlation Details */}
                <div className="lg:col-span-2 space-y-5">
                    {aiUsage ? (
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 space-y-5">
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <Cpu className="w-4 h-4 text-indigo-500" />
                                </div>
                                <h2 className="text-md font-black text-slate-900 font-outfit tracking-tight">AI Telemetry</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-between group overflow-hidden relative">
                                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 font-outfit">Engaged Model</p>
                                        <p className="text-[13px] font-black text-slate-800 font-outfit group-hover:text-primary transition-colors">{aiUsage.model_name}</p>
                                    </div>
                                    <Cpu className="w-7 h-7 text-slate-100 group-hover:text-primary/10 transition-colors duration-500 -mr-1" />
                                </div>
                                <MetaField icon={Zap} label="Engine" value={aiUsage.ai_method} />
                                <MetaField icon={Timer} label="Latency" value={`${aiUsage.duration_ms || 0}ms`} />
                                <MetaField icon={Hash} label="In (tk)" value={aiUsage.prompt_tokens.toLocaleString()} />
                                <MetaField icon={Hash} label="Out (tk)" value={aiUsage.completion_tokens.toLocaleString()} />
                                <div className="col-span-2 grid grid-cols-2 gap-4 pt-3 mt-1 border-t border-slate-50">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-outfit">Total Volume</p>
                                        <p className="text-lg font-black text-slate-900 font-outfit">{aiUsage.total_tokens.toLocaleString()}<span className="text-[9px] ml-1 text-slate-300 font-bold tracking-tighter">TOKENS</span></p>
                                    </div>
                                    <div className="space-y-0.5 text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-outfit">Financial Cost</p>
                                        <p className="text-lg font-black text-emerald-500 font-outfit">${Number(aiUsage.total_cost_usd).toFixed(5)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-2.5 bg-amber-50/50 border border-amber-100/50 rounded-lg">
                                <Timer className="w-3 h-3 text-amber-500" />
                                <p className="text-[9px] text-amber-600 font-bold italic tracking-tight font-outfit">
                                    Event-correlated (user_id, feature_key, ±5s window).
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 p-10 text-center h-full flex flex-col items-center justify-center space-y-3">
                            <Cpu className="w-10 h-10 text-slate-200" />
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-outfit">AI Correlation Sparse</h3>
                                <p className="text-[10px] text-slate-400/60 font-medium max-w-[170px] mx-auto mt-1">This entry mapped directly to database logic without AI API calls.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <NavLink href="/admin/users" label="User Audit" />
                <NavLink href="/admin/ai-costs" label="Cost Data" />
                <NavLink href="/admin/attempts" label="Audit Trail" />
                {t.exercise_id ? (
                    <NavLink href={`/admin/exercises`} label="Exercise Info" />
                ) : (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-[10px] font-black text-slate-300 select-none grayscale cursor-not-allowed">
                        <span className="uppercase tracking-widest font-outfit">No Link</span>
                    </div>
                )}
            </div>

            {/* Premium Debug Reveal */}
            <div className="pt-2">
                <div className={cn(
                    "rounded-[24px] overflow-hidden transition-all duration-700",
                    debugOpen ? "bg-slate-900 border-none shadow-2xl ring-4 ring-primary/5" : "bg-white border border-slate-100 shadow-sm"
                )}>
                    <button
                        onClick={() => setDebugOpen(!debugOpen)}
                        className={cn(
                            "w-full p-5 flex items-center justify-between transition-colors duration-300",
                            debugOpen ? "bg-slate-800 text-white" : "hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-500",
                                debugOpen ? "bg-primary" : "bg-slate-50 shadow-inner"
                            )}>
                                <Hash className={cn("w-3.5 h-3.5", debugOpen ? "text-white" : "text-slate-400")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] font-outfit",
                                debugOpen ? "text-slate-200" : "text-slate-400"
                            )}>System Trace Payload</span>
                        </div>
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-500",
                            debugOpen ? "bg-white/10 text-primary-foreground" : "bg-slate-100 text-slate-400 border border-slate-200/50"
                        )}>
                            {debugOpen ? "Hide" : "Inspect"}
                        </div>
                    </button>
                    {debugOpen && (
                        <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-500">
                            <pre className="text-[11px] text-emerald-400/90 font-mono overflow-x-auto bg-black border border-white/5 rounded-xl p-5 scrollbar-thin scrollbar-thumb-white/10">
                                {JSON.stringify(detail, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
