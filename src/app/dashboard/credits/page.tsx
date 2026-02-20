"use client"

import * as React from "react"
import { Check, Star, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAvailablePackages, createCheckoutSession } from "./actions"
import { useNotification } from "@/lib/contexts/notification-context"
import { CreditPackage } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"

const TYPE_CONFIG: Record<string, { icon: string; accent: string; badge?: string }> = {
    starter: { icon: "🌱", accent: "border-slate-200" },
    pro: { icon: "🚀", accent: "border-purple-500 ring-2 ring-purple-500/10", badge: "Most Popular" },
    master: { icon: "👑", accent: "border-amber-400 ring-1 ring-amber-400/20" },
}

export default function CreditsPage() {
    const { notifyWarning } = useNotification()
    const [packages, setPackages] = React.useState<CreditPackage[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        async function load() {
            try {
                const data = await getAvailablePackages()
                setPackages(data.filter(p => p.is_active).sort((a, b) => a.display_order - b.display_order))
            } catch (err) {
                console.error("Failed to load packages:", err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const handleBuyNow = async (pkg: CreditPackage) => {
        notifyWarning(
            "Feature Coming Soon",
            "We are currently integrating our secure payment gateway. Real credit purchases will be available shortly!",
            "Got it"
        )
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <PulseLoader size="lg" color="primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-1.5">
                    <h2 className="text-2xl font-black font-outfit text-slate-900">Get StarCredits</h2>
                    <p className="text-xs text-muted-foreground font-medium">Pay only for what you use. No subscriptions.</p>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                        const config = TYPE_CONFIG[pkg.type] || TYPE_CONFIG.starter
                        const totalCredits = pkg.credits + pkg.bonus_credits

                        return (
                            <div
                                key={pkg.id}
                                className={cn(
                                    "relative bg-white rounded-[28px] border p-6 flex flex-col gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
                                    config.accent,
                                    pkg.type === "pro" && "md:scale-[1.03] shadow-lg z-10"
                                )}
                            >
                                {config.badge && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-300 flex items-center gap-1.5 whitespace-nowrap">
                                        <Star className="h-2.5 w-2.5 fill-current" />
                                        {config.badge}
                                    </div>
                                )}

                                {/* Package Info */}
                                <div className="text-center space-y-3 pt-1">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-2xl">{config.icon}</span>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{pkg.name}</h3>
                                    </div>
                                    <div>
                                        <span className="text-4xl font-black font-outfit text-slate-900">{totalCredits}</span>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-0.5">StarCredits</p>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{pkg.tagline}</p>
                                </div>

                                {/* Price */}
                                <div className="bg-[#F9FAFB] rounded-2xl py-3 text-center">
                                    <span className="text-xl font-black font-outfit">${pkg.price.toFixed(2)}</span>
                                    <span className="text-[10px] text-slate-400 font-medium ml-1">USD</span>
                                </div>

                                {/* Benefits */}
                                <div className="flex-1 space-y-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Check className="h-2.5 w-2.5 stroke-[4]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">
                                            {pkg.credits} Credits{pkg.bonus_credits > 0 && ` + ${pkg.bonus_credits} Bonus`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Check className="h-2.5 w-2.5 stroke-[4]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">Access to all AI features</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Check className="h-2.5 w-2.5 stroke-[4]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">No expiration date</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Button
                                    variant={pkg.type === "pro" ? "default" : "outline"}
                                    onClick={() => handleBuyNow(pkg)}
                                    className={cn(
                                        "w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px]",
                                        pkg.type !== "pro" && "border-slate-200 hover:border-primary hover:text-primary",
                                        pkg.type === "pro" && "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                                    )}
                                >
                                    Buy Now
                                </Button>

                                <div className="flex justify-center items-center gap-1.5 grayscale opacity-40">
                                    <ShieldCheck className="h-2.5 w-2.5" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Secure Stripe Checkout</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {packages.length === 0 && !isLoading && (
                    <div className="text-center py-16 text-slate-400 font-bold text-sm">
                        No credit packages available at the moment.
                    </div>
                )}
            </div>
        </div>
    )
}
