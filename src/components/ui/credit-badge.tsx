"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

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

    const iconSizes = {
        sm: "h-2.5 w-2.5",
        md: "h-3.5 w-3.5",
        lg: "h-4 w-4"
    }

    return (
        <div className={cn(
            "inline-flex items-center font-black transition-all shadow-sm border",
            isPositive
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-rose-50 text-rose-600 border-rose-100",
            sizeClasses[size],
            className
        )}>
            {showIcon && (
                <Star className={cn(
                    iconSizes[size],
                    isPositive ? "fill-emerald-500" : "fill-rose-400"
                )} />
            )}
            <span className="font-mono tracking-tighter">
                {isPositive ? "+" : ""}{amount}
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
