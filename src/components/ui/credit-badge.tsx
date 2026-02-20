"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CreditBadgeProps {
    amount: number
    showIcon?: boolean
    className?: string
    size?: "sm" | "md" | "lg"
}

export function CreditBadge({
    amount,
    showIcon = true,
    className,
    size = "md"
}: CreditBadgeProps) {
    const isPositive = amount > 0

    const sizeClasses = {
        sm: "px-1.5 py-0.5 text-[10px] gap-1 rounded-md",
        md: "px-2.5 py-1 text-[12px] gap-1.5 rounded-lg",
        lg: "px-4 py-2 text-[14px] gap-2 rounded-xl"
    }

    const starSizes = {
        sm: "w-3 h-3 text-[6px]",
        md: "w-4 h-4 text-[8px]",
        lg: "w-5 h-5 text-[10px]"
    }

    return (
        <div className={cn(
            "inline-flex items-center font-black transition-all shadow-sm border",
            isPositive
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-yellow-50 text-yellow-700 border-yellow-200",
            sizeClasses[size],
            className
        )}>
            {showIcon && (
                <div className={cn(
                    "flex items-center justify-center rounded-full bg-yellow-400 shadow-sm",
                    starSizes[size]
                )}>
                    <span className="leading-none select-none">⭐</span>
                </div>
            )}
            <span className="font-mono tracking-tighter">
                {isPositive ? "+" : "-"}{Math.abs(amount)}
            </span>
            <span className={cn(
                "uppercase font-bold opacity-70 tracking-widest",
                size === "sm" ? "text-[7px]" : "text-[8px]"
            )}>
                Credits
            </span>
        </div>
    )
}
