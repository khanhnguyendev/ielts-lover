"use client"

import { CreditTransactionWithUser } from "@/repositories/interfaces"
import { cn, formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"
import { CreditBadge } from "@/components/ui/credit-badge"
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
} from "lucide-react"

interface ActivityItemProps {
    transaction: CreditTransactionWithUser
    showUser?: boolean
    href?: string
    onClick?: () => void
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

export function ActivityItem({ transaction: t, showUser = false, href, onClick }: ActivityItemProps) {
    const config = getFeatureConfig(t)
    const isPositive = t.amount > 0

    const className = cn(
        "group flex items-center justify-between gap-3 py-2 px-2 rounded-[1.25rem] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 relative overflow-hidden",
        (href || onClick) && "cursor-pointer"
    )

    const inner = (
        <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                    "w-9 h-9 rounded-[0.8rem] flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-sm border",
                    config.bg, config.color, "border-white/50"
                )}>
                    <config.icon size={16} strokeWidth={2.5} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-black/5",
                            config.bg, config.color
                        )}>
                            {config.label}
                        </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 truncate capitalize leading-tight">
                        {formatDesc(t.description)}
                    </p>

                    {showUser && t.user_email && (
                        <div className="flex items-center gap-1 mt-0.5 opacity-60">
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[9px] font-black text-slate-500 truncate tracking-wide">
                                {t.user_email}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end shrink-0 pl-3 border-l border-slate-100/50">
                <CreditBadge amount={t.amount} size="sm" className="mb-0.5" />
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <Clock size={9} className="opacity-50" />
                    {formatDate(t.created_at, false)}
                    <span className="opacity-30">•</span>
                    {formatTime(t.created_at)}
                </div>
            </div>
        </>
    )

    if (onClick) {
        return (
            <div onClick={onClick} className={className}>
                {inner}
            </div>
        )
    }

    if (href) {
        return (
            <Link href={href} className={cn(className, "block no-underline")}>
                {inner}
            </Link>
        )
    }

    return <div className={className}>{inner}</div>
}
