"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StarIconProps {
    className?: string
    size?: "xs" | "sm" | "md" | "lg"
    containerClassName?: string
}

export function StarIcon({ className, size = "md", containerClassName }: StarIconProps) {
    const sizeClasses = {
        xs: "w-4 h-4 text-[8px]",
        sm: "w-5 h-5 text-[10px]",
        md: "w-6 h-6 text-[11px]",
        lg: "w-10 h-10 text-[18px]"
    }

    return (
        <div className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-500/20 shrink-0",
            sizeClasses[size],
            containerClassName
        )}>
            <span className={cn("leading-none select-none drop-shadow-sm", className)}>⭐</span>
        </div>
    )
}
