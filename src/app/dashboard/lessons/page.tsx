"use client"

import * as React from "react"
import {
    BookOpen,
    Play,
    Clock,
    ChevronRight,
    Search,
    Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// import Link from "next/link"
import { getLessons } from "@/app/actions"
import { Lesson } from "@/types"
import { AppLoading } from "@/components/global/app-loading"

export default function LessonsHubPage() {
    // ---- COMING SOON OVERLAY FLAG ----
    const IS_COMING_SOON = true;

    const [lessons, setLessons] = React.useState<Lesson[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [filter, setFilter] = React.useState("All")

    React.useEffect(() => {
        async function loadLessons() {
            if (IS_COMING_SOON) return;

            try {
                const data = await getLessons()
                setLessons(data)
            } catch (error) {
                console.error("Failed to load lessons", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadLessons()
    }, [])

    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
        // We don't have a 'type' field in DB yet, so we treat all as 'Video' for filtering if they have a URL
        // const type = lesson.video_url ? "Writing" : "Other"
        // For now, simple mock filter logic or just ignore filter if it's "All"
        const matchesFilter = filter === "All" || true
        return matchesSearch && matchesFilter
    })

    if (IS_COMING_SOON) {
        return (
            <div className="flex-1 h-full overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-32 h-32 bg-sky-50 rounded-[2rem] shadow-sm flex items-center justify-center border-4 border-white ring-1 ring-sky-100 relative z-10">
                        <BookOpen className="h-14 w-14 text-sky-500" />
                    </div>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-xl border-[3px] border-white shadow-lg rotate-12 z-20 uppercase tracking-widest">
                        Coming Soon
                    </div>
                    <div className="absolute -inset-4 bg-sky-500/5 rounded-full blur-2xl -z-10" />
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-3xl lg:text-4xl font-black font-outfit text-slate-900 tracking-tight">
                        Lessons Hub
                    </h1>
                    <p className="text-base lg:text-lg font-medium text-slate-500 leading-relaxed">
                        We are curating a comprehensive library of video lessons and interactive guides to help you master every aspect of IELTS.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Under Development</p>
                </div>

                {/* HIDDEN ORIGINAL CONTENT */}
                <div className="hidden">
                    <p>{isLoading ? 'Loading' : ''}</p>
                    <p>{searchTerm}</p>
                    <p>{filter}</p>
                    <p>{filteredLessons.length}</p>
                </div>
            </div>
        )
    }

    if (isLoading) return <AppLoading />

    return (
        <div className="p-8 lg:p-12 space-y-10 max-w-6xl mx-auto">
            <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                    <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl border w-fit">
                        {["All", "Writing", "Speaking", "Grammar"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                                    filter === cat ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-foreground"
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-muted/10 border border-muted-foreground/10 h-12 pl-12 pr-6 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                        />
                    </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-4">
                    {filteredLessons.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No lessons found matching your criteria.
                        </div>
                    ) : (
                        filteredLessons.map((lesson) => (
                            <div key={lesson.id} className="group relative bg-white border hover:border-primary/30 rounded-[28px] p-6 flex items-center gap-8 shadow-sm hover:shadow-xl transition-all duration-300 ring-primary/5 hover:ring-8">
                                <div className={cn(
                                    "w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-lg",
                                    "bg-primary/10"
                                )}>
                                    {lesson.video_url ? <Play className="h-8 w-8 text-primary fill-primary" /> : <BookOpen className="h-8 w-8 text-primary" />}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-black font-outfit leading-tight group-hover:text-primary transition-colors">{lesson.title}</h4>
                                    </div>

                                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5" />
                                            15 mins {/* Mock duration for now */}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                                            {lesson.video_url ? "Video" : "Reading"}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                                </div>

                                {/* <Link href={`/dashboard/lessons/${lesson.id}`}>
                                    <Button
                                        variant="premium"
                                        className="w-full"
                                    >
                                        Start Lesson
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link> */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
