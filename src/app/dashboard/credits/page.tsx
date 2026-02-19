"use client"

import * as React from "react"
import {
    Check,
    Zap,
    ShieldCheck,
    Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createCheckoutSession } from "./actions"
import { useNotification } from "@/lib/contexts/notification-context"

const BENEFITS = [
    { text: "Detailed feedback reports based on official criteria" },
    { text: "25+ mock tests in the real exam format" },
    { text: "Progress reports with strengths and weaknesses" },
    { text: "Personal Horsebot tutor for explanations" },
    { text: "Access to all previous results" }
]

const PACKAGES = [
    {
        id: "starter",
        name: "Band Booster",
        credits: 100,
        bonus: 0,
        price: 5.00,
        tagline: "Perfect for getting started.",
        icon: "🌱",
        description: "Friendly and beginner-focused.",
        benefits: [
            "100 StarCredits",
            "Access to all AI features",
            "Detailed feedback reports",
            "No expiration date"
        ]
    },
    {
        id: "pro",
        name: "Band Climber",
        credits: 500,
        bonus: 50,
        price: 20.00,
        tagline: "Best value for serious practice.",
        icon: "🚀",
        popular: true,
        description: "Visual: Add a purple “Most Popular” badge or subtle purple glow/border.",
        benefits: [
            "550 StarCredits (50 Bonus)",
            "Access to all AI features",
            "Priority support",
            "No expiration date"
        ]
    },
    {
        id: "master",
        name: "Band Mastery",
        credits: 1500,
        bonus: 200,
        price: 50.00,
        tagline: "Maximum power for heavy users.",
        icon: "👑",
        description: "Premium and goal-oriented.",
        benefits: [
            "1700 StarCredits (200 Bonus)",
            "Access to all AI features",
            "VIP personalized feedback",
            "No expiration date"
        ]
    }
]

export default function CreditsPage() {
    const { notifyError, notifyWarning } = useNotification()
    const handleBuyNow = async (packageId: string) => {
        notifyWarning(
            "Feature Coming Soon",
            "We are currently integrating our secure payment gateway. Real credit purchases will be available shortly!",
            "Got it"
        )
    }

    return (
        <div className="flex-1 w-full h-full overflow-y-auto">
            <div className="p-4 md:p-8 lg:p-12 space-y-10 max-w-6xl mx-auto pb-32">
                <div className="bg-white rounded-[32px] md:rounded-[40px] border shadow-sm flex flex-col overflow-hidden">
                    {/* Top Section */}
                    <div className="p-8 md:p-16 space-y-10 md:space-y-16 flex flex-col items-center">
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl md:text-4xl font-black font-outfit text-slate-900">Get StarCredits</h2>
                            <p className="text-sm md:text-base text-muted-foreground font-medium underline underline-offset-4 decoration-primary/30">Pay only for what you use. No subscriptions.</p>
                        </div>

                        {/* Packages Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                            {PACKAGES.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={cn(
                                        "relative bg-white rounded-[32px] md:rounded-[40px] border p-8 md:p-10 flex flex-col gap-6 md:gap-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5",
                                        pkg.popular ? "border-purple-500 ring-2 ring-purple-500/10 scale-100 md:scale-105 shadow-xl z-20" : "border-slate-100"
                                    )}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-300 flex items-center gap-2 whitespace-nowrap">
                                            <Star className="h-3 w-3 fill-current" />
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="space-y-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">{pkg.icon}</span>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{pkg.name}</h3>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-5xl md:text-6xl font-black font-outfit text-slate-900">{pkg.credits + pkg.bonus}</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">StarCredits</p>
                                        </div>
                                        <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed px-4">{pkg.tagline}</p>
                                    </div>

                                    <div className="bg-[#F9FAFB] rounded-[24px] md:rounded-[28px] p-6 md:p-8 space-y-1 text-center">
                                        <div className="text-2xl md:text-3xl font-black font-outfit">
                                            ${pkg.price.toFixed(2)} <span className="text-sm text-slate-400 font-medium">USD</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {pkg.benefits.map((benefit, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <Check className="h-3 w-3 stroke-[4]" />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <Button
                                            variant={pkg.popular ? "premium" : "outline"}
                                            size="lg"
                                            onClick={() => handleBuyNow(pkg.id)}
                                            className={cn(
                                                "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]",
                                                !pkg.popular && "border-slate-200 hover:border-primary hover:text-primary",
                                                pkg.popular && "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                                            )}
                                        >
                                            Buy Now
                                        </Button>

                                        <div className="flex justify-center items-center gap-2 grayscale opacity-40">
                                            <ShieldCheck className="h-3 w-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Secure Stripe Checkout</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
