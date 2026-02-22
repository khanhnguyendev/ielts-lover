"use client"

import * as React from "react"
import { Check, Star, ShieldCheck, Sparkles, CreditCard, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAvailablePackages } from "./actions"
import { useNotification } from "@/lib/contexts/notification-context"
import { CreditPackage } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"

const TYPE_CONFIG: Record<string, { icon: string; accent: string; badge?: string; lightColor: string }> = {
    starter: { icon: "🌱", accent: "border-slate-200 hover:border-primary/20", lightColor: "bg-slate-50" },
    pro: { icon: "🚀", accent: "border-primary ring-2 ring-primary/10 shadow-xl shadow-primary/5", badge: "Most Popular", lightColor: "bg-primary/5" },
    master: { icon: "👑", accent: "border-amber-400/50 hover:border-amber-400 ring-1 ring-amber-400/10 hover:ring-8 transition-all duration-500", lightColor: "bg-amber-50" },
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

    const handleBuyNow = async (_pkg: CreditPackage) => {
        notifyWarning(
            "Final Connection Stage",
            "We are currently finalizing the secure bridge to our payment gateway. Real StarCredits will be available to purchase within the next few days!",
            "Notify Me"
        )
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <PulseLoader size="lg" color="primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-12 space-y-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
                    {packages.map((pkg) => {
                        const config = TYPE_CONFIG[pkg.type] || TYPE_CONFIG.starter
                        const totalCredits = pkg.credits + pkg.bonus_credits
                        const isPro = pkg.type === "pro"

                        return (
                            <div
                                key={pkg.id}
                                className={cn(
                                    "relative bg-white rounded-[2.5rem] border p-8 flex flex-col gap-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 flex-1",
                                    config.accent,
                                    isPro && "shadow-xl shadow-primary/10"
                                )}
                            >
                                {config.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center gap-2 whitespace-nowrap z-20 border-4 border-white">
                                        <Sparkles className="h-3 w-3 fill-current" />
                                        {config.badge}
                                    </div>
                                )}

                                {/* Package Identity */}
                                <div className="text-center space-y-4 flex-1">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white", config.lightColor)}>
                                            {config.icon}
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{pkg.name}</h3>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline justify-center gap-3">
                                            <span className="text-5xl font-black font-outfit text-slate-900 tracking-tight">{totalCredits}</span>
                                            {pkg.bonus_credits > 0 && (
                                                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                    +{pkg.bonus_credits} BONUS
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">StarCredits Total</p>
                                    </div>

                                    <p className="text-xs font-medium text-slate-500 leading-relaxed px-2">{pkg.tagline}</p>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-slate-50 w-full" />

                                {/* Benefits List */}
                                <div className="space-y-3.5 px-2">
                                    <BenefitItem
                                        label={`${pkg.credits} Core Credits`}
                                        description="Full access to all exercise types"
                                    />
                                    <BenefitItem
                                        label="AI Video-Speaking Partner"
                                        description="Unlocked and limitless"
                                        badge="Soon"
                                    />
                                    <BenefitItem
                                        label="Lifetime Validity"
                                        description="Credits never expire"
                                    />
                                    <BenefitItem
                                        label="Deep Pattern Analysis"
                                        description="Advanced weakness reports"
                                    />
                                </div>

                                {/* Price & CTA */}
                                <div className="space-y-4 mt-auto">
                                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100/50">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black font-outfit text-slate-900">${pkg.price.toFixed(2)}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">USD</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleBuyNow(pkg)}
                                        className={cn(
                                            "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 active:scale-95 shadow-lg",
                                            isPro
                                                ? "bg-primary hover:bg-primary/90 text-white shadow-primary/30"
                                                : "bg-white border-2 border-slate-100 hover:border-primary/20 text-slate-900 shadow-slate-100 hover:shadow-primary/5"
                                        )}
                                    >
                                        Buy {pkg.name.split(' ')[0]} Now
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* 3. Global Trust Section */}
                <div className="bg-slate-50/50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-100">
                    <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                            <Shield size={28} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Secured Powered by Stripe</h4>
                            <p className="text-xs text-slate-500 font-medium">Your payment details are encrypted and processed securely by Stripe. We never store your card information.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 grayscale opacity-40">
                        <CreditCard size={24} />
                        <span className="text-lg font-black font-outfit text-slate-900 tracking-tighter uppercase">VISA</span>
                        <span className="text-lg font-black font-outfit text-slate-900 tracking-tighter uppercase">STRIPE</span>
                    </div>
                </div>

                {packages.length === 0 && !isLoading && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="text-4xl grayscale opacity-30 mb-4">🏪💤</div>
                        <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest">Storefront Currently Offline</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">We&apos;ll be back online with fresh packs shortly.</p>
                    </div>
                )}
            </div>

            <footer className="mt-auto py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-t border-slate-50 bg-white/50">
                © 2026 IELTS LOVER &nbsp; • &nbsp; SECURE CHECKOUT &nbsp; • &nbsp; STARCREDITS SYSTEM
            </footer>
        </div>
    )
}

function BenefitItem({ label, description, badge }: { label: string; description: string; badge?: string }) {
    return (
        <div className="flex items-start gap-3 group/item">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-all group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-white mt-0.5">
                <Check className="h-3 w-3 stroke-[4]" />
            </div>
            <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{label}</p>
                    {badge && (
                        <span className="text-[7px] font-black uppercase tracking-widest bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">{badge}</span>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-none">{description}</p>
            </div>
        </div>
    )
}
