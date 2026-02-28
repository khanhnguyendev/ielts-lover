import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowUpRight, TrendingDown } from "lucide-react"

export interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    subLabel: string;
    color: string;
    bgColor: string;
    index?: number;
    href?: string;
    trend?: string;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    subLabel,
    color,
    bgColor,
    index = 0,
    href,
    trend
}: StatCardProps) {
    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-primary/20 hover:border-primary/30 transition-all duration-700 h-full flex flex-col justify-between"
        >
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/[0.02] to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="flex justify-between items-start mb-8">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 group-hover:scale-110 group-hover:rotate-6", bgColor, color)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black shadow-sm",
                        trend.startsWith('+') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                    )}>
                        {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                )}
                {!trend && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors pr-1">
                        {label}
                    </div>
                )}
            </div>
            <div className="space-y-1 px-1">
                {trend && (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors mb-1">{label}</p>
                )}
                <div className="text-4xl lg:text-5xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter leading-none">{value}</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight pt-2">{subLabel}</div>
            </div>
        </motion.div>
    )

    if (href) {
        return <Link href={href} className="block h-full">{content}</Link>
    }

    return content
}
