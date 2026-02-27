"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StarIcon } from "@/components/global/star-icon"

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
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-700 border-amber-500/20",
            sizeClasses[size],
            className
        )}>
            {showIcon && (
                <StarIcon
                    size={size === "lg" ? "md" : size === "md" ? "sm" : "xs"}
                />
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
