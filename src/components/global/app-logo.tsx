"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface AppLogoProps {
    className?: string
    collapsed?: boolean
    showText?: boolean
}

export function AppLogo({ className, collapsed = false, showText = true }: AppLogoProps) {
    return (
        <div className={cn("flex items-center gap-3 group px-1", className)}>
            <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg shadow-primary/25 relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Sparkles size={20} className="drop-shadow-sm" />
                </div>
            </div>

            {showText && !collapsed && (
                <div className="flex flex-col -space-y-1">
                    <span className="font-black text-sm tracking-tight uppercase font-outfit text-slate-900 dark:text-white">
                        IELTS<span className="text-primary ml-1">Lover</span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
                        Neural Lab
                    </span>
                </div>
            )}
        </div>
    )
}
