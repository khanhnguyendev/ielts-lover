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

const CATEGORIES = [
    "Mock Test",
    "Academic Task 1",
    "General Task 1",
    "Task 2",
    "Custom Question"
]

interface Exercise {
    title: string
    subtitle?: string
    attempts?: number
    icon: any
    color: string
    isRecommended?: boolean
}

export default function WritingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Mock Test")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

    const getExercises = (): Exercise[] => {
        if (activeCategory === "Mock Test") {
            return Array.from({ length: 12 }).map((_, i) => ({
                title: `${i % 2 === 0 ? "Academic" : "General"} Writing Mock Test ${i + 1}`,
                attempts: 0,
                icon: i % 2 === 0 ? Cat : Heart,
                color: i % 2 === 0 ? "text-purple-600 bg-purple-50" : "text-pink-500 bg-pink-50"
            }))
        }
        if (activeCategory === "Academic Task 1") {
            return [
                { title: "Milk Consumption", subtitle: "Line Graph", icon: Activity, color: "text-blue-600 bg-blue-50" },
                { title: "Physical Activity", subtitle: "Bar Chart", icon: BarChart, color: "text-emerald-600 bg-emerald-50", isRecommended: true },
                { title: "Public School Budget", subtitle: "Pie Chart", icon: PieChart, color: "text-indigo-600 bg-indigo-50", isRecommended: true },
                { title: "Age Distribution", subtitle: "Pie Chart", icon: PieChart, color: "text-indigo-600 bg-indigo-50" },
                { title: "Airport Redevelopment", subtitle: "Maps", icon: Map, color: "text-pink-600 bg-pink-50" },
                { title: "Butter and Margarine Consumption", subtitle: "Line Graph", icon: Activity, color: "text-blue-600 bg-blue-50" },
                { title: "Carbon Emissions", subtitle: "Line Graph", icon: Activity, color: "text-blue-600 bg-blue-50" },
                { title: "Ceramic Tiles Manufacturing", subtitle: "Process Diagram", icon: Zap, color: "text-orange-600 bg-orange-50" },
                { title: "Cocoa and Coffee Sales", subtitle: "Table", icon: Table, color: "text-amber-600 bg-amber-50" },
                { title: "Electricity Production", subtitle: "Process Diagram", icon: Zap, color: "text-orange-600 bg-orange-50" },
                { title: "Electricity Production by Fuel Source", subtitle: "Pie Chart", icon: PieChart, color: "text-indigo-600 bg-indigo-50" }
            ]
        }
        if (activeCategory === "Task 2") {
            return [
                { title: "Accepting vs. Improving Hard Situations", subtitle: "Discussion", icon: MessageSquare, color: "text-cyan-600 bg-cyan-50", isRecommended: true },
                { title: "Printed vs. Online Materials", subtitle: "Opinion", icon: FileText, color: "text-indigo-600 bg-indigo-50", isRecommended: true },
                { title: "Taking Risks", subtitle: "Advantage-Disadvantage", icon: Globe, color: "text-blue-600 bg-blue-50", isRecommended: true },
                { title: "Age Imbalance in the Population", subtitle: "Advantage-Disadvantage", icon: Users, color: "text-blue-600 bg-blue-50" },
                { title: "Alternative Medicine vs. Regular Doctors", subtitle: "Positive-Negative", icon: Activity, color: "text-purple-600 bg-purple-50" }
            ]
        }
        return []
    }

    const exercises = getExercises()

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">Writing Tasks</h1>
            </div>

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
                                title={ex.title}
                                subtitle={ex.subtitle}
                                attempts={0}
                                icon={ex.icon}
                                color={ex.color}
                                isRecommended={ex.isRecommended}
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
                        {/* Writing task type */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Writing task type</label>
                            <button className="w-full h-14 px-5 rounded-2xl border bg-white flex items-center justify-between text-sm font-medium hover:border-primary/40 transition-all group outline-none">
                                Academic Task 1 <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        {/* Question */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Question</label>
                            <textarea
                                className="w-full min-h-[160px] p-5 rounded-2xl border bg-[#F9FAFB] text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 outline-none"
                                placeholder="Example: The diagram below illustrates the daily routine of a highly professional house cat..."
                            />
                        </div>

                        {/* Add visual */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Add visual <span className="text-rose-500">*</span></label>
                            <div className="border-2 border-dashed rounded-[20px] p-6 bg-[#F9FAFB] flex flex-col items-center gap-4 text-center group hover:bg-white hover:border-primary/40 transition-all cursor-pointer">
                                <p className="text-[10px] font-medium text-muted-foreground max-w-[200px]">
                                    Please upload a clear, close-up image with high resolution.
                                </p>
                                <Button variant="outline" className="h-10 px-6 rounded-xl border-muted-foreground/20 text-xs font-black">
                                    <Upload className="h-4 w-4 mr-2" /> Upload
                                </Button>
                            </div>
                        </div>

                        {/* Question title */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Question title</label>
                            <input
                                type="text"
                                className="w-full h-14 px-5 rounded-2xl border bg-[#F9FAFB] text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 outline-none"
                                placeholder="Example: Special Cat"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(false)}
                        className="w-full h-14 rounded-2xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-sm shadow-xl shadow-indigo-900/20"
                    >
                        Add Questions
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ExerciseCard({
    title,
    subtitle,
    attempts,
    icon: Icon,
    color,
    isRecommended
}: {
    title: string,
    subtitle?: string,
    attempts: number,
    icon: any,
    color: string,
    isRecommended?: boolean
}) {
    return (
        <Link href={`/dashboard/writing/${title.toLowerCase().replace(/ /g, "-")}`} className="block h-full transition-transform hover:scale-[1.02] duration-300">
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
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">No attempts yet</p>
                    <div className="h-8 px-4 rounded-lg border border-muted-foreground/20 text-[10px] font-black uppercase tracking-widest flex items-center bg-transparent group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        <Plus className="h-3 w-3 mr-1" /> Start
                    </div>
                </div>
            </div>
        </Link>
    )
}
