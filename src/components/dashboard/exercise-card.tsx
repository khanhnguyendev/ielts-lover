"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, BarChart2, TrendingUp, PieChart, Table, Map, GitBranch, LayoutDashboard, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Maps chart type → { icon, colors } for visual distinction
const CHART_ICON_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
    bar_chart: { icon: BarChart2, color: "text-violet-600 bg-violet-50" },
    bar: { icon: BarChart2, color: "text-violet-600 bg-violet-50" },
    line_graph: { icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    line: { icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    pie_chart: { icon: PieChart, color: "text-rose-500 bg-rose-50" },
    pie: { icon: PieChart, color: "text-rose-500 bg-rose-50" },
    doughnut: { icon: PieChart, color: "text-pink-500 bg-pink-50" },
    table: { icon: Table, color: "text-sky-600 bg-sky-50" },
    process_diagram: { icon: GitBranch, color: "text-amber-600 bg-amber-50" },
    process: { icon: GitBranch, color: "text-amber-600 bg-amber-50" },
    map: { icon: Map, color: "text-teal-600 bg-teal-50" },
    mixed_chart: { icon: LayoutDashboard, color: "text-indigo-600 bg-indigo-50" },
    mixed: { icon: LayoutDashboard, color: "text-indigo-600 bg-indigo-50" },
}

interface ExerciseCardProps {
    id: string
    title: string
    subtitle?: string
    chartType?: string
    attempts: number
    icon: LucideIcon
    color: string
    isRecommended?: boolean
    creatorName?: string
    creatorRole?: string
    createdAt?: string
}

const CHART_TYPE_LABELS: Record<string, string> = {
    line_graph: "📈 Line Graph",
    bar_chart: "📊 Bar Chart",
    pie_chart: "🥧 Pie Chart",
    table: "📋 Table",
    process_diagram: "🔄 Process",
    map: "🗺️ Map",
    mixed_chart: "📉 Mixed",
    line: "📈 Line Graph",
    bar: "📊 Bar Chart",
    pie: "🥧 Pie Chart",
    process: "🔄 Process",
    mixed: "📉 Mixed",
    doughnut: "🍩 Doughnut",
}

export function ExerciseCard({
    id,
    title,
    subtitle,
    chartType,
    attempts,
    icon: Icon,
    color,
    isRecommended,
    creatorName,
    creatorRole,
    createdAt,
}: ExerciseCardProps) {
    const dateObj = createdAt ? new Date(createdAt) : null
    const isValidDate = dateObj && !isNaN(dateObj.getTime())
    const formattedDate = isValidDate
        ? dateObj!.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : createdAt ?? null
    const formattedTime = isValidDate
        ? dateObj!.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : null

    // Use chart-specific icon+color when available, otherwise fall back to exercise type defaults
    const chartIconConfig = chartType ? CHART_ICON_CONFIG[chartType] : undefined
    const EffectiveIcon = chartIconConfig?.icon ?? Icon
    const effectiveColor = chartIconConfig?.color ?? color

    return (
        <Link href={`/dashboard/writing/${id}`} className="group block">
            {/* Mobile: simple flex row */}
            <div className="sm:hidden bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", effectiveColor)}>
                    <EffectiveIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate group-hover:text-primary transition-colors">{title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {isRecommended && <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white px-1.5 py-0.5 rounded-full">★ Rec</span>}
                        {attempts > 0
                            ? <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{attempts}×</span>
                            : <span className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">New</span>
                        }
                    </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
            </div>

            {/* Desktop: grid-aligned row — must match header grid-cols-[2.5rem_1fr_9rem_9rem_6.5rem_2.5rem] */}
            <div className="hidden sm:grid grid-cols-[2.5rem_1fr_9rem_9rem_6.5rem_2.5rem] items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-slate-50/30 transition-all duration-300">

                {/* Col 1: Icon */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110", effectiveColor)}>
                    <EffectiveIcon size={18} />
                </div>

                {/* Col 2: Title + attempts badge */}
                <div className="min-w-0 flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 truncate group-hover:text-primary transition-colors leading-snug">
                        {title}
                    </p>
                    {attempts > 0 ? (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {attempts}×
                        </span>
                    ) : (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200">
                            New
                        </span>
                    )}
                    {isRecommended && (
                        <span className="shrink-0 inline-block text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            ★
                        </span>
                    )}
                </div>

                {/* Col 3: Type */}
                <div className="flex flex-col items-center gap-1">
                    {subtitle && (
                        <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap",
                            color.includes("blue")
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : color.includes("indigo")
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                    : "bg-purple-50 text-purple-700 border-purple-100"
                        )}>
                            {subtitle}
                        </span>
                    )}
                    {chartType && CHART_TYPE_LABELS[chartType] && (
                        <span className="text-[9px] font-bold text-slate-400 tracking-wide whitespace-nowrap">
                            {CHART_TYPE_LABELS[chartType]}
                        </span>
                    )}
                </div>

                {/* Col 4: Created By */}
                <div className="flex flex-col items-center">
                    {creatorName ? (
                        <>
                            <p className="text-[11px] font-bold text-slate-700 truncate max-w-full text-center">{creatorName}</p>
                            <span className={cn(
                                "mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                creatorRole === "admin"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : creatorRole === "teacher"
                                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                                {creatorRole || "staff"}
                            </span>
                        </>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-300">—</span>
                    )}
                </div>

                {/* Col 5: Created At */}
                <div className="flex flex-col items-center">
                    {formattedDate ? (
                        <>
                            <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{formattedDate}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{formattedTime}</p>
                        </>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-300">—</span>
                    )}
                </div>

                {/* Col 6: Arrow + sessions */}
                <div className="flex items-center justify-end">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>
        </Link>
    )
}
