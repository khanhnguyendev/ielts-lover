"use client"

import { CreditTransactionWithUser } from "@/repositories/interfaces"
import { cn, formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"
import {
    Clock,
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
    Sparkles,
    ArrowUpRight,
    ArrowDownLeft,
    User,
    ArrowRight
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface AdminActivityItemProps {
    transaction: CreditTransactionWithUser
}

function getFeatureConfig(t: CreditTransactionWithUser) {
    const feature = (t.feature_key || "").toLowerCase()
    const desc = (t.description || "").toLowerCase()
    const content = `${feature} ${desc}`

    if (t.amount > 0) {
        const map: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
            daily_grant: { label: "Daily Perk", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            purchase: { label: "Star Store", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
            gift_code: { label: "Admin Topup", icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-50" },
            referral_reward: { label: "Referral", icon: UserPlus, color: "text-purple-600", bg: "bg-purple-50" },
            bonus: { label: "Bonus Star", icon: PlusCircle, color: "text-amber-600", bg: "bg-amber-50" },
            teacher_grant: { label: "Teacher Gift", icon: Gift, color: "text-rose-600", bg: "bg-rose-50" },
            reward: { label: "Reward", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
        }
        return map[t.type] || { label: "Star Charge", icon: Coins, color: "text-emerald-600", bg: "bg-emerald-50" }
    }

    if (content.includes("writing") || content.includes("correction"))
        return { label: "Writing", icon: PenTool, color: "text-purple-600", bg: "bg-purple-50" }
    if (content.includes("speaking"))
        return { label: "Speaking", icon: Mic2, color: "text-blue-600", bg: "bg-blue-50" }
    if (content.includes("rewriter"))
        return { label: "Rewriter", icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50" }
    if (content.includes("analysis") || content.includes("improvement"))
        return { label: "AI Analysis", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" }
    if (content.includes("vocabulary") || content.includes("lexical"))
        return { label: "Vocab", icon: BookOpen, color: "text-rose-600", bg: "bg-rose-50" }

    return { label: "Practice", icon: History, color: "text-slate-500", bg: "bg-slate-50" }
}

function formatDesc(desc: string | undefined) {
    if (!desc) return "StarCredit Transaction"
    const adminMatch = desc.match(/Admin Adjustment \((.+)\): (.+)/)
    if (adminMatch) return adminMatch[2]
    return desc.replace("Used feature: ", "").replace(/_/g, " ")
}

function getInitials(t: CreditTransactionWithUser) {
    if (t.user_full_name) {
        return t.user_full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }
    if (t.user_email) {
        return t.user_email.substring(0, 2).toUpperCase()
    }
    return "??"
}

export function AdminActivityItem({ transaction: t }: AdminActivityItemProps) {
    const config = getFeatureConfig(t)
    const isPositive = t.amount > 0

    return (
        <div className="group flex items-center gap-4 py-4 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-50 dark:border-white/5 last:border-0 relative">
            {/* User Avatar & Info */}
            <div className="flex items-center gap-3 min-w-[200px] max-w-[240px]">
                <Avatar className="w-8 h-8 border border-slate-100 dark:border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={t.user_avatar_url} alt={t.user_full_name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                        {getInitials(t)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {t.user_full_name || (t.user_email ? t.user_email.split("@")[0] : "Unknown User")}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                        {t.user_email || "No email available"}
                    </span>
                </div>
            </div>

            {/* Feature Label & Activity */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-transparent transition-all duration-300 group-hover:border-current/20 group-hover:shadow-md",
                    config.bg, config.color, "dark:bg-white/5"
                )}>
                    <config.icon size={14} />
                </div>
                <div className="min-w-0">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block mb-0.5 border border-current/10",
                        config.bg, config.color, "dark:bg-white/5"
                    )}>
                        {config.label}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate capitalize">
                        {formatDesc(t.description)}
                    </p>
                </div>
            </div>

            {/* Amount & Timestamp */}
            <div className="flex items-center gap-6 shrink-0">
                <div className={cn(
                    "flex flex-col items-end",
                    isPositive ? "text-emerald-600" : "text-rose-500"
                )}>
                    <div className="flex items-center gap-0.5 text-sm font-black">
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {isPositive ? "+" : ""}{t.amount}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">
                        Stars
                    </span>
                </div>

                <div className="flex flex-col items-end min-w-[70px]">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Clock size={12} className="opacity-40" />
                        {formatDate(t.created_at, false)}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600">
                        {formatTime(t.created_at)}
                    </span>
                </div>

                {/* Direct Action */}
                <Link
                    href={`/admin/activity/${t.id}`}
                    className="w-8 h-8 rounded-full border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:border-primary/30 dark:hover:border-primary/50 hover:text-primary transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-primary/10"
                >
                    <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    )
}
