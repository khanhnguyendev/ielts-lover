"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Sparkles, Plus } from "lucide-react"

interface StarsBalanceProps {
    balance: number
    className?: string
}

export function StarsBalance({ balance, className }: StarsBalanceProps) {
    return (
        <Link
            href="/dashboard/credits"
            className={cn(
                "group relative flex items-center gap-1.5 bg-yellow-50/50 hover:bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200/50 hover:border-yellow-200 shadow-sm transition-all active:scale-95",
                className
            )}
        >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 group-hover:rotate-12 transition-transform shadow-sm">
                <span className="text-[10px] leading-none select-none">⭐</span>
            </div>

            <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-yellow-700 tracking-tight">
                    {balance.toLocaleString()}
                </span>

                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500 transition-colors">
                    <Plus className="h-2.5 w-2.5 text-yellow-600 group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* Subtle Sparkle on Hover */}
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
        </Link>
    )
}
