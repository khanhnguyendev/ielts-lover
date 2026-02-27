"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check,
    Star,
    ShieldCheck,
    Sparkles,
    CreditCard,
    Zap,
    Shield,
    ArrowRight,
    Crown,
    Rocket,
    Sprout,
    ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAvailablePackages } from "./actions"
import { useNotification } from "@/lib/contexts/notification-context"
import { CreditPackage } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { NOTIFY_MSGS } from "@/lib/constants/messages"

const TYPE_CONFIG: Record<string, { icon: any; accent: string; badge?: string; lightColor: string; glow: string }> = {
    starter: {
        icon: Sprout,
        accent: "border-slate-200 dark:border-slate-800",
        lightColor: "bg-slate-50 dark:bg-slate-900/50",
        glow: "bg-slate-400/5"
    },
    pro: {
        icon: Rocket,
        accent: "border-primary/30 ring-2 ring-primary/5",
        badge: "Most Optimized",
        lightColor: "bg-primary/5 dark:bg-primary/10",
        glow: "bg-primary/10"
    },
    master: {
        icon: Crown,
        accent: "border-amber-400/30 ring-1 ring-amber-400/5",
        badge: "Elite Access",
        lightColor: "bg-amber-50 dark:bg-amber-900/10",
        glow: "bg-amber-500/10"
    },
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
            NOTIFY_MSGS.WARNING.MARKET_RATES.title,
            NOTIFY_MSGS.WARNING.MARKET_RATES.description,
            "Notify Me"
        )
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-6 bg-slate-50/20 dark:bg-slate-950/20">
                <PulseLoader size="lg" color="primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 animate-pulse">Syncing StarCredits Grid...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="p-4 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] text-white shadow-2xl">
                                <ShoppingBag size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Credit Store</h1>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">Fuel Your Neural Practice Journey</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl group">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active System</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Standard Transmission</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                            <Zap size={24} className="fill-current" />
                        </div>
                    </div>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
                    <AnimatePresence>
                        {packages.map((pkg, idx) => {
                            const config = TYPE_CONFIG[pkg.type] || TYPE_CONFIG.starter
                            const totalCredits = pkg.credits + pkg.bonus_credits
                            const isPro = pkg.type === "pro"
                            const Icon = config.icon

                            return (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className={cn(
                                        "relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border p-10 flex flex-col gap-10 transition-all duration-700 shadow-sm border-white/30 dark:border-slate-800/50 group",
                                        config.accent,
                                        isPro && "shadow-2xl shadow-primary/10 border-primary/20 scale-[1.02]"
                                    )}
                                >
                                    {/* Subtle Glow */}
                                    <div className={cn("absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000", config.glow)} />

                                    {config.badge && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 whitespace-nowrap z-20 border-4 border-white dark:border-slate-900">
                                            <Sparkles className="h-3 w-3 fill-current" />
                                            {config.badge}
                                        </div>
                                    )}

                                    {/* Identity */}
                                    <div className="text-center space-y-4 flex-1 z-10">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl border border-white dark:border-slate-800 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700", config.lightColor)}>
                                                <Icon size={32} className={cn(isPro ? "text-primary" : "text-slate-400 dark:text-slate-600")} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{pkg.name}</h3>
                                                <div className="flex items-baseline justify-center gap-3">
                                                    <span className="text-6xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter">{totalCredits}</span>
                                                    {pkg.bonus_credits > 0 && (
                                                        <div className="px-3 py-1 bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border-2 border-white dark:border-slate-900">
                                                            +{pkg.bonus_credits} BONUS
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary pt-1">StarCredits Total</p>
                                            </div>
                                        </div>

                                        <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed px-4 pt-4 opacity-80">{pkg.tagline}</p>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-4 px-2 z-10">
                                        <BenefitItem label={`${pkg.credits} Core Relay Credits`} description="Full neural access" />
                                        <BenefitItem label="AI Speaking Partner" description="Priority synthesis" badge="Unlocked" />
                                        <BenefitItem label="Lifetime Validity" description="No expiration protocol" />
                                        <BenefitItem label="Deep Analysis" description="Advanced error ledger" />
                                    </div>

                                    {/* Price & Action */}
                                    <div className="space-y-6 mt-auto z-10">
                                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] p-6 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-inner">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fixed Cost</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">One-time protocol</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className="text-3xl font-black font-outfit text-slate-900 dark:text-white">${pkg.price.toFixed(2)}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">USD</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleBuyNow(pkg)}
                                            className={cn(
                                                "w-full h-16 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 active:scale-95 shadow-3xl flex items-center justify-center gap-3 overflow-hidden group/btn",
                                                isPro
                                                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:shadow-primary/20"
                                                    : "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                                            )}
                                        >
                                            Initialize Purchase
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Secure Trust Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 border border-white/20 dark:border-slate-800/50 shadow-2xl"
                >
                    <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/10">
                            <Shield size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Striped Secure Encryption</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-lg uppercase tracking-wide opacity-70">
                                All transmissions are encrypted. We utilize Stripe’s global protocol for banking-grade security. No card data stored in our local grid.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-10 grayscale opacity-30 invert dark:invert-0 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                        <CreditCard size={32} />
                        <span className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-widest uppercase">STRIPE</span>
                    </div>
                </motion.div>

                {packages.length === 0 && !isLoading && (
                    <div className="text-center py-32 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="text-6xl animate-bounce mb-6 opacity-30 grayscale">💤</div>
                        <h4 className="text-xl font-black text-slate-600 dark:text-slate-400 mt-2 tracking-tight">Transmission Interrupted</h4>
                        <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-[0.3em]">Storefront Currently Unavailable</p>
                    </div>
                )}
            </div>

            <footer className="mt-auto py-12 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                IELTS LOVER STARCREDIT SYSTEM &nbsp; • &nbsp; SECURE CHECKOUT PROTOCOL
            </footer>
        </div>
    )
}

function BenefitItem({ label, description, badge }: { label: string; description: string; badge?: string }) {
    return (
        <div className="flex items-start gap-5 group/item cursor-default">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-all duration-500 group-hover/item:scale-125 group-hover/item:bg-primary group-hover/item:text-white mt-0.5 shadow-sm">
                <Check className="h-3 w-3 stroke-[4]" />
            </div>
            <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase">{label}</p>
                    {badge && (
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-lg border border-white dark:border-slate-900">{badge}</span>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest opacity-80">{description}</p>
            </div>
        </div>
    )
}
