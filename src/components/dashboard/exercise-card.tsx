"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ChevronRight,
    BarChart2,
    TrendingUp,
    PieChart,
    Table,
    Map,
    GitBranch,
    LayoutDashboard,
    Calendar,
    Clock,
    Star,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

// Maps chart type → { icon, colors } for visual distinction
const CHART_ICON_CONFIG: Record<string, { icon: LucideIcon; color: string; glow: string }> = {
    bar_chart: { icon: BarChart2, color: "text-violet-600 dark:text-violet-400 bg-violet-100/50", glow: "bg-violet-400/10" },
    bar: { icon: BarChart2, color: "text-violet-600 dark:text-violet-400 bg-violet-100/50", glow: "bg-violet-400/10" },
    line_graph: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/50", glow: "bg-emerald-400/10" },
    line: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/50", glow: "bg-emerald-400/10" },
    pie_chart: { icon: PieChart, color: "text-rose-500 dark:text-rose-400 bg-rose-100/50", glow: "bg-rose-400/10" },
    pie: { icon: PieChart, color: "text-rose-500 dark:text-rose-400 bg-rose-100/50", glow: "bg-rose-400/10" },
    doughnut: { icon: PieChart, color: "text-pink-500 dark:text-pink-400 bg-pink-100/50", glow: "bg-pink-400/10" },
    table: { icon: Table, color: "text-sky-600 dark:text-sky-400 bg-sky-100/50", glow: "bg-sky-400/10" },
    process_diagram: { icon: GitBranch, color: "text-amber-600 dark:text-amber-400 bg-amber-100/50", glow: "bg-amber-400/10" },
    process: { icon: GitBranch, color: "text-amber-600 dark:text-amber-400 bg-amber-100/50", glow: "bg-amber-400/10" },
    map: { icon: Map, color: "text-teal-600 dark:text-teal-400 bg-teal-100/50", glow: "bg-teal-400/10" },
    mixed_chart: { icon: LayoutDashboard, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-100/50", glow: "bg-indigo-400/10" },
    mixed: { icon: LayoutDashboard, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-100/50", glow: "bg-indigo-400/10" },
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
        ? dateObj!.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : createdAt ?? null

    const chartConfig = chartType ? CHART_ICON_CONFIG[chartType] : undefined
    const EffectiveIcon = chartConfig?.icon ?? Icon
    const effectiveBg = chartConfig?.color ?? (color.includes("bg-") ? color.replace("50", "100/50") : color)
    const effectiveColor = color.includes("text-") ? color.split(" ")[0] : "text-primary"
    const glowColor = chartConfig?.glow ?? "bg-primary/5"

    return (
        <Link href={`/dashboard/writing/${id}`} className="group block h-full">
            <motion.div
                whileHover={{ y: -4, x: 4 }}
                className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-slate-100 dark:border-slate-800/50 rounded-3xl p-5 flex items-center gap-6 transition-all duration-500 shadow-sm hover:shadow-2xl hover:border-primary/20 group-overflow-hidden"
            >
                {/* Background Glow */}
                <div className={cn("absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000", glowColor)} />

                {/* 1. Icon Container */}
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                    effectiveBg
                )}>
                    <EffectiveIcon size={28} className={effectiveColor} />
                </div>

                {/* 2. Main Content Area */}
                <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-center gap-3 mb-1.5">
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            effectiveBg,
                            effectiveColor
                        )}>
                            {subtitle || "Writing"}
                        </span>
                        {chartType && CHART_TYPE_LABELS[chartType] && (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50">
                                {CHART_TYPE_LABELS[chartType]}
                            </span>
                        )}
                        {isRecommended && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-md border border-amber-200/50">
                                <Star size={10} fill="currentColor" /> Recommended
                            </span>
                        )}
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white truncate leading-tight transition-colors group-hover:text-primary">
                        {title}
                    </h4>

                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <Clock size={12} className="text-slate-300" />
                            {formattedDate || "Recent"}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span className="text-slate-400 font-medium lowercase">by</span>
                            <span className={cn(
                                "font-black tracking-widest",
                                creatorRole === "admin" ? "text-amber-500" : "text-indigo-500"
                            )}>{creatorName?.split(' ')[0] || "System"}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Status Column */}
                <div className="hidden sm:flex flex-col items-end gap-1 px-6 border-l border-slate-100 dark:border-slate-800 z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Practice Status</p>
                    <div className="flex items-center gap-2">
                        {attempts > 0 ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{attempts}x Attempts</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unattempted</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 4. Action Indicator */}
                <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm z-10">
                    <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
                </div>
            </motion.div>
        </Link>
    )
}
