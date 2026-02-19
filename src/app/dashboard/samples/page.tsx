"use client"

import * as React from "react"
import Link from "next/link"
import {
    FileText,
    Mic2,
    Star,
    ChevronRight,
    Search,
    Filter,
    Sparkles,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SAMPLES = [
    { id: 1, type: "Writing", category: "Task 1", title: "Milk Consumption - Academic Task 1", score: 8.5, date: "2026-02-14" },
]

export default function SampleReportsPage() {
    const [filter, setFilter] = React.useState("All")

    const filteredSamples = SAMPLES.filter(s => filter === "All" || s.type === filter)

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-6xl mx-auto">
            {/* Title removed to avoid duplication with Header */}

            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                    <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl border w-fit">
                        {["All", "Writing"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    filter === f
                                        ? "bg-white text-primary shadow-md shadow-primary/5"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input
                                type="text"
                                placeholder="Search samples..."
                                className="bg-muted/10 border border-muted-foreground/10 h-12 pl-12 pr-6 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-muted-foreground/10">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSamples.map((sample) => (
                        <SampleCard key={sample.id} sample={sample} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function SampleCard({ sample }: { sample: any }) {
    return (
        <div className="bg-white border hover:border-primary/30 rounded-[32px] p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-purple-50 text-purple-600">
                    <FileText className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-black">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Band {sample.score}
                </div>
            </div>

            <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{sample.category}</div>
                <h4 className="text-lg font-black font-outfit group-hover:text-primary transition-colors leading-tight">{sample.title}</h4>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-muted-foreground">{sample.date}</span>
                <Link href={`/dashboard/reports/${sample.id}`}>
                    <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-xs">
                        View Sample
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
