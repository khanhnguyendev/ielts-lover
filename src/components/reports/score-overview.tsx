"use client"

import * as React from "react"
import { Sparkles, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getBandScoreConfig } from "@/lib/score-utils"

interface ScoreOverviewProps {
    score: number
    title?: string
    subtitle?: string
    showChatButton?: boolean
    onChatClick?: () => void
    className?: string
}

export function ScoreOverview({
    score,
    title = "Overall Band Score",
    subtitle = "CEFR Level",
    showChatButton = false,
    onChatClick,
    className
}: ScoreOverviewProps) {
    const config = getBandScoreConfig(score)

    return (
        <div className={cn(
            "rounded-[40px] border p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between shadow-sm relative overflow-hidden group gap-6 transition-all duration-500",
            config.bg,
            config.border,
            className
        )}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <Sparkles className={cn("h-40 w-40", config.color)} />
            </div>

            <div className="flex items-center gap-8 sm:gap-12 relative z-10">
                <div className="text-center">
                    <div className={cn("text-5xl sm:text-6xl font-black font-outfit flex items-baseline gap-1", config.color)}>
                        {score.toFixed(1)}
                        <span className="text-xl sm:text-2xl text-slate-400/40 font-bold">/9.0</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500/60 mt-1">{title}</p>
                </div>

                <div className="w-px h-16 bg-slate-200/50 mx-2 hidden sm:block" />

                <div className="text-center sm:text-left">
                    <div className={cn("text-3xl sm:text-4xl font-black font-outfit", config.color)}>
                        {config.cefr}
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500/60 mt-1">{subtitle}</p>
                </div>
            </div>

            {showChatButton && (
                <Button
                    onClick={onChatClick}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black text-sm shadow-xl shadow-primary/20 relative z-10 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <MessageCircle className="mr-2 h-5 w-5 fill-white" />
                    Chat with your personal AI tutor
                </Button>
            )}
        </div>
    )
}
