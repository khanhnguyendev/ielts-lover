"use client"

import * as React from "react"
import Link from "next/link"
import {
    Mic2,
    ChevronDown,
    Zap,
    Play,
    Plus,
    Heart,
    Cat,
    MessageSquare,
    LayoutGrid,
    Coffee,
    Cloud
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const CATEGORIES = [
    "Mock Test",
    "Part 1",
    "Part 2",
    "Part 3",
    "Custom Question"
]

interface Exercise {
    title: string
    subtitle?: string
    attempts?: number
    icon: React.ElementType
    color: string
    isRecommended?: boolean
    badge?: {
        text: string
        color: "yellow" | "green"
    }
}

export default function SpeakingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Mock Test")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

    const getExercises = (): Exercise[] => {
        if (activeCategory === "Mock Test") {
            return Array.from({ length: 18 }).map((_, i) => ({
                title: `Complete Speaking Mock Test ${i + 1}`,
                attempts: 0,
                icon: i % 3 === 0 ? Cat : i % 3 === 1 ? Heart : Coffee,
                color: i % 3 === 0 ? "text-purple-600 bg-purple-50" : i % 3 === 1 ? "text-pink-500 bg-pink-50" : "text-blue-500 bg-blue-50",
                badge: { text: "Full Mock Test", color: "yellow" }
            }))
        }
        if (activeCategory === "Part 1") {
            return [
                { title: "Advertisement", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Animals", badge: { text: "Practice Topic", color: "yellow" }, icon: Cat, color: "text-emerald-600 bg-emerald-50" },
                { title: "Art", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Art/drawing", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Bags", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Being happy", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Bicycles", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Bikes", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Books and reading habits", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Boredom", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Borrowing/lending", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                { title: "Cars", badge: { text: "Practice Topic", color: "yellow" }, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" }
            ]
        }
        return []
    }

    const exercises = getExercises()

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
                                {cat === "Mock Test" && (
                                    <span className="absolute -top-2 -left-2 bg-[#7C3AED] text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest">Beta</span>
                                )}
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Button variant="outline" className="h-11 rounded-1.5xl px-5 text-xs font-bold border-muted-foreground/10 group-hover:border-primary/20 transition-all">
                            <LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground" />
                            Popular Topics <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
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
                        <p className="text-sm font-bold text-[#4338CA]">Premium Feature - Upgrade to Premium for unlimited mock tests</p>
                    </div>
                    <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-11 px-6 rounded-xl font-black text-xs shadow-xl shadow-[#7C3AED]/20 relative z-10">
                        Upgrade to Premium
                    </Button>
                </div>

                {activeCategory === "Custom Question" ? (
                    <div className="space-y-8">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full bg-white border-2 border-dashed rounded-[32px] p-8 flex items-center gap-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black font-outfit">Add Custom Question</h3>
                                <p className="text-sm font-bold text-slate-600">Add a speaking question you&apos;ve found elsewhere</p>
                            </div>
                        </button>

                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="relative">
                                <Cat className="h-32 w-32 text-indigo-100" />
                                <div className="absolute -top-4 -right-4">
                                    <Mic2 className="h-12 w-12 text-indigo-200" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black font-outfit text-slate-900">Just waiting here for you to add your first question.</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                                    You can record your answer or upload a recording after adding the question.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCategory !== "Mock Test" && activeCategory !== "Custom Question" && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-white border-2 border-dashed rounded-[28px] p-6 flex items-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group text-left min-h-[140px]"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-black font-outfit">Add Custom Question</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Add a question you&apos;ve found elsewhere</p>
                                </div>
                            </button>
                        )}
                        {exercises.map((ex, i) => (
                            <SpeakingCard
                                key={i}
                                title={ex.title}
                                _subtitle={ex.subtitle}
                                _attempts={0}
                                icon={ex.icon}
                                color={ex.color}
                                badge={ex.badge}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Custom Question Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-[40px] p-10">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-black font-outfit text-center">Add a custom question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Speaking task type */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Speaking task type</label>
                            <button className="w-full h-14 px-5 rounded-2xl border bg-white flex items-center justify-between text-sm font-medium hover:border-primary/40 transition-all group outline-none">
                                Part 1 <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        {/* Question */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Question</label>
                            <textarea
                                className="w-full min-h-[160px] p-5 rounded-2xl border bg-[#F9FAFB] text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 outline-none"
                                placeholder="Example: Do you like advertisements?"
                            />
                        </div>

                        {/* Question title */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Question title</label>
                            <input
                                type="text"
                                className="w-full h-14 px-5 rounded-2xl border bg-[#F9FAFB] text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 outline-none"
                                placeholder="Example: Advertisement"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(false)}
                        className="w-full h-14 rounded-2xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-sm shadow-xl shadow-indigo-900/20"
                    >
                        Add Question
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function SpeakingCard({
    title,
    _subtitle,
    _attempts,
    icon: Icon,
    color,
    badge
}: {
    title: string,
    _subtitle?: string,
    _attempts: number,
    icon: React.ElementType,
    color: string,
    badge?: { text: string, color: "yellow" | "green" }
}) {
    return (
        <div className="bg-white border hover:border-primary/30 rounded-[28px] p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
            <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", color)}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold font-outfit leading-tight group-hover:text-primary transition-colors pr-2">{title}</h4>
                        {badge && (
                            <span className={cn(
                                "inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold border",
                                badge.color === "yellow" ? "bg-amber-50 text-amber-600 border-amber-100/50" : "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                            )}>
                                {badge.text}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-dashed pt-4">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">No attempts yet</p>
                <Link href={`/dashboard/speaking/calibrate?test=${title.toLowerCase().replace(/ /g, "-")}`}>
                    <Button variant="outline" className="h-8 px-4 rounded-lg border-muted-foreground/20 text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        <Play className="h-3 w-3 mr-1 fill-current" /> Start
                    </Button>
                </Link>
            </div>
        </div>
    )
}

