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
    Cloud,
    Construction,
    Sparkles,
    type LucideIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// Dialog imports for the "Add Custom Question" modal
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PulseLoader } from "@/components/global/pulse-loader"

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
import { ExerciseType } from "@/types"

export default function SpeakingHubPage() {
    // ---- COMING SOON OVERLAY FLAG ----
    const IS_COMING_SOON = true;

    // Original State
    const [activeCategory, setActiveCategory] = React.useState("Mock Test")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    // @ts-ignore: exercises might be unused if hidden
    const [exercises, setExercises] = React.useState<any[]>([])
    // @ts-ignore: isLoading might be unused if hidden
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasMockAccess, setHasMockAccess] = React.useState(true)

    // Original Effect
    React.useEffect(() => {
        async function fetchExercises() {
            if (IS_COMING_SOON) return; // Skip fetching if hidden

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

    if (IS_COMING_SOON) {
        return (
            <div className="flex-1 h-full overflow-y-auto scrollbar-hide bg-slate-50/30 dark:bg-slate-950/30">
                <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 lg:p-20 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative"
                    >
                        <div className="w-40 h-40 bg-white/70 dark:bg-slate-800/70 backdrop-blur-3xl rounded-[3rem] shadow-2xl flex items-center justify-center border border-white/40 dark:border-slate-700/50 relative z-10 transition-transform hover:scale-105 duration-500">
                            <Mic2 className="h-16 w-16 text-primary" />
                        </div>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute top-0 right-0 -mr-6 -mt-4 bg-amber-500 text-white text-[10px] font-black px-4 py-2 rounded-2xl border-[3px] border-white dark:border-slate-900 shadow-2xl rotate-12 z-20 uppercase tracking-[0.2em]"
                        >
                            Coming Soon
                        </motion.div>
                        <div className="absolute -inset-10 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
                    </motion.div>

                    <div className="space-y-6 max-w-2xl mx-auto z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl lg:text-6xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
                                Speaking <span className="text-primary">Lab</span>
                            </h1>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg lg:text-xl font-bold text-slate-500 dark:text-slate-400 leading-relaxed"
                        >
                            We&apos;re building an immersive AI voice environment that listens, analyzes, and coaches you to IELTS fluency in real-time.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Engine Initializing</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Release: Q2 2026</p>
                    </motion.div>

                    {/* Background Visual Effects */}
                    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
                        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px]" />
                    </div>
                </div>
            </div>
        )
    }

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
                            variant="default"
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
    const effectiveColor = color.includes("text-") ? color.split(" ")[0] : "text-primary"
    const effectiveBg = color.includes("bg-") ? color.replace("50", "100/50") : color

    return (
        <Link href={`/dashboard/speaking/calibrate?test=${title.toLowerCase().replace(/ /g, "-")}`} className="block h-full">
            <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2rem] p-6 flex flex-col gap-6 shadow-sm hover:shadow-2xl transition-all duration-500 group relative"
            >
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-lg border border-white/20",
                        effectiveBg
                    )}>
                        <Icon className={cn("h-7 w-7", effectiveColor)} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="space-y-1">
                            <h4 className="text-base font-black font-outfit leading-tight text-slate-900 dark:text-white truncate pr-2 group-hover:text-primary transition-colors">
                                {title}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest leading-none",
                                    effectiveColor
                                )}>
                                    {subtitle || "Speaking"}
                                </span>
                                {badge && (
                                    <span className={cn(
                                        "inline-block px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-white/20",
                                        badge.color === "yellow" ? "bg-amber-100/50 text-amber-600" : "bg-emerald-100/50 text-emerald-600"
                                    )}>
                                        {badge.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 border-dashed pt-5">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Usage History</p>
                        <p className="text-[10px] text-slate-900 dark:text-slate-300 font-black uppercase tracking-widest flex items-center gap-1.5">
                            {attempts > 0 ? (
                                <>
                                    <span className="text-emerald-500">{attempts} Attempts</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="text-emerald-500">Practiced</span>
                                </>
                            ) : (
                                <span className="text-amber-500">Unattempted</span>
                            )}
                        </p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center bg-white dark:bg-slate-800 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                    >
                        {attempts > 0 ? <Zap className="h-3 w-3 mr-2" /> : <Play className="h-3 w-3 mr-2" />}
                        {attempts > 0 ? "Repeat" : "Launch"}
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    )
}
