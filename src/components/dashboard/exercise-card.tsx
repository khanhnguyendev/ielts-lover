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
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-slate-200 hover:bg-slate-50/50">
                {/* 1. Icon */}
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-110",
                    effectiveColor.includes("bg-") ? effectiveColor.replace("bg-", "border-").replace("50", "100") : "border-slate-100",
                    effectiveColor
                )}>
                    <EffectiveIcon size={20} />
                </div>

                {/* 2. Text Content */}
                <div className="flex-1 min-w-0">
                    {/* Top Meta: Subtitle, Chart Type, Date/Time */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {subtitle && (
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                color.includes("blue") ? "text-blue-600" :
                                    color.includes("indigo") ? "text-indigo-600" :
                                        "text-purple-600"
                            )}>
                                {subtitle}
                            </span>
                        )}
                        {chartType && CHART_TYPE_LABELS[chartType] && (
                            <span className="text-[8px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                                {CHART_TYPE_LABELS[chartType]}
                            </span>
                        )}
                        {formattedDate && (
                            <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                                {formattedDate}
                                {formattedTime && ` at ${formattedTime}`}
                            </span>
                        )}
                        {isRecommended && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                ★ Rec
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-primary transition-colors">
                        {title}
                    </h4>

                    {/* Bottom Meta */}
                    <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400 font-medium truncate">
                        {creatorName ? (
                            <>
                                <span>By <span className="font-bold text-slate-600">{creatorName}</span></span>
                                <span className={cn(
                                    "px-1 rounded-sm text-[7px] font-black uppercase tracking-widest border",
                                    creatorRole === "admin" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                        creatorRole === "teacher" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                            "bg-slate-50 text-slate-500 border-slate-200"
                                )}>
                                    {creatorRole || "staff"}
                                </span>
                            </>
                        ) : (
                            <span className="italic">System Generated</span>
                        )}
                    </div>
                </div>

                {/* 3. Stats Columns */}
                <div className="hidden sm:flex items-center gap-4 px-4 border-l border-slate-50">
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Attempts</p>
                        {attempts > 0 ? (
                            <p className="text-[10px] font-black text-emerald-600">{attempts}×</p>
                        ) : (
                            <p className="text-[10px] font-black text-slate-400">0×</p>
                        )}
                    </div>
                    <div className="text-right w-16">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Status</p>
                        {attempts > 0 ? (
                            <p className="text-[8px] font-bold uppercase text-emerald-600 truncate">Practiced</p>
                        ) : (
                            <p className="text-[8px] font-bold uppercase text-amber-600 truncate">New</p>
                        )}
                    </div>
                </div>

                {/* 4. Action Chevron */}
                <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg group-hover:bg-primary/5 text-slate-400 group-hover:text-primary transition-colors">
                    <ChevronRight size={16} />
                </div>
            </div>
        </Link>
    )
}
