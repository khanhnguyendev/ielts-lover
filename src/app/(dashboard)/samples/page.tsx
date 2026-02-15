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
    { id: 2, type: "Speaking", category: "Part 2", title: "Describe a beautiful place", score: 9.0, date: "2026-02-13" },
    { id: 3, type: "Writing", category: "Task 2", title: "Environmental Protection - Essay", score: 7.5, date: "2026-02-12" },
    { id: 4, type: "Writing", category: "Task 1", title: "Carbon Emissions - General Task 1", score: 8.0, date: "2026-02-11" },
    { id: 5, type: "Speaking", category: "Part 1", title: "Talking about advertisements", score: 8.5, date: "2026-02-10" },
    { id: 6, type: "Speaking", category: "Part 3", title: "The future of urbanization", score: 7.5, date: "2026-02-09" }
]

export default function SampleReportsPage() {
    const [filter, setFilter] = React.useState("All")

    const filteredSamples = SAMPLES.filter(s => filter === "All" || s.type === filter)

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">Sample Reports</h1>
            </div>

            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                    <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl border w-fit">
                        {["All", "Writing", "Speaking"].map((f) => (
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

                {/* Premium Upsell */}
                <div className="bg-primary/5 rounded-[32px] p-10 flex flex-col items-center text-center space-y-6 border border-primary/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/10 mx-auto">
                            <Sparkles className="h-8 w-8 text-primary fill-primary/20" />
                        </div>
                        <h3 className="text-xl font-black font-outfit">Unlock 500+ Curated Samples</h3>
                        <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                            Get access to a massive library of high-scoring band 8.0-9.0 samples with detailed examiner notes.
                        </p>
                        <Button className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-[24px] font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            Upgrade to Premium
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SampleCard({ sample }: { sample: any }) {
    return (
        <div className="bg-white border hover:border-primary/30 rounded-[32px] p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    sample.type === "Writing" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                )}>
                    {sample.type === "Writing" ? <FileText className="h-6 w-6" /> : <Mic2 className="h-6 w-6" />}
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
                    <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl px-4 h-10">
                        View Sample
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
