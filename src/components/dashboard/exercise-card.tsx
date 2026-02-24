"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, BarChart2, TrendingUp, PieChart, Table, Map, GitBranch, LayoutDashboard, Calendar, Clock, type LucideIcon } from "lucide-react"
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
            <div className="relative bg-white border border-slate-100 rounded-[2rem] p-6 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

                    {/* Left: Icon & Description */}
                    <div className="flex items-center gap-5 min-w-0 flex-1">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border",
                            effectiveColor.includes("bg-") ? effectiveColor.replace("bg-", "border-").replace("50", "100") : "border-slate-100",
                            effectiveColor
                        )}>
                            <EffectiveIcon size={20} />
                        </div>

                        <div className="space-y-2 min-w-0">
                            {/* Tags Row */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Subtitle (Type) Tag */}
                                {subtitle && (
                                    <div className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow-sm transition-all duration-500 group-hover:shadow-md whitespace-nowrap",
                                        color.includes("blue") ? "bg-blue-50 text-blue-700 border-blue-100" :
                                            color.includes("indigo") ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                                "bg-purple-50 text-purple-700 border-purple-100"
                                    )}>
                                        {subtitle}
                                    </div>
                                )}

                                {/* Chart Type Tag */}
                                {chartType && CHART_TYPE_LABELS[chartType] && (
                                    <div className="text-[9px] font-bold text-slate-500 tracking-wide bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                                        {CHART_TYPE_LABELS[chartType]}
                                    </div>
                                )}

                                {/* Date Time Info */}
                                {formattedDate && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <Calendar size={12} className="opacity-60" />
                                        {formattedDate}
                                        {formattedTime && (
                                            <>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full mx-0.5" />
                                                <Clock size={12} className="opacity-60" />
                                                {formattedTime}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {title}
                            </h4>

                            {/* Creator Info below title */}
                            <div className="flex items-center gap-2 pt-0.5">
                                {creatorName ? (
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                        <span>By <span className="font-bold text-slate-700">{creatorName}</span></span>
                                        <span className={cn(
                                            "inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                            creatorRole === "admin" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                creatorRole === "teacher" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                    "bg-slate-50 text-slate-500 border-slate-200"
                                        )}>
                                            {creatorRole || "staff"}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-medium text-slate-400 italic">System Generated</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Attempts & Action */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-slate-50 shrink-0">
                        {/* Status Badges */}
                        <div className="flex items-center sm:flex-col sm:items-end gap-2">
                            {isRecommended && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                                    ★ Recommended
                                </span>
                            )}
                            {attempts > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                                    {attempts}× Practice
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                                    New Task
                                </span>
                            )}
                        </div>

                        {/* Action Link equivalent */}
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-300">
                            Start Writing <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
