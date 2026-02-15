"use client"

import * as React from "react"
import {
    BookOpen,
    Play,
    Clock,
    ChevronRight,
    Star,
    Search,
    Filter,
    CheckCircle2,
    Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"

const LESSONS = [
    { id: 1, title: "IELTS Writing Task 1: Complete Guide", type: "Video", duration: "45 mins", progress: 100, premium: false },
    { id: 2, title: "Mastering Lexical Resource for Band 8.0", type: "Reading", duration: "20 mins", progress: 40, premium: false },
    { id: 3, title: "Speaking Part 2 Structure", type: "Video", duration: "30 mins", progress: 0, premium: true },
    { id: 4, title: "Common Grammar Mistakes in IELTS", type: "Reading", duration: "15 mins", progress: 0, premium: true },
    { id: 5, title: "Academic vs General Writing", type: "Video", duration: "25 mins", progress: 0, premium: false },
    { id: 6, title: "Advanced Pronunciation Techniques", type: "Video", duration: "50 mins", progress: 0, premium: true }
]

export default function LessonsHubPage() {
    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">Lessons & Guides</h1>
            </div>

            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                    <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl border w-fit">
                        {["All", "Writing", "Speaking", "Grammar"].map((cat) => (
                            <button
                                key={cat}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                                    cat === "All" ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            className="bg-muted/10 border border-muted-foreground/10 h-12 pl-12 pr-6 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                        />
                    </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-4">
                    {LESSONS.map((lesson) => (
                        <div key={lesson.id} className="group relative bg-white border hover:border-primary/30 rounded-[28px] p-6 flex items-center gap-8 shadow-sm hover:shadow-xl transition-all duration-300 ring-primary/5 hover:ring-8">
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-lg",
                                lesson.premium ? "bg-purple-100/50" : "bg-primary/10"
                            )}>
                                {lesson.premium ? (
                                    <Lock className="h-8 w-8 text-primary/40" />
                                ) : (
                                    lesson.type === "Video" ? <Play className="h-8 w-8 text-primary fill-primary" /> : <BookOpen className="h-8 w-8 text-primary" />
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-black font-outfit leading-tight group-hover:text-primary transition-colors">{lesson.title}</h4>
                                    {lesson.premium && (
                                        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-current" />
                                            Premium
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" />
                                        {lesson.duration}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                                        {lesson.type}
                                    </div>
                                </div>

                                {lesson.progress > 0 && (
                                    <div className="w-48 space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-primary">{lesson.progress}% Complete</span>
                                        </div>
                                        <Progress value={lesson.progress} className="h-1.5 bg-primary/10" />
                                    </div>
                                )}
                            </div>

                            <Link href={lesson.premium ? "/dashboard/pricing" : `/dashboard/lessons/${lesson.id}`}>
                                <Button className={cn(
                                    "h-14 px-8 rounded-2xl font-black text-sm transition-all w-full",
                                    lesson.premium
                                        ? "bg-muted text-muted-foreground/60 hover:bg-muted"
                                        : "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-105"
                                )}>
                                    {lesson.progress === 100 ? "Review Lesson" : lesson.progress > 0 ? "Continue" : "Start Now"}
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
