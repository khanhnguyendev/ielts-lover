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
import { PulseLoader } from "@/components/global/PulseLoader"
import { PremiumBanner } from "@/components/dashboard/premium-banner"

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

import { getExercises, checkFeatureAccess } from "@/app/actions"
import { Exercise as DbExercise, ExerciseType } from "@/types"

export default function SpeakingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Mock Test")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [exercises, setExercises] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasMockAccess, setHasMockAccess] = React.useState(true)

    React.useEffect(() => {
        async function fetchExercises() {
            setIsLoading(true)
            setExercises([]) // Clear immediately to prevent leakage from previous tab
            try {
                // Check access if it's mock test
                if (activeCategory === "Mock Test") {
                    const access = await checkFeatureAccess("mock_test");
                    setHasMockAccess(access);
                    if (!access) {
                        setExercises([]);
                        setIsLoading(false);
                        return;
                    }
                } else {
                    setHasMockAccess(true);
                }

                let type: ExerciseType = "speaking_part1"
                if (activeCategory === "Part 2") type = "speaking_part2"
                if (activeCategory === "Part 3") type = "speaking_part3"

                const data = await getExercises(type)

                const adapted = data.map(db => ({
                    title: db.title,
                    subtitle: db.type.replace("_", " ").toUpperCase(),
                    attempts: 0,
                    icon: db.type === "speaking_part2" ? MessageSquare : Cat,
                    color: db.type === "speaking_part2" ? "text-indigo-600 bg-indigo-50" : "text-emerald-600 bg-emerald-50",
                    badge: { text: "Practice Topic", color: "yellow" }
                }))

                setExercises(adapted)
            } catch (error) {
                console.error("Failed to fetch exercises:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchExercises()
    }, [activeCategory])

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-8 lg:p-12 space-y-10 max-w-6xl mx-auto">

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
                                <LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground" />
                                Popular Topics <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>


                    {activeCategory === "Custom Question" ? (
                        <div className="space-y-8">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full bg-card border-2 border-dashed rounded-[32px] p-8 flex items-center gap-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
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
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                            <PulseLoader size="lg" color="primary" />
                            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                                Syncing Exercises...
                            </p>
                        </div>
                    ) : !hasMockAccess ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center border-2 border-primary/20">
                                <Zap className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black font-outfit text-slate-900 uppercase tracking-tight">Mock Tests are Premium Features</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                                    Unlock full length mock tests and detailed AI scoring by upgrading to premium.
                                </p>
                            </div>
                            <Link href="/dashboard/pricing">
                                <Button variant="premium" size="lg" className="px-10">
                                    Upgrade Now
                                </Button>
                            </Link>
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
                                <SpeakingCard
                                    key={i}
                                    id={ex.id}
                                    title={ex.title}
                                    subtitle={ex.subtitle}
                                    attempts={ex.attempts || 0}
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
                    <DialogContent className="sm:max-w-md bg-card rounded-[40px] p-10">
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
                                    className="w-full min-h-[160px] p-5 rounded-2xl border bg-[#F9FAFB] text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 outline-none"
                                    placeholder="Example: Do you like advertisements?"
                                />
                            </div>

                            {/* Question title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Question title</label>
                                <input
                                    type="text"
                                    className="w-full h-14 px-5 rounded-2xl border bg-[#F9FAFB] text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 outline-none"
                                    placeholder="Example: Advertisement"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsAddModalOpen(false)}
                            className="w-full"
                            variant="premium"
                            size="lg"
                        >
                            Add Question
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
            <footer className="mt-auto py-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] border-t bg-white/30">
                © 2026 IELTS Lover. &nbsp; Terms · Privacy · Contact us
            </footer>
        </div>
    )
}

function SpeakingCard({
    id,
    title,
    subtitle,
    attempts,
    icon: Icon,
    color,
    badge
}: {
    id: string,
    title: string,
    subtitle?: string,
    attempts: number,
    icon: React.ElementType,
    color: string,
    badge?: { text: string, color: "yellow" | "green" }
}) {
    return (
        <Link href={`/dashboard/speaking/calibrate?test=${title.toLowerCase().replace(/ /g, "-")}`} className="block h-full transition-transform hover:scale-[1.02] duration-300">
            <div className="h-full bg-card border hover:border-primary/30 rounded-[28px] p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
                <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", color)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black font-outfit leading-tight text-foreground-primary pr-2">{title}</h4>
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
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        {attempts > 0 ? `${attempts} attempt${attempts > 1 ? 's' : ''}` : "No attempts yet"}
                    </p>
                    <div className="h-8 px-4 rounded-lg border border-muted-foreground/20 text-[10px] font-black uppercase tracking-widest flex items-center bg-transparent group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        {attempts > 0 ? <Plus className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {attempts > 0 ? "Practice Again" : "Start"}
                    </div>
                </div>
            </div>
        </Link>
    )
}
