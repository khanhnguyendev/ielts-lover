"use client"

import * as React from "react"
import {
    Sparkles,
    PenTool,
    Plus,
    Activity,
    FileText,
    Upload,
    X,
    MessageSquare,
    Cat,
    Star,
    Target,
    Clock,
    type LucideIcon
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PulseLoader } from "@/components/global/pulse-loader"
import { LoadMoreButton } from "@/components/global/load-more-button"

import { getExercisesPaginated, getUserAttempts, getMostRecentAttempt, getFeaturePrice, reevaluateAttempt, createCustomExercise, uploadExerciseImage } from "@/app/actions"
import { analyzeChartImage } from "@/app/admin/actions"
import { Exercise as DbExercise, ExerciseType, Attempt } from "@/types"
import { FEATURE_KEYS, ATTEMPT_STATES } from "@/lib/constants"
import { CreditBadge } from "@/components/ui/credit-badge"
import { useNotification } from "@/lib/contexts/notification-context"
import { ExerciseCard } from "@/components/dashboard/exercise-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentReportCard } from "@/components/dashboard/recent-report-card"
import { extractBillingError } from "@/lib/billing-errors"
import { NOTIFY_MSGS } from "@/lib/constants/messages"

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
    "Academic Task 1": "Academic",
    "General Task 1": "General",
    "Task 2": "Task 2",
}

const TYPE_CONFIG: Record<string, { icon: LucideIcon, color: string }> = {
    writing_task1: { icon: Activity, color: "text-blue-600 bg-blue-50" },
    writing_task2: { icon: FileText, color: "text-indigo-600 bg-indigo-50" },
    speaking_part1: { icon: MessageSquare, color: "text-cyan-600 bg-cyan-50" },
}

interface ImageAnalysis {
    is_valid: boolean;
    title?: string;
    chart_type?: string;
    description?: string;
    data_points?: Record<string, unknown>[];
    validation_errors?: string[];
}

interface Exercise {
    id: string
    title: string
    subtitle?: string
    chartType?: string
    attempts: number
    icon: LucideIcon
    color: string
    creatorName?: string
    creatorRole?: string
    createdAt?: string
}

export default function WritingHubPage() {
    const [activeCategory, setActiveCategory] = React.useState("Academic Task 1")
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [exercises, setExercises] = React.useState<Exercise[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isLoadingMore, setIsLoadingMore] = React.useState(false)
    const [totalExercises, setTotalExercises] = React.useState(0)
    const [refreshKey, setRefreshKey] = React.useState(0)
    const [chartTypeFilter, setChartTypeFilter] = React.useState<string>("all")
    const { notifySuccess, notifyError } = useNotification()

    const PAGE_SIZE = 5

    // Custom Task dialog state
    const [customTitle, setCustomTitle] = React.useState("")
    const [customPrompt, setCustomPrompt] = React.useState("")
    const [customImage, setCustomImage] = React.useState<File | null>(null)
    const [customImagePreview, setCustomImagePreview] = React.useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [imageAnalysis, setImageAnalysis] = React.useState<ImageAnalysis | null>(null)
    const [isCreating, setIsCreating] = React.useState(false)
    const [analysisCost, setAnalysisCost] = React.useState(5)

    // Attempt tracking
    const [attempts, setAttempts] = React.useState<Attempt[]>([])
    const [recentAttempt, setRecentAttempt] = React.useState<Attempt | null>(null)
    const [reevaluatingId, setReevaluatingId] = React.useState<string | null>(null)
    const [reevalStep, setReevalStep] = React.useState(0)

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

    async function handleReevaluate(attemptId: string) {
        setReevaluatingId(attemptId)
        setReevalStep(1)
        try {
            setTimeout(() => setReevalStep(2), 1500)
            const result = await reevaluateAttempt(attemptId)
            setReevalStep(3)
            if (result.success) {
                notifySuccess(NOTIFY_MSGS.SUCCESS.UPDATED_SCORE_READY.title, NOTIFY_MSGS.SUCCESS.UPDATED_SCORE_READY.description, "View")
                setRefreshKey(k => k + 1)
            } else if ('reason' in result && result.reason === "INSUFFICIENT_CREDITS") {
                notifyError(NOTIFY_MSGS.ERROR.INSUFFICIENT_CREDITS.title, extractBillingError(new Error("INSUFFICIENT_CREDITS"))?.message || "Not enough credits.", "Close")
            } else {
                throw new Error(('message' in result ? result.message : "Evaluation failed"))
            }
        } catch (error) {
            console.error("Re-evaluation failed:", error)
            notifyError(NOTIFY_MSGS.ERROR.EVALUATION_FAILED.title, NOTIFY_MSGS.ERROR.EVALUATION_FAILED.description, "Close")
        } finally {
            setReevaluatingId(null)
            setReevalStep(0)
        }
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
                notifyError(NOTIFY_MSGS.ERROR.INSUFFICIENT_CREDITS.title, NOTIFY_MSGS.ERROR.INSUFFICIENT_CREDITS.description, "Close")
            }
        } catch (err) {
            console.error("Image analysis failed:", err)
            notifyError(NOTIFY_MSGS.ERROR.ANALYSIS_FAILED.title, NOTIFY_MSGS.ERROR.ANALYSIS_FAILED.description, "Close")
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
                imageUrl = await uploadExerciseImage(uploadFormData)
            }

            await createCustomExercise({
                title: customTitle,
                type: CATEGORY_TO_TYPE[activeCategory] || "writing_task1",
                prompt: customPrompt,
                ...(imageUrl && { image_url: imageUrl }),
                ...(imageAnalysis?.data_points && { chart_data: imageAnalysis.data_points as unknown as Record<string, unknown> }),
            })
            notifySuccess(NOTIFY_MSGS.SUCCESS.TASK_CREATED.title, NOTIFY_MSGS.SUCCESS.TASK_CREATED.description, "Done")
            resetCustomTaskForm()
            setIsAddModalOpen(false)
            setRefreshKey(k => k + 1)
        } catch (err) {
            console.error("Failed to create custom task:", err)
            notifyError(NOTIFY_MSGS.ERROR.CREATION_FAILED.title, NOTIFY_MSGS.ERROR.CREATION_FAILED.description, "Close")
        } finally {
            setIsCreating(false)
        }
    }

    const adaptExercises = React.useCallback((exercisesData: DbExercise[], attemptsData: { exercise_id: string }[]): Exercise[] => {
        return exercisesData.map((db: DbExercise) => {
            const attemptCount = attemptsData.filter((a) => a.exercise_id === db.id).length;
            return {
                id: db.id,
                title: db.title,
                subtitle: db.type.replace("_", " ").toUpperCase(),
                chartType: db.chart_data?.chart_type || db.chart_data?.type || undefined,
                attempts: attemptCount,
                icon: TYPE_CONFIG[db.type]?.icon || Cat,
                color: TYPE_CONFIG[db.type]?.color || "text-purple-600 bg-purple-50",
                creatorName: db.creator?.full_name || db.creator?.email,
                creatorRole: db.creator?.role,
                createdAt: db.created_at,
            };
        })
    }, [])

    React.useEffect(() => {
        const fetchExercises = async () => {
            setIsLoading(true)
            setExercises([])
            try {
                const type = CATEGORY_TO_TYPE[activeCategory] || "writing_task1"
                const [result, attemptsData, mostRecent] = await Promise.all([
                    getExercisesPaginated(type, PAGE_SIZE, 0),
                    getUserAttempts(),
                    getMostRecentAttempt()
                ]);

                setExercises(adaptExercises(result.data as DbExercise[], attemptsData as { exercise_id: string }[]))
                setTotalExercises(result.total)

                // Keep only writing attempts for stats
                const writingAttempts = (attemptsData as Attempt[]).filter(a => a.exercises?.type?.startsWith('writing'))
                setAttempts(writingAttempts)
                setRecentAttempt(mostRecent as Attempt | null)
            } catch (error) {
                console.error("Failed to fetch writing hub data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchExercises()
    }, [activeCategory, refreshKey, adaptExercises])

    const handleLoadMore = async () => {
        setIsLoadingMore(true)
        try {
            const type = CATEGORY_TO_TYPE[activeCategory] || "writing_task1"
            const [result, attemptsData] = await Promise.all([
                getExercisesPaginated(type, PAGE_SIZE, exercises.length),
                getUserAttempts()
            ]);
            setExercises(prev => [...prev, ...adaptExercises(result.data as DbExercise[], attemptsData as { exercise_id: string }[])])
            setTotalExercises(result.total)

            // Keep only writing attempts (refresh list)
            const writingAttempts = (attemptsData as Attempt[]).filter(a => a.exercises?.type?.startsWith('writing'))
            setAttempts(writingAttempts)
        } catch (error) {
            console.error("Failed to load more exercises:", error)
        } finally {
            setIsLoadingMore(false)
        }
    }

    const hasMore = exercises.length < totalExercises

    const availableChartTypes = React.useMemo(() => {
        const types = exercises.filter(e => e.chartType).map(e => e.chartType!)
        return [...new Set(types)]
    }, [exercises])

    const filteredExercises = React.useMemo(() => {
        if (chartTypeFilter === "all") return exercises
        return exercises.filter(e => e.chartType === chartTypeFilter)
    }, [exercises, chartTypeFilter])

    // Calculate Stats
    const totalAttempts = attempts.length;
    const evaluatedAttempts = attempts.filter(a => a.state === ATTEMPT_STATES.EVALUATED && a.score);
    const averageScore = evaluatedAttempts.length > 0
        ? (evaluatedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / evaluatedAttempts.length).toFixed(1)
        : "--";

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50/30">
            <div className="p-6 lg:p-12 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Activity}
                        label="Total Writing"
                        value={totalAttempts.toString()}
                        subLabel="Essays Written"
                        color="text-indigo-600"
                        bgColor="bg-indigo-50"
                    />
                    <StatCard
                        icon={FileText}
                        label="Evaluated"
                        value={evaluatedAttempts.length.toString()}
                        subLabel="Scored by AI"
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                    <StatCard
                        icon={Target}
                        label="Avg Band"
                        value={averageScore}
                        subLabel="Writing Score"
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                    />
                    <StatCard
                        icon={Clock}
                        label="In Progress"
                        value={attempts.filter(a => a.state !== ATTEMPT_STATES.EVALUATED && a.state !== ATTEMPT_STATES.SUBMITTED).length.toString()}
                        subLabel="Active essays"
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                    />
                </div>

                {/* Featured Recent Report */}
                {recentAttempt && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pl-2">
                            <Sparkles size={18} className="text-primary" />
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Featured Recent Report</h2>
                        </div>
                        <RecentReportCard
                            attempt={recentAttempt}
                            onReevaluate={handleReevaluate}
                            reevaluatingId={reevaluatingId}
                            reevalStep={reevalStep}
                        />
                    </div>
                )}

                {/* 1. Header & Tabs */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                                <PenTool size={20} />
                            </div>
                            <h1 className="text-2xl font-black font-outfit text-slate-900">Writing Lab</h1>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Master Academic & General IELTS</p>
                    </div>

                    <FilterGroup
                        label="Category"
                        options={CATEGORIES.map(cat => ({ value: cat, label: CATEGORY_LABELS[cat] || cat }))}
                        value={activeCategory}
                        onChange={(val) => { if (val) { setActiveCategory(val); setChartTypeFilter("all"); } }}
                    />
                </div>

                {/* 2. Content Area */}
                <div className="bg-white rounded-[2.5rem] p-4 lg:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[600px]">
                    <div className="space-y-8">
                        {/* Secondary Filter & Count */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                            {(activeCategory === "Academic Task 1" || activeCategory === "General Task 1") && availableChartTypes.length > 0 ? (
                                <FilterGroup
                                    label="Chart Type"
                                    options={[
                                        { value: "all", label: "All" },
                                        ...availableChartTypes.map(ct => ({ value: ct, label: ct.replace("_", " ") }))
                                    ]}
                                    value={chartTypeFilter}
                                    onChange={(val) => setChartTypeFilter(val || "all")}
                                />
                            ) : (
                                <div />
                            )}
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                {exercises.length} of {totalExercises} Exercises
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="py-32 flex flex-col items-center justify-center gap-4">
                                <PulseLoader size="lg" color="primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 animate-pulse">Syncing Exercises...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Add Custom Row */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '0ms' }}>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="group w-full bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-indigo-50/50 hover:border-indigo-300/50 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0">
                                            <Plus size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-base font-black text-slate-900 group-hover:text-indigo-700 transition-colors">Custom Task</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Add your own prompt or image</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-300 shrink-0 mt-4 sm:mt-0">
                                            <Plus size={14} />
                                        </div>
                                    </button>
                                </div>

                                {filteredExercises.map((ex, idx) => (
                                    <div
                                        key={ex.id}
                                        className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                                        style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                    >
                                        <ExerciseCard {...ex} />
                                    </div>
                                ))}

                                {/* Load More */}
                                {hasMore && (
                                    <LoadMoreButton
                                        onClick={handleLoadMore}
                                        isLoading={isLoadingMore}
                                        remaining={totalExercises - exercises.length}
                                    />
                                )}
                            </div>
                        )}

                        {!isLoading && filteredExercises.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
                                    <Activity size={40} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900">No exercises found</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Be the first to add a custom task!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Add Custom Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) resetCustomTaskForm(); }}>
                    <DialogContent className="sm:max-w-[500px] p-0 rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-4">
                                <Plus size={24} className="text-primary" />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black font-outfit text-white">Create Custom Task</DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary rounded-md text-white">
                                        {activeCategory}
                                    </span>
                                    <p className="text-slate-400 text-xs font-medium">Add a task found online or yourself</p>
                                </div>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Daily Coffee Consumption"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl border-slate-100 bg-slate-50 font-bold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Question Prompt</label>
                                    <textarea
                                        placeholder="The table below shows..."
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        className="w-full min-h-[120px] p-5 rounded-2xl border-slate-100 bg-slate-50 font-medium text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                                    />
                                </div>

                                {activeCategory !== "Task 2" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Chart Image</label>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setCustomImage(file)
                                                        setCustomImagePreview(URL.createObjectURL(file))
                                                        setImageAnalysis(null)
                                                    }
                                                }}
                                            />

                                            {customImagePreview ? (
                                                <div className="relative group rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                                                    <div className="relative w-full aspect-video">
                                                        <Image
                                                            src={customImagePreview}
                                                            alt="Preview"
                                                            fill
                                                            className="object-contain bg-slate-50"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => { setCustomImage(null); setCustomImagePreview(null); setImageAnalysis(null); }}
                                                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-rose-500 shadow-lg hover:bg-rose-50 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full py-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-primary/30 transition-all"
                                                >
                                                    <Upload size={24} className="text-slate-400" />
                                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Click to upload chart</p>
                                                </button>
                                            )}
                                        </div>

                                        {customImage && !imageAnalysis && (
                                            <Button
                                                onClick={handleAnalyzeCustomImage}
                                                disabled={isAnalyzing}
                                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-indigo-600/20"
                                            >
                                                {isAnalyzing ? <PulseLoader size="sm" color="white" /> : (
                                                    <>
                                                        <Sparkles size={16} />
                                                        Verify Chart with AI
                                                        <CreditBadge amount={-analysisCost} size="sm" className="bg-white/20" />
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {imageAnalysis && (
                                            <div className={cn(
                                                "p-4 rounded-2xl border flex items-start gap-3",
                                                imageAnalysis.is_valid ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                                            )}>
                                                {imageAnalysis.is_valid ? <Star size={18} className="shrink-0 mt-0.5" /> : <X size={18} className="shrink-0 mt-0.5" />}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black uppercase tracking-widest">{imageAnalysis.is_valid ? "Valid Chart" : "Analysis Failed"}</p>
                                                    <p className="text-[11px] font-medium leading-relaxed">{imageAnalysis.description || "Incompatible image detected."}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 h-14 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateCustomTask}
                                disabled={isCreating || !customTitle || !customPrompt || (activeCategory !== "Task 2" && (!customImage || !imageAnalysis?.is_valid))}
                                className="flex-[2] h-14 rounded-2xl bg-slate-900 border-none shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all text-sm font-black text-white"
                            >
                                {isCreating ? <PulseLoader size="sm" color="white" /> : "Save Question"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <footer className="mt-auto py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-t bg-white/50 backdrop-blur-sm">
                © 2026 IELTS Lover. &nbsp; • &nbsp; Excellence in Writing
            </footer>
        </div>
    )
}

function FilterGroup({ label, options, value, onChange }: {
    label: string,
    options: { value: string | null, label: string }[],
    value: string | null,
    onChange: (val: string | null) => void
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm shadow-sm ring-1 ring-white">
                {options.map((opt) => (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                            value === opt.value
                                ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-100"
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
