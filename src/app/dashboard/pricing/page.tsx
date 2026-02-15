"use client"

import * as React from "react"
import {
    CalendarDays,
    Check,
    ChevronDown,
    HelpCircle,
    Sparkles,
    Zap,
    Star,
    ShieldCheck,
    TrendingUp,
    MessageCircle,
    History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const BENEFITS = [
    { icon: Sparkles, text: "Unlimited reports*" },
    { icon: Star, text: "Scoring and feedback based on official criteria" },
    { icon: ShieldCheck, text: "25+ mock tests in the real exam format" },
    { icon: TrendingUp, text: "Progress reports with strengths and weaknesses" },
    { icon: MessageCircle, text: "An AI tutor that explains everything like a real coach" },
    { icon: History, text: "Access to all previous results" }
]

export default function PricingPage() {
    const [days, setDays] = React.useState(3)
    const pricePerDay = 4
    const totalPrice = days * pricePerDay

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">Pricing</h1>
            </div>

            <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden min-h-[800px] flex flex-col">
                {/* Top Section */}
                <div className="p-16 space-y-12 flex flex-col items-center">
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl font-black font-outfit text-slate-900">Get Premium</h2>
                        <p className="text-muted-foreground font-medium">Get a plan for exactly the days you need!</p>
                    </div>

                    {/* Config Card */}
                    <div className="w-full max-w-lg space-y-8">
                        {/* Exam Date */}
                        <div className="bg-[#F9FAFB] rounded-[32px] border p-6 flex items-center justify-between group hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <CalendarDays className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-bold">Exam date</span>
                            </div>
                            <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold px-6 h-11 hover:text-primary">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Select date
                            </Button>
                        </div>

                        {/* Slider Section */}
                        <div className="bg-white rounded-[32px] border p-10 space-y-10 shadow-sm relative">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Select the days you need</span>
                                <div className="bg-[#FAF9FF] border border-primary/10 rounded-xl px-4 py-2 flex items-center gap-3">
                                    <span className="text-xl font-black text-primary">{days}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 pt-1">days</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Slider
                                    value={[days]}
                                    min={3}
                                    max={365}
                                    step={1}
                                    onValueChange={(v: number[]) => setDays(v[0])}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    <span>3 days (min)</span>
                                    <span>365 days</span>
                                </div>
                            </div>

                            {days >= 30 && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200/50 flex items-center gap-2">
                                    <Zap className="h-3 w-3 fill-current" />
                                    Get 25% discount for 30+ days
                                </div>
                            )}

                            <div className="bg-[#F9FAFB] rounded-[28px] p-8 space-y-1 text-center">
                                <div className="text-3xl font-black font-outfit">
                                    {totalPrice.toFixed(2)} USD
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    {pricePerDay.toFixed(2)} USD/day × {days} days
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 flex items-center text-sm font-bold">
                                        United States Dollar (USD)
                                    </div>
                                </div>

                                <Button className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    Buy now
                                </Button>

                                <button className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">
                                    View sample premium reports
                                </button>

                                <div className="pt-6 border-t flex flex-col items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Secure Payment via Stripe</span>
                                    <div className="flex gap-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                        <div className="h-4 w-8 bg-slate-200 rounded-sm" />
                                        <div className="h-4 w-8 bg-slate-200 rounded-sm" />
                                        <div className="h-4 w-8 bg-slate-200 rounded-sm" />
                                        <div className="h-4 w-8 bg-slate-200 rounded-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="flex-1 bg-[#F9FAFB] border-t p-16 flex flex-col items-center">
                    <div className="w-full max-w-4xl space-y-12">
                        <h3 className="text-2xl font-black font-outfit text-center">Premium Benefits</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white rounded-[40px] border p-12 shadow-sm">
                            {BENEFITS.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <Check className="h-3.5 w-3.5 stroke-[4]" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{benefit.text}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-[10px] leading-relaxed text-muted-foreground/60 max-w-2xl mx-auto text-center font-medium italic">
                            Fair Usage Policy: Our unlimited packages are designed to provide maximum value and flexibility. However, to ensure fair and optimal access for all users, accounts demonstrating extraordinarily high usage significantly exceeding average consumption may be reviewed and contacted to discuss their needs and explore tailored solutions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
