"use client"

import * as React from "react"
import Link from "next/link"
import { Star, ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

const CHART_TYPE_LABELS: Record<string, string> = {
    line_graph: "📈 Line",
    bar_chart: "📊 Bar",
    pie_chart: "🥧 Pie",
    table: "📋 Table",
    process_diagram: "🔄 Process",
    map: "🗺️ Map",
    mixed_chart: "📉 Mixed",
    line: "📈 Line",
    bar: "📊 Bar",
    pie: "🥧 Pie",
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
}: ExerciseCardProps) {
    return (
        <Link href={`/dashboard/writing/${id}`} className="group relative block h-full">
            <div className="h-full bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all duration-500 flex flex-col gap-6 overflow-hidden">

                {/* Recommended Badge */}
                {isRecommended && (
                    <div className="absolute top-4 right-6 bg-amber-500 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/20 z-10 animate-pulse">
                        <Star className="h-2 w-2 fill-white" /> Recommended
                    </div>
                )}

                <div className="flex items-start gap-5">
                    {/* Icon Container */}
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                        color, "border border-white/50"
                    )}>
                        <Icon size={20} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="space-y-1.5">
                            <h4 className="text-base font-black font-outfit leading-tight text-slate-900 group-hover:text-primary transition-colors pr-8">
                                {title}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {subtitle && (
                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50/50 text-indigo-600 text-[9px] font-black uppercase tracking-wider border border-indigo-100/50">
                                        {subtitle}
                                    </span>
                                )}
                                {chartType && (
                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50/50 text-amber-700 text-[9px] font-black uppercase tracking-wider border border-amber-100/50">
                                        {CHART_TYPE_LABELS[chartType] || chartType}
                                    </span>
                                )}
                                {creatorName && (
                                    <span className={cn(
                                        "inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                        creatorRole === "admin"
                                            ? "bg-rose-50/50 text-rose-600 border-rose-100/50"
                                            : "bg-teal-50/50 text-teal-600 border-teal-100/50"
                                    )}>
                                        {creatorRole === "admin" ? "Admin" : "Teacher"}: {creatorName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Stats & Button */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-5">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Activity</span>
                        <p className="text-xs font-bold text-slate-600">
                            {attempts > 0 ? `${attempts} Session${attempts > 1 ? 's' : ''}` : "Fresh Start"}
                        </p>
                    </div>

                    <div className="h-10 pl-5 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                        {attempts > 0 ? "Retake" : "Practice"}
                        <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                            <ChevronRight size={12} className={cn("transition-transform duration-300", attempts > 0 ? "" : "group-hover:translate-x-0.5")} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
