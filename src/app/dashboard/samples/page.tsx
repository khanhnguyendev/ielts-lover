"use client"

import * as React from "react"
import Link from "next/link"
import {
    Mic2,
    Star,
    Search,
    Sparkles,
    ArrowRight,
    PenTool,
    BookOpen,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"

interface Sample {
    id: number;
    type: string;
    category: string;
    title: string;
    score: number;
    date: string;
    cefr: string;
    description: string;
}

const SAMPLES: Sample[] = [
    {
        id: 1,
        type: "Writing",
        category: "Academic Task 1",
        title: "Milk Consumption - Academic Task 1",
        score: 8.5,
        date: "2026-02-14",
        cefr: "C2",
        description: "A high-scoring report analyzing trends in dairy consumption across five countries."
    },
]

export default function SampleReportsPage() {
    const [filter, setFilter] = React.useState("All")
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredSamples = SAMPLES.filter(s => {
        const matchesFilter = filter === "All" || s.type === filter
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <BookOpen size={120} />
                    </div>

                    <div className="space-y-1 text-center md:text-left relative z-10">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles size={16} />
                            </div>
                            <h2 className="text-xl font-black font-outfit text-slate-900 tracking-tight uppercase">Sample Reports</h2>
                        </div>
                        <p className="text-xs font-medium text-slate-500">Expert-analyzed reports for Band 7.0 - 9.0</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto relative z-10">
                        <div className="relative group/input w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search benchmarks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border border-slate-100 h-12 pl-12 pr-6 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full placeholder:text-slate-400"
                            />
                        </div>
                        <FilterGroup
                            label="Type"
                            options={[
                                { value: "All", label: "All" },
                                { value: "Writing", label: "Writing" },
                                { value: "Speaking", label: "Speaking" }
                            ]}
                            value={filter}
                            onChange={setFilter}
                        />
                    </div>
                </div>

                {/* Content */}
                {filteredSamples.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="text-6xl mb-4 grayscale opacity-30">🔍</div>
                        <h3 className="text-lg font-black text-slate-900">No samples found</h3>
                        <p className="text-xs font-medium text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSamples.map((sample) => (
                            <SampleCard key={sample.id} sample={sample} />
                        ))}
                    </div>
                )}
            </div>

            <footer className="mt-auto py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-50 bg-white/50">
                © 2026 IELTS LOVER &nbsp; • &nbsp; QUALITY BENCHMARKS
            </footer>
        </div>
    )
}

function SampleCard({ sample }: { sample: Sample }) {
    const isWriting = sample.type === "Writing"

    return (
        <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-7 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white transition-transform group-hover:scale-110 group-hover:rotate-3",
                    isWriting ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                )}>
                    {isWriting ? <PenTool size={20} /> : <Mic2 size={20} />}
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black border border-emerald-100">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        BAND {sample.score}
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-widest">{sample.cefr} LEVEL</span>
                </div>
            </div>

            <div className="space-y-2 mb-6 flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sample.category}</div>
                <h4 className="text-lg font-black font-outfit text-slate-900 leading-tight group-hover:text-primary transition-colors">{sample.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{sample.description}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} className="opacity-60" />
                    {formatDate(sample.date, false)}
                </div>
                <Link href={`/dashboard/reports/${sample.id}`}>
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-primary hover:bg-primary/5 px-4">
                        View Sample
                        <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

interface FilterGroupProps {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (val: string) => void;
}

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:inline">{label}</span>
            <div className="flex gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap",
                            value === opt.value
                                ? "bg-white text-slate-900 shadow-sm shadow-slate-200 ring-1 ring-slate-100"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
