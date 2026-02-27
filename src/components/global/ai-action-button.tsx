"use client"

import * as React from "react"
import { Sparkles, LucideIcon, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CreditBadge } from "@/components/ui/credit-badge"

interface AIActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    icon?: LucideIcon
    badge?: string
    isLoading?: boolean
    showChevron?: boolean
    variant?: "default" | "outline" | "ghost" | "secondary" | "shiny" | "neon"
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
    const variants = {
        outline: "rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary hover:text-white dark:hover:text-white text-primary dark:text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/5",
        shiny: "rounded-2xl border-white bg-white hover:bg-slate-50 text-primary font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20",
        neon: "rounded-2xl border-primary bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]",
        default: "rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary hover:text-white text-primary font-black uppercase tracking-[0.2em]",
        secondary: "rounded-2xl border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-[0.2em]",
        ghost: "rounded-2xl border-transparent bg-transparent hover:bg-primary/5 text-primary font-black uppercase tracking-[0.2em]",
    }

    const currentVariant = variants[variant as keyof typeof variants] || variants.outline

    return (
        <Button
            {...props}
            disabled={props.disabled || isLoading}
            variant="ghost"
            className={cn(
                "h-11 lg:h-13 px-8 lg:px-12 text-[10px] lg:text-[11px] transition-all duration-500 active:scale-95 group/ai-btn overflow-hidden relative border",
                currentVariant,
                className
            )}
        >
            <div className="flex items-center gap-4 relative z-10 w-full justify-center">
                <div className="relative flex items-center justify-center">
                    {isLoading ? (
                        <Loader2 className={cn(
                            "h-4 w-4 animate-spin",
                            variant === "neon" ? "text-white" : "text-primary group-hover/ai-btn:text-white"
                        )} />
                    ) : (
                        <>
                            <Icon className={cn(
                                "h-4 w-4 transition-colors",
                                variant === "neon" ? "text-white" : "text-primary group-hover/ai-btn:text-white"
                            )} />
                            <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover/ai-btn:opacity-100 transition-opacity" />
                        </>
                    )}
                </div>

                <span className="truncate">{label}</span>

                {badge && (
                    <CreditBadge
                        amount={parseInt(badge)}
                        size="sm"
                        className={cn(
                            "shrink-0 border-none shadow-lg",
                            variant === "neon" ? "bg-white text-primary shadow-white/20" : "bg-amber-500 text-white shadow-amber-500/30"
                        )}
                    />
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
