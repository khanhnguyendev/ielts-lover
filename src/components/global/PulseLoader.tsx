"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PulseLoaderProps {
    className?: string
    size?: "sm" | "md" | "lg"
    color?: "primary" | "white" | "red"
}

export function PulseLoader({
    className,
    size = "md",
    color = "primary"
}: PulseLoaderProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-10 h-10"
    }

    const dotSizeClasses = {
        sm: "w-1 h-1",
        md: "w-1.5 h-1.5",
        lg: "w-2.5 h-2.5"
    }

    const colorClasses = {
        primary: "bg-primary",
        white: "bg-white",
        red: "bg-red-500"
    }

    return (
        <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
            <div className={cn("relative animate-heart-pulse", sizeClasses[size])}>
                <div className={cn("absolute inset-0 rounded-full opacity-20 blur-sm", colorClasses[color])} />
                <div className={cn("relative rounded-full shadow-sm", colorClasses[color], sizeClasses[size])} />
            </div>
            <div className="flex gap-1">
                <div className={cn("rounded-full animate-bounce [animation-delay:-0.3s]", dotSizeClasses[size], colorClasses[color], "opacity-60")} />
                <div className={cn("rounded-full animate-bounce [animation-delay:-0.15s]", dotSizeClasses[size], colorClasses[color], "opacity-60")} />
                <div className={cn("rounded-full animate-bounce", dotSizeClasses[size], colorClasses[color], "opacity-60")} />
            </div>
        </div>
    )
}
