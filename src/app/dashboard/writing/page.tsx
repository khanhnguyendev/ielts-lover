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
import { PulseLoader } from "@/components/global/pulse-loader"

const CATEGORIES = [
    "Academic Task 1",
    "General Task 1",
    "Task 2",
]

const CATEGORY_TO_TYPE: Record<string, ExerciseType> = {
    "Academic Task 1": "writing_task1",
    "General Task 1": "writing_task1",
    "Task 2": "writing_task2",
}

const CATEGORY_LABELS: Record<string, string> = {
    "Academic Task 1": "Academic Task 1",
    "General Task 1": "General Task 1",
    "Task 2": "Task 2",
}

import { getExercises, getUserAttempts, checkFeatureAccess, getFeaturePrice } from "@/app/actions"
import { createExercise, uploadImage, analyzeChartImage } from "@/app/admin/actions"
import { Exercise as DbExercise, ExerciseType } from "@/types"
import { FEATURE_KEYS } from "@/lib/constants"
import { CreditBadge } from "@/components/ui/credit-badge"
import { useNotification } from "@/lib/contexts/notification-context"

interface Exercise {
    id: string
    title: string
    subtitle?: string
    chartType?: string
    attempts?: number
    icon: any
    color: string
    isRecommended?: boolean
}

const CHART_TYPE_LABELS: Record<string, string> = {
    line_graph: "📈 Line Graph",
    bar_chart: "📊 Bar Chart",
    pie_chart: "🥧 Pie Chart",
    table: "📋 Table",
    process_diagram: "🔄 Process Diagram",
    map: "🗺️ Map",
    mixed_chart: "📉 Mixed Chart",
    // Short aliases from DB data
    line: "📈 Line Graph",
    bar: "📊 Bar Chart",
    pie: "🥧 Pie Chart",
    process: "🔄 Process Diagram",
    mixed: "📉 Mixed Chart",
    doughnut: "🍩 Doughnut Chart",
}

const TYPE_CONFIG: Record<string, { icon: any, color: string }> = {
    writing_task1: { icon: Activity, color: "text-blue-600 bg-blue-50" },
    writing_task2: { icon: FileText, color: "text-indigo-600 bg-indigo-50" },
    speaking_part1: { icon: MessageSquare, color: "text-cyan-600 bg-cyan-50" },
    // Add others as needed
}

export default function WritingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Academic Task 1")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [exercises, setExercises] = React.useState<Exercise[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasMockAccess, setHasMockAccess] = React.useState(true)
    const [refreshKey, setRefreshKey] = React.useState(0)
    const [chartTypeFilter, setChartTypeFilter] = React.useState<string>("all")
    const { notifySuccess, notifyError } = useNotification()

    // Custom Task dialog state
    const [customTitle, setCustomTitle] = React.useState("")
    const [customPrompt, setCustomPrompt] = React.useState("")
    const [customImage, setCustomImage] = React.useState<File | null>(null)
    const [customImagePreview, setCustomImagePreview] = React.useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [imageAnalysis, setImageAnalysis] = React.useState<any>(null)
    const [isCreating, setIsCreating] = React.useState(false)
    const [analysisCost, setAnalysisCost] = React.useState(5)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        getFeaturePrice(FEATURE_KEYS.CHART_IMAGE_ANALYSIS).then(setAnalysisCost)
    }, [])

    function resetCustomTaskForm() {
        setCustomTitle("")
        setCustomPrompt("")
        setCustomImage(null)
        setCustomImagePreview(null)
        setImageAnalysis(null)
    }

    async function handleAnalyzeCustomImage() {
        if (!customImage) return
        setIsAnalyzing(true)
        setImageAnalysis(null)
        try {
            const reader = new FileReader()
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = () => {
                    const result = reader.result as string
                    resolve(result.split(",")[1])
                }
                reader.readAsDataURL(customImage)
            })
            const analysis = await analyzeChartImage(base64, customImage.type)
            if (analysis.success && analysis.data) {
                setImageAnalysis(analysis.data)
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -analysisCost } }))
                if (analysis.data.is_valid && analysis.data.title && !customTitle) {
                    setCustomTitle(analysis.data.title)
                }
            } else if (analysis.error === "INSUFFICIENT_CREDITS") {
                notifyError("Insufficient Credits", "You need more StarCredits to analyze this image.", "Close")
            }
        } catch (err) {
            console.error("Image analysis failed:", err)
            notifyError("Analysis Failed", "Could not analyze the uploaded image.", "Close")
        } finally {
            setIsAnalyzing(false)
        }
    }

    async function handleCreateCustomTask() {
        if (!customTitle || !customPrompt) return
        const isTask1 = activeCategory !== "Task 2"
        if (isTask1 && (!customImage || !imageAnalysis?.is_valid)) return
        setIsCreating(true)
        try {
            let imageUrl: string | undefined
            if (customImage) {
                const uploadFormData = new FormData()
                uploadFormData.append("file", customImage)
                imageUrl = await uploadImage(uploadFormData)
            }

            await createExercise({
                title: customTitle,
                type: CATEGORY_TO_TYPE[activeCategory] || "writing_task1",
                prompt: customPrompt,
                ...(imageUrl && { image_url: imageUrl }),
                ...(imageAnalysis?.data_points && { chart_data: imageAnalysis.data_points }),
                is_published: true,
            })
            notifySuccess("Task Created", "Your custom task has been added successfully!", "Done")
            resetCustomTaskForm()
            setIsAddModalOpen(false)
            setRefreshKey(k => k + 1) // Trigger list reload
        } catch (err) {
            console.error("Failed to create custom task:", err)
            notifyError("Creation Failed", "Could not create the exercise. Please try again.", "Close")
        } finally {
            setIsCreating(false)
        }
    }

    React.useEffect(() => {
        const fetchExercises = async () => {
            setIsLoading(true)
            setExercises([]) // Clear immediately to prevent leakage from previous tab

            // Mock Test is coming soon
            if (activeCategory === "Mock Test") {
                setIsLoading(false)
                return
            }

            try {
                setHasMockAccess(true);

                const type = CATEGORY_TO_TYPE[activeCategory] || "writing_task1"

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
                        chartType: db.chart_data?.chart_type || db.chart_data?.type || undefined,
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
    }, [activeCategory, refreshKey])

    // Derive unique chart types from current exercises for filter
    const availableChartTypes = React.useMemo(() => {
        const types = exercises.filter(e => e.chartType).map(e => e.chartType!)
        return [...new Set(types)]
    }, [exercises])

    const filteredExercises = React.useMemo(() => {
        if (chartTypeFilter === "all") return exercises
        return exercises.filter(e => e.chartType === chartTypeFilter)
    }, [exercises, chartTypeFilter])

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
                                        <span className="absolute -top-2 -left-2 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm shadow-amber-500/20">Soon</span>
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


                    {activeCategory === "Mock Test" ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-100 z-10 relative">
                                    <Clock className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-white shadow-sm rotate-12 z-20">
                                    Coming Soon
                                </div>
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h3 className="text-xl font-black font-outfit text-slate-900">Full-Length Mock Tests</h3>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    We are working hard to bring you a complete IELTS simulation experience with strict timing and instant scoring. Stay tuned!
                                </p>
                            </div>
                        </div>
                    ) : activeCategory === "Custom Question" ? (
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
                        <div className="space-y-5">
                            {/* Chart type filter chips (Task 1 only) */}
                            {(activeCategory === "Academic Task 1" || activeCategory === "General Task 1") && availableChartTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => setChartTypeFilter("all")}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider",
                                            chartTypeFilter === "all"
                                                ? "bg-primary text-white shadow-sm"
                                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        )}
                                    >
                                        All types
                                    </button>
                                    {availableChartTypes.map(ct => (
                                        <button
                                            key={ct}
                                            onClick={() => setChartTypeFilter(ct)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                                chartTypeFilter === ct
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            {CHART_TYPE_LABELS[ct] || ct}
                                        </button>
                                    ))}
                                </div>
                            )}
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
                                {filteredExercises.map((ex, i) => (
                                    <ExerciseCard
                                        key={i}
                                        id={ex.id}
                                        title={ex.title}
                                        subtitle={ex.subtitle}
                                        chartType={ex.chartType}
                                        attempts={ex.attempts || 0}
                                        icon={ex.icon}
                                        color={ex.color}
                                        isRecommended={ex.isRecommended}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) resetCustomTaskForm(); }}>
                    <DialogContent className="sm:max-w-md bg-white rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
                        {/* Compact header */}
                        <div className="px-6 pt-5 pb-4 border-b flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                                <Plus className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black font-outfit text-slate-900">
                                    Add Custom Task
                                </DialogTitle>
                                <p className="text-muted-foreground text-xs mt-0.5">
                                    {activeCategory !== "Task 2"
                                        ? "Upload a chart & create your own Writing Task 1"
                                        : "Create your own Writing Task 2 question"
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-hide">
                            {/* Task type — static badge */}
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-xs font-bold text-slate-700">{CATEGORY_LABELS[activeCategory] || activeCategory}</span>
                            </div>

                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Title</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-4 rounded-xl border bg-slate-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none"
                                    placeholder="e.g. Coffee Exports by Region"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                />
                            </div>

                            {/* Prompt */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Question prompt</label>
                                <textarea
                                    className="w-full min-h-[80px] p-4 rounded-xl border bg-slate-50/50 text-sm font-medium leading-relaxed text-slate-700 resize-none focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all placeholder:text-slate-400 outline-none"
                                    placeholder="The chart below shows..."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                />
                            </div>

                            {/* Image upload — Task 1 only */}
                            {activeCategory !== "Task 2" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                        Chart image <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    notifyError("File Too Large", "Maximum file size is 5MB.", "Close")
                                                    return
                                                }
                                                setCustomImage(file)
                                                setImageAnalysis(null)
                                                setCustomImagePreview(URL.createObjectURL(file))
                                            }
                                        }}
                                    />
                                    {customImagePreview ? (
                                        <div className="relative rounded-xl border overflow-hidden bg-slate-50">
                                            <img src={customImagePreview} alt="Chart" className="w-full max-h-36 object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomImage(null)
                                                    setCustomImagePreview(null)
                                                    setImageAnalysis(null)
                                                    if (fileInputRef.current) fileInputRef.current.value = ""
                                                }}
                                                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow border hover:bg-rose-50 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5 text-rose-600" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed rounded-xl p-5 bg-slate-50/50 flex items-center gap-4 hover:bg-primary/[0.02] hover:border-primary/30 transition-all cursor-pointer border-slate-200 group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform">
                                                <Upload className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Click to upload</p>
                                                <p className="text-[10px] text-slate-500">JPG, PNG, WebP · Max 5MB</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Analyze button */}
                                    {customImage && !imageAnalysis && !isAnalyzing && (
                                        <div className="space-y-2">
                                            <div className="flex gap-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60">
                                                <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-amber-800 leading-relaxed">
                                                    AI will verify this is a valid IELTS chart and extract its data so we can score your writing accurately.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAnalyzeCustomImage}
                                                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs font-bold shadow-md shadow-indigo-600/15"
                                            >
                                                <Search className="h-3.5 w-3.5" />
                                                Analyze Chart
                                                <CreditBadge amount={-analysisCost} size="sm" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Analyzing */}
                                    {isAnalyzing && (
                                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-700 text-xs">
                                            <PulseLoader size="sm" color="primary" />
                                            <span className="font-bold">Analyzing with AI Vision...</span>
                                        </div>
                                    )}

                                    {/* Result */}
                                    {imageAnalysis && (
                                        <div className={`p-3 rounded-xl border space-y-2 ${imageAnalysis.is_valid
                                            ? "bg-emerald-50/80 border-emerald-200"
                                            : "bg-rose-50/80 border-rose-200"}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {imageAnalysis.is_valid ? (
                                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                                        <Star className="h-2.5 w-2.5 text-white fill-white" />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                                                        <X className="h-2.5 w-2.5 text-white" />
                                                    </div>
                                                )}
                                                <span className={`font-black text-xs ${imageAnalysis.is_valid ? "text-emerald-800" : "text-rose-800"}`}>
                                                    {imageAnalysis.is_valid ? "Valid IELTS Chart" : "Invalid Image"}
                                                </span>
                                                {imageAnalysis.is_valid && imageAnalysis.chart_type && (
                                                    <span className="ml-auto text-[9px] font-bold bg-white px-2 py-0.5 rounded-full border uppercase tracking-wider">
                                                        {imageAnalysis.chart_type.replace("_", " ")}
                                                    </span>
                                                )}
                                            </div>
                                            {imageAnalysis.is_valid ? (
                                                <p className="text-[11px] text-emerald-700 leading-relaxed">{imageAnalysis.description}</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {imageAnalysis.validation_errors?.map((err: string, i: number) => (
                                                        <p key={i} className="text-[11px] text-rose-700">• {err}</p>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setImageAnalysis(null)}
                                                        className="mt-1 text-[11px] font-bold text-rose-600 underline underline-offset-2 hover:text-rose-800"
                                                    >
                                                        Re-analyze
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50/80 border-t flex gap-2.5">
                            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetCustomTaskForm(); }} className="rounded-xl h-10 text-xs font-bold flex-1">
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleCreateCustomTask}
                                disabled={isCreating || !customTitle || !customPrompt || (activeCategory !== "Task 2" && (!customImage || !imageAnalysis?.is_valid))}
                                className="h-10 flex-[2] shadow-md shadow-primary/15 text-xs font-bold"
                            >
                                {isCreating ? "Creating..." : "Create Question"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <footer className="mt-auto py-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] border-t bg-white/30">
                © 2026 IELTS Lover. &nbsp; Terms · Privacy · Contact us
            </footer>
        </div >
    )
}

function ExerciseCard({
    id,
    title,
    subtitle,
    chartType,
    attempts,
    icon: Icon,
    color,
    isRecommended
}: {
    id: string,
    title: string,
    subtitle?: string,
    chartType?: string,
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
                        <div className="space-y-1.5">
                            <h4 className="text-sm font-black font-outfit leading-tight text-foreground-primary pr-2">{title}</h4>
                            <div className="flex flex-wrap gap-1">
                                {subtitle && (
                                    <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100/50">
                                        {subtitle}
                                    </span>
                                )}
                                {chartType && (
                                    <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-100/50">
                                        {CHART_TYPE_LABELS[chartType] || chartType}
                                    </span>
                                )}
                            </div>
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
