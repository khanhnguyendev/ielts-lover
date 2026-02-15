"use client"

import * as React from "react"
import Link from "next/link"
import {
    Mic2,
    ChevronDown,
    Sparkles,
    History,
    Star,
    Zap,
    Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = [
    "Part 1",
    "Part 2",
    "Part 3",
    "Full Test",
    "Custom Question"
]

export default function SpeakingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Part 1")

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">Speaking Tasks</h1>
            </div>

            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
                {/* Category Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                    <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl border w-fit">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative",
                                    activeCategory === cat
                                        ? "bg-white text-primary shadow-md shadow-primary/5"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Button variant="outline" className="h-11 rounded-1.5xl px-5 text-xs font-bold border-muted-foreground/10 group-hover:border-primary/20 transition-all">
                            All tasks <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Premium Banner */}
                <div className="bg-[#EEF2FF] rounded-[24px] p-5 flex items-center justify-between border border-[#E0E7FF] group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                        <Zap className="h-20 w-20 text-[#4F46E5] fill-[#4F46E5]" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-[#4F46E5] p-2.5 rounded-xl shadow-lg shadow-[#4F46E5]/20">
                            <Zap className="h-5 w-5 text-white fill-white" />
                        </div>
                        <p className="text-sm font-bold text-[#4338CA]">Premium Feature - Upgrade to Premium for unlimted speaking tests</p>
                    </div>
                    <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-11 px-6 rounded-xl font-black text-xs shadow-xl shadow-[#7C3AED]/20 relative z-10">
                        Upgrade to Premium
                    </Button>
                </div>

                {/* Exercises Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <SpeakingCard
                            key={i}
                            title={`${activeCategory} Speaking Mock Test ${i + 1}`}
                            attempts={0}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function SpeakingCard({ title, attempts }: { title: string, attempts: number }) {
    return (
        <div className="bg-white border hover:border-primary/30 rounded-[28px] p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group ring-primary/5 hover:ring-8">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <Mic2 className="h-6 w-6" />
                </div>
            </div>

            <div className="space-y-1">
                <h4 className="text-sm font-bold font-outfit leading-tight group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{attempts > 0 ? `${attempts} attempts` : "No attempts yet"}</p>
            </div>

            <Link href={`/speaking/calibrate?test=${title.toLowerCase().replace(/ /g, "-")}`} className="mt-auto">
                <Button variant="outline" className="w-full h-11 rounded-1.5xl border-muted-foreground/20 text-xs font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    Start
                </Button>
            </Link>
        </div>
    )
}
