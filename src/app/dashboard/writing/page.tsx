"use client"

import * as React from "react"
import Link from "next/link"
import {
    Zap,
    ChevronDown,
    Sparkles,
    PenTool,
    Clock,
    FileText,
    Star,
    Plus,
    Heart,
    Cat,
    Activity,
    PieChart,
    BarChart,
    Map,
    Table,
    MessageSquare,
    Users,
    Globe,
    Mail,
    Info,
    ChevronRight,
    Search,
    Upload,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PulseLoader } from "@/components/global/PulseLoader"
import { PremiumBanner } from "@/components/dashboard/premium-banner"

const CATEGORIES = [
    "Mock Test",
    "Academic Task 1",
    "General Task 1",
    "Task 2",
    "Custom Question"
]

import { getExercises, getUserAttempts } from "@/app/actions"
import { Exercise as DbExercise, ExerciseType } from "@/types"

interface Exercise {
    id: string
    title: string
    subtitle?: string
    attempts?: number
    icon: any
    color: string
    isRecommended?: boolean
}

const TYPE_CONFIG: Record<string, { icon: any, color: string }> = {
    writing_task1: { icon: Activity, color: "text-blue-600 bg-blue-50" },
    writing_task2: { icon: FileText, color: "text-indigo-600 bg-indigo-50" },
    speaking_part1: { icon: MessageSquare, color: "text-cyan-600 bg-cyan-50" },
    // Add others as needed
}

export default function WritingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Mock Test")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [exercises, setExercises] = React.useState<Exercise[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchExercises = async () => {
            setIsLoading(true)
            try {
                let type: ExerciseType = "writing_task1"
                if (activeCategory === "Task 2") type = "writing_task2"

                // Fetch both exercises and attempts
                const [exercisesData, attemptsData] = await Promise.all([
                    getExercises(type),
                    getUserAttempts()
                ]);

                const adapted: Exercise[] = exercisesData.map((db: DbExercise) => {
                    // Count attempts for this exercise
                    const attemptCount = attemptsData.filter((a: any) => a.exercise_id === db.id).length;

                    return {
                        id: db.id,
                        title: db.title,
                        subtitle: db.type.replace("_", " ").toUpperCase(),
                        attempts: attemptCount,
                        icon: TYPE_CONFIG[db.type]?.icon || Cat,
                        color: TYPE_CONFIG[db.type]?.color || "text-purple-600 bg-purple-50"
                    };
                })

                setExercises(adapted)
            } catch (error) {
                console.error("Failed to fetch writing hub data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchExercises()
    }, [activeCategory])

    return (
        <div className="space-y-10 max-w-6xl mx-auto">

            <div className="bg-card rounded-[40px] border p-12 space-y-10 shadow-sm overflow-hidden relative">
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
                        <Button variant="outline" className="group-hover:border-primary/20">
                            All tasks <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Premium Banner */}
                <PremiumBanner
                    title="Premium Feature - Upgrade to Premium for unlimited mock tests"
                    buttonText="Upgrade to Premium"
                />

                {activeCategory === "Custom Question" ? (
                    <div className="space-y-8">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full bg-card border-2 border-dashed rounded-[32px] p-8 flex items-center gap-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                                <Plus className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">Click + to add a question you've found online or created yourself.</p>
                        </button>

                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="relative">
                                <Cat className="h-32 w-32 text-indigo-100" />
                                <div className="absolute -top-4 -right-4">
                                    <PenTool className="h-12 w-12 text-indigo-200" />
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
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                        <PulseLoader size="lg" color="primary" />
                        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                            Syncing Exercises...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCategory !== "Mock Test" && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-card border-2 border-dashed rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group text-center"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">Add Custom Task</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Add a question you've found elsewhere</p>
                                </div>
                            </button>
                        )}
                        {exercises.map((ex, i) => (
                            <ExerciseCard
                                key={i}
                                id={ex.id}
                                title={ex.title}
                                subtitle={ex.subtitle}
                                attempts={ex.attempts || 0}
                                icon={ex.icon}
                                color={ex.color}
                                isRecommended={ex.isRecommended}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-lg bg-white rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-[#F9FAFB] p-8 border-b text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border">
                            <Plus className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black font-outfit text-slate-900">
                                Add Custom Task
                            </DialogTitle>
                            <p className="text-muted-foreground font-medium text-sm mt-1">
                                Add a question you've found elsewhere or created yourself.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        {/* Writing task type */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] uppercase font-black tracking-widest text-slate-500 ml-1">Writing task type</label>
                            <button className="w-full h-14 px-6 rounded-2xl border bg-slate-50/50 flex items-center justify-between text-sm font-bold text-slate-900 hover:border-primary/40 hover:bg-white transition-all group outline-none">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    Academic Task 1
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        {/* Question title */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] uppercase font-black tracking-widest text-slate-500 ml-1">Question title</label>
                            <input
                                type="text"
                                className="w-full h-14 px-6 rounded-2xl border bg-slate-50/50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all placeholder:text-slate-400 outline-none"
                                placeholder="Example: Smartphone Ownership Trends"
                            />
                        </div>

                        {/* Question */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] uppercase font-black tracking-widest text-slate-500 ml-1">Question content</label>
                            <textarea
                                className="w-full min-h-[160px] p-6 rounded-2xl border bg-slate-50/50 text-sm font-medium leading-relaxed text-slate-700 resize-none focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all placeholder:text-slate-400 outline-none"
                                placeholder="Example: The diagram below illustrates the daily routine of a highly professional house cat..."
                            />
                        </div>

                        {/* Add visual */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] uppercase font-black tracking-widest text-slate-500 ml-1">
                                Add visual <span className="text-rose-500">*</span>
                            </label>
                            <div className="border-2 border-dashed rounded-[24px] p-8 bg-slate-50/50 flex flex-col items-center gap-4 text-center group hover:bg-primary/[0.02] hover:border-primary/30 transition-all cursor-pointer border-slate-200">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Upload className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">Click to upload image</p>
                                    <p className="text-[10px] font-medium text-slate-500 max-w-[240px]">
                                        Support JPG, PNG or WebP. Max size 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-12 font-bold flex-1">
                            Cancel
                        </Button>
                        <Button
                            variant="premium"
                            onClick={() => setIsAddModalOpen(false)}
                            className="h-12 flex-[2] shadow-lg shadow-primary/20"
                        >
                            Create Question
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ExerciseCard({
    id,
    title,
    subtitle,
    attempts,
    icon: Icon,
    color,
    isRecommended
}: {
    id: string,
    title: string,
    subtitle?: string,
    attempts: number,
    icon: any,
    color: string,
    isRecommended?: boolean
}) {
    return (
        <Link href={`/dashboard/writing/${id}`} className="block h-full transition-transform hover:scale-[1.02] duration-300">
            <div className="h-full bg-card border hover:border-primary/30 rounded-[28px] p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
                {isRecommended && (
                    <div className="absolute -top-2.5 right-6 bg-[#7C3AED] text-white text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20">
                        <Star className="h-2 w-2 fill-white" /> Recommended
                    </div>
                )}

                <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", color)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black font-outfit leading-tight text-foreground-primary pr-2">{title}</h4>
                            {subtitle && (
                                <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100/50">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-dashed pt-4">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        {attempts > 0 ? `${attempts} attempt${attempts > 1 ? 's' : ''}` : "No attempts yet"}
                    </p>
                    <div className="h-8 px-4 rounded-lg border border-muted-foreground/20 text-[10px] font-black uppercase tracking-widest flex items-center bg-transparent group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        {attempts > 0 ? <Plus className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                        {attempts > 0 ? "Start New" : "Start"}
                    </div>
                </div>
            </div>
        </Link>
    )
}
