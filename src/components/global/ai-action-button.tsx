"use client"

import * as React from "react"
import { Sparkles, LucideIcon, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AIActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    icon?: LucideIcon
    badge?: string
    isLoading?: boolean
    showChevron?: boolean
    variant?: "default" | "outline" | "ghost" | "secondary"
}

export function AIActionButton({
    label,
    icon: Icon = Sparkles,
    badge,
    isLoading,
    showChevron = false,
    className,
    variant = "outline",
    ...props
}: AIActionButtonProps) {
    return (
        <Button
            {...props}
            disabled={props.disabled || isLoading}
            variant={variant}
            className={cn(
                "rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary hover:text-white dark:hover:text-white text-primary dark:text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/5 transition-all duration-500 active:scale-95 group/ai-btn overflow-hidden relative",
                "h-11 lg:h-13 px-8 lg:px-12 text-[10px] lg:text-[11px]",
                className
            )}
        >
            <div className="flex items-center gap-4 relative z-10 w-full justify-center">
                <div className="relative flex items-center justify-center">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary group-hover/ai-btn:text-white" />
                    ) : (
                        <>
                            <Icon className="h-4 w-4 text-primary group-hover/ai-btn:text-white transition-colors" />
                            <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover/ai-btn:opacity-100 transition-opacity" />
                        </>
                    )}
                </div>

                <span className="truncate">{label}</span>

                {badge && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500 text-[8px] text-white leading-none shadow-lg shadow-amber-500/30">
                        {badge}
                    </span>
                )}

                {showChevron && !isLoading && (
                    <ChevronRight size={16} className="shrink-0 group-hover/ai-btn:translate-x-1 transition-transform opacity-50" />
                )}
            </div>

            {/* Subtle glow reveal on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 -translate-x-full group-hover/ai-btn:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </Button>
    )
}
