"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Sparkles, Plus } from "lucide-react"

interface StarsBalanceProps {
    balance: number
    className?: string
}

export function StarsBalance({ balance, className }: StarsBalanceProps) {
    const [animation, setAnimation] = React.useState<{ type: 'decrement' | 'increment', amount: number, id: number } | null>(null)
    const [displayBalance, setDisplayBalance] = React.useState(balance)

    // Sync display balance when prop changes from parent (server sync)
    React.useEffect(() => {
        setDisplayBalance(balance)
    }, [balance])

    React.useEffect(() => {
        const handleCreditChange = (e: any) => {
            const { amount } = e.detail

            // Optimistic update of the displayed number
            setDisplayBalance(prev => prev + amount)

            setAnimation({
                type: amount < 0 ? 'decrement' : 'increment',
                amount: amount,
                id: Date.now()
            })

            const timer = setTimeout(() => setAnimation(null), 2000)
            return () => clearTimeout(timer)
        }

        window.addEventListener('credit-change', handleCreditChange)
        return () => window.removeEventListener('credit-change', handleCreditChange)
    }, [])

    return (
        <div className="relative group/balance">
            <Link
                href="/dashboard/credits"
                className={cn(
                    "group relative flex items-center gap-2.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl px-3.5 py-1.5 rounded-[1.25rem] border border-white/20 dark:border-slate-800/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/20 active:scale-95",
                    className
                )}
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[1.25rem]" />

                <div className="flex items-center justify-center w-6 h-6 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-amber-500/20 relative z-10">
                    <span className="text-[11px] leading-none select-none drop-shadow-sm">⭐</span>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                        {(displayBalance || 0).toLocaleString()}
                    </span>

                    <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-slate-900/5 dark:bg-white/5 group-hover:bg-primary transition-all duration-500 border border-slate-200/50 dark:border-white/5">
                        <Plus className="h-3 w-3 text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Subtle Sparkle on Hover */}
                <Sparkles className="absolute -top-1.5 -right-1.5 h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125 animate-pulse" />
            </Link>

            {/* Animation Badge */}
            {animation && (
                <div
                    key={animation.id}
                    className={cn(
                        "absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none animate-credit-float flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-lg z-50",
                        animation.type === 'decrement'
                            ? "bg-rose-500 text-white shadow-rose-500/20"
                            : "bg-emerald-500 text-white shadow-emerald-500/20"
                    )}
                >
                    {animation.amount > 0 ? `+${animation.amount}` : animation.amount}
                </div>
            )}

            <style jsx global>{`
                @keyframes credit-float {
                    0% { transform: translate(-50%, 0); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translate(-50%, -24px); opacity: 0; }
                }
                .animate-credit-float {
                    animation: credit-float 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    )
}
