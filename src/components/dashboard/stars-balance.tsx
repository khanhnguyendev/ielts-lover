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
        <div className="relative">
            <Link
                href="/dashboard/credits"
                className={cn(
                    "group relative flex items-center gap-1.5 bg-yellow-50/50 hover:bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200/50 hover:border-yellow-200 shadow-sm transition-all active:scale-95",
                    className
                )}
            >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 group-hover:rotate-12 transition-transform shadow-sm">
                    <span className="text-[10px] leading-none select-none">⭐</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-yellow-700 tracking-tight">
                        {displayBalance.toLocaleString()}
                    </span>

                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500 transition-colors">
                        <Plus className="h-2.5 w-2.5 text-yellow-600 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Subtle Sparkle on Hover */}
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
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
