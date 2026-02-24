"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Sparkles, Loader2, CheckCircle2, XCircle,
    ChevronRight, BarChart2, TrendingUp, PieChart, Table,
    GitBranch, Map, LayoutDashboard, FileText, Mic, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAIExercise, createExercise } from "@/app/admin/actions";
import { CHART_TYPES } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────

type ItemStatus = "pending" | "running" | "done" | "error";
interface GenerationItem {
    index: number;
    status: ItemStatus;
    title?: string;
    error?: string;
}

// ── Config ─────────────────────────────────────────────────────────────────

const EXERCISE_TYPES = [
    { value: "writing_task1", label: "Writing Task 1", icon: BarChart2, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { value: "writing_task2", label: "Writing Task 2", icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { value: "speaking_part1", label: "Speaking Part 1", icon: Mic, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { value: "speaking_part2", label: "Speaking Part 2", icon: Mic, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { value: "speaking_part3", label: "Speaking Part 3", icon: Mic, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
];

const CHART_TYPE_OPTIONS = [
    { value: "auto", label: "Auto (AI picks)", icon: Sparkles },
    { value: CHART_TYPES.BAR_CHART, label: "Bar Chart", icon: BarChart2 },
    { value: CHART_TYPES.LINE_GRAPH, label: "Line Graph", icon: TrendingUp },
    { value: CHART_TYPES.PIE_CHART, label: "Pie Chart", icon: PieChart },
    { value: CHART_TYPES.TABLE, label: "Table", icon: Table },
    { value: CHART_TYPES.PROCESS_DIAGRAM, label: "Process Diagram", icon: GitBranch },
    { value: CHART_TYPES.MAP, label: "Map", icon: Map },
    { value: CHART_TYPES.MIXED_CHART, label: "Mixed Chart", icon: LayoutDashboard },
];

// ── Processing Overlay ─────────────────────────────────────────────────────

function ProcessingCard({ items, count }: { items: GenerationItem[]; count: number }) {
    const completed = items.filter(i => i.status === "done" || i.status === "error").length;
    const progress = count > 0 ? Math.round(completed / count * 100) : 0;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">

            {/* Header with animated orb */}
            <div className="bg-slate-900 px-8 py-6 flex items-center gap-4">
                <div className="relative w-12 h-12 shrink-0">
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/40">
                        <Sparkles size={20} className="text-white animate-pulse" />
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-black text-white">AI is generating…</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Step {Math.min(completed + 1, count)} of {count} — please wait
                    </p>
                </div>
                <Loader2 size={18} className="text-primary animate-spin shrink-0" />
            </div>

            <div className="p-8 space-y-6">

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{completed} completed</span>
                        <span>{count - completed} remaining</span>
                    </div>
                </div>

                {/* Step list */}
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {items.map((item) => (
                            <div
                                key={item.index}
                                className={cn(
                                    "flex items-center gap-3 px-5 py-3.5 transition-all duration-300",
                                    item.status === "running" && "bg-primary/5 border-l-2 border-primary"
                                )}
                            >
                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                    {item.status === "pending" && <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                                    {item.status === "running" && <Loader2 size={13} className="animate-spin text-primary" />}
                                    {item.status === "done" && <CheckCircle2 size={14} className="text-emerald-500" />}
                                    {item.status === "error" && <XCircle size={14} className="text-rose-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {item.status === "pending" && <p className="text-xs font-bold text-slate-300">Exercise {item.index + 1}</p>}
                                    {item.status === "running" && <p className="text-xs font-black text-primary animate-pulse">Generating exercise {item.index + 1}…</p>}
                                    {item.status === "done" && <p className="text-xs font-black text-slate-700 truncate">{item.title}</p>}
                                    {item.status === "error" && <p className="text-xs font-bold text-rose-500 truncate">Failed — {item.error}</p>}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 shrink-0">#{item.index + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Clock size={11} />
                    Do not close this page
                </p>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function BulkGeneratePage() {
    const router = useRouter();

    const [exerciseType, setExerciseType] = useState("writing_task1");
    const [chartType, setChartType] = useState("auto");
    const [count, setCount] = useState(3);
    const [topic, setTopic] = useState("");

    const [phase, setPhase] = useState<"form" | "running" | "done">("form");
    const [items, setItems] = useState<GenerationItem[]>([]);

    const isTask1 = exerciseType === "writing_task1";

    async function handleGenerate() {
        const initial: GenerationItem[] = Array.from({ length: count }, (_, i) => ({ index: i, status: "pending" }));
        setItems(initial);
        setPhase("running");

        for (let i = 0; i < count; i++) {
            setItems(prev => prev.map(it => it.index === i ? { ...it, status: "running" } : it));
            try {
                const generated = await generateAIExercise(
                    exerciseType,
                    topic || undefined,
                    chartType === "auto" ? undefined : chartType
                ) as any;

                if (!generated) throw new Error("No data returned");

                await createExercise({
                    title: generated.title,
                    type: exerciseType as any,
                    prompt: generated.prompt,
                    image_url: generated.image_url,
                    chart_data: generated.chart_data,
                    is_published: true,
                });

                setItems(prev => prev.map(it => it.index === i ? { ...it, status: "done", title: generated.title } : it));
            } catch (err: any) {
                setItems(prev => prev.map(it => it.index === i ? { ...it, status: "error", error: err?.message || "Unknown error" } : it));
            }
        }

        setPhase("done");
    }

    const succeeded = items.filter(i => i.status === "done").length;
    const failed = items.filter(i => i.status === "error").length;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/exercises">
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200 hover:bg-white">
                            <ArrowLeft size={16} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Bulk Generate</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI-powered exercise factory</p>
                    </div>
                </div>

                {/* ── RUNNING ── */}
                {phase === "running" && <ProcessingCard items={items} count={count} />}

                {/* ── FORM ── */}
                {(phase === "form") && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                        <div className="bg-slate-900 px-8 py-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                <Sparkles size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Batch AI Generation</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All exercises auto-published</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">

                            {/* Exercise Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Exercise Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {EXERCISE_TYPES.map(opt => {
                                        const Icon = opt.icon;
                                        const sel = exerciseType === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setExerciseType(opt.value)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200",
                                                    sel ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", opt.color)}>
                                                    <Icon size={15} />
                                                </div>
                                                <span className={cn("text-sm font-black", sel ? "text-primary" : "text-slate-700")}>{opt.label}</span>
                                                {sel && <ChevronRight size={14} className="ml-auto text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chart Type */}
                            {isTask1 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Chart Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CHART_TYPE_OPTIONS.map(opt => {
                                            const Icon = opt.icon;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setChartType(opt.value)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all duration-200",
                                                        chartType === opt.value
                                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <Icon size={12} />
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Count */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Count</label>
                                    <span className="text-2xl font-black text-slate-900">{count}</span>
                                </div>
                                <input type="range" min={1} max={10} value={count}
                                    onChange={e => setCount(Number(e.target.value))}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <span>1</span>
                                    <span>10</span>
                                </div>
                            </div>

                            {/* Topic */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Topic / Theme <span className="text-slate-300 normal-case font-medium">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Environment, Technology, Transport..."
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm gap-3 shadow-lg"
                            >
                                <Sparkles size={18} />
                                Generate {count} Exercise{count > 1 ? "s" : ""}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── DONE — results card ── */}
                {phase === "done" && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Summary header */}
                        <div className={cn(
                            "px-8 py-8 text-center space-y-3",
                            failed === 0 ? "bg-emerald-600" : succeeded === 0 ? "bg-rose-600" : "bg-amber-500"
                        )}>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto border border-white/30">
                                {failed === 0
                                    ? <CheckCircle2 size={32} className="text-white" />
                                    : succeeded === 0
                                        ? <XCircle size={32} className="text-white" />
                                        : <Sparkles size={32} className="text-white" />
                                }
                            </div>
                            <p className="text-2xl font-black text-white">
                                {failed === 0 ? "All Done!" : succeeded === 0 ? "Generation Failed" : "Partially Done"}
                            </p>
                            <p className="text-sm font-bold text-white/70">
                                {succeeded} created &middot; {failed} failed &middot; {count} total
                            </p>
                        </div>

                        {/* Item results */}
                        <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                            {items.map(item => (
                                <div key={item.index} className="px-8 py-3.5 flex items-center gap-4">
                                    <div className="w-5 h-5 shrink-0">
                                        {item.status === "done"
                                            ? <CheckCircle2 size={16} className="text-emerald-500" />
                                            : <XCircle size={16} className="text-rose-400" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {item.status === "done"
                                            ? <p className="text-sm font-black text-slate-900 truncate">{item.title}</p>
                                            : <p className="text-sm font-bold text-rose-500 truncate">Failed — {item.error}</p>
                                        }
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">#{item.index + 1}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="p-8 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/admin/exercises")}
                                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                            >
                                View All Exercises
                            </Button>
                            <Button
                                onClick={() => { setPhase("form"); setItems([]); }}
                                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs gap-2"
                            >
                                <Sparkles size={14} />
                                Generate More
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
