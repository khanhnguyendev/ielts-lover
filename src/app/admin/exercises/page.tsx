"use client";

import { useState, useEffect, Suspense } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { getExercises } from "@/app/actions";
import { deleteExercise } from "@/app/admin/actions";
import { Exercise, ExerciseType } from "@/types";

import { Plus, Edit, Trash2, Eye, Search, FileText, Mic, AlertTriangle, Sparkles } from "lucide-react";
import { PulseLoader } from "@/components/global/pulse-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatTime } from "@/lib/utils";

function ExercisesContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function fetchExercises() {
        setIsLoading(true);
        try {
            const types: ExerciseType[] = ["writing_task1", "writing_task2", "speaking_part1", "speaking_part2", "speaking_part3"];
            const allExercises = await Promise.all(types.map(t => getExercises(t)));
            setExercises(allExercises.flat());
        } catch (error) {
            console.error("Failed to fetch exercises:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchExercises();
    }, []);

    async function confirmDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteExercise(deleteTarget.id);
            await fetchExercises();
        } catch (error) {
            console.error("Failed to delete exercise:", error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    const filteredExercises = exercises.filter(e => {
        const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || e.type.startsWith(typeFilter);
        return matchesSearch && matchesType;
    });

    const columns: DataTableColumn<Exercise>[] = [
        {
            key: "info",
            header: "Exercise Information",
            render: (exercise) => (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                        exercise.type.startsWith('writing') ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    )}>
                        {exercise.type.startsWith('writing') ? <FileText size={20} /> : <Mic size={20} />}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                            {exercise.title}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-tight mt-1">
                            ID: {exercise.id}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: "type",
            header: "Type",
            align: "center",
            render: (exercise) => (
                <div className="flex flex-col items-center gap-1.5">
                    <div className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        exercise.type.startsWith('writing')
                            ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                            : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                    )}>
                        {exercise.type.replace("_", " ")}
                    </div>
                    {exercise.type === "writing_task1" && (() => {
                        const rawType: string | undefined = exercise.chart_data?.type || exercise.chart_data?.chart_type;
                        const CHART_LABELS: Record<string, string> = {
                            "line_graph": "📈 Line Graph",
                            "bar_chart": "📊 Bar Chart",
                            "pie_chart": "🥧 Pie Chart",
                            "table": "📋 Table",
                            "process_diagram": "🔄 Process",
                            "map": "🗺️ Map",
                            "mixed_chart": "📉 Mixed",
                            "bar": "📊 Bar Chart",
                            "line": "📈 Line Graph",
                            "pie": "🥧 Pie Chart",
                            "doughnut": "🥧 Doughnut",
                        };
                        if (!rawType || !CHART_LABELS[rawType]) return null;
                        return (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                                {CHART_LABELS[rawType]}
                            </span>
                        );
                    })()}
                </div>
            )
        },
        {
            key: "version",
            header: "Version",
            align: "center",
            render: (exercise) => (
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">v{exercise.version}</span>
            )
        },
        {
            key: "status",
            header: "Status",
            align: "center",
            render: (exercise) => (
                <div className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    exercise.is_published
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                )}>
                    {exercise.is_published ? "Published" : "Draft"}
                </div>
            )
        },
        {
            key: "creator",
            header: "Created By",
            align: "center",
            render: (exercise) => (
                <div className="flex flex-col items-center gap-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate max-w-[120px]">
                        {exercise.creator?.full_name || exercise.creator?.email || "System"}
                    </p>
                    <div className={cn(
                        "mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        exercise.creator?.role === 'admin'
                            ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            : exercise.creator?.role === 'teacher'
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
                    )}>
                        {exercise.creator?.role || "Staff"}
                    </div>
                </div>
            )
        },
        {
            key: "date",
            header: "Created At",
            align: "center",
            render: (exercise) => (
                <div className="flex flex-col items-center gap-0.5">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {formatDate(exercise.created_at)}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        {formatTime(exercise.created_at)}
                    </p>
                </div>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (exercise) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary transition-colors"
                        onClick={() => setSelectedExercise(exercise)}
                    >
                        <Eye size={18} />
                    </Button>
                    <Link href={`/admin/exercises/create/${exercise.type.startsWith('writing') ? 'writing' : 'speaking'}?duplicate=${exercise.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit size={18} />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 transition-colors"
                        onClick={() => setDeleteTarget(exercise)}
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 p-6">
            <DataTable
                data={filteredExercises}
                columns={columns}
                rowKey={(e) => e.id}
                isLoading={isLoading}
                loadingText="Syncing Exercises..."
                pageSize={10}
                toolbar={
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                        <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                            {[
                                { label: "All", value: "all" },
                                { label: "Writing", value: "writing" },
                                { label: "Speaking", value: "speaking" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTypeFilter(opt.value)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        typeFilter === opt.value
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-black/5 ring-1 ring-black/5"
                                            : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Exercises..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-6 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest w-64 shadow-inner"
                                />
                            </div>
                            <Link href="/admin/exercises/bulk-generate">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20 text-[10px] gap-2 px-5 h-10">
                                    <Sparkles size={16} />
                                    Bulk
                                </Button>
                            </Link>
                            <Link href="/admin/exercises/create/writing">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-purple-500/20 text-[10px] gap-2 px-5 h-10">
                                    <Plus size={16} />
                                    Writing
                                </Button>
                            </Link>
                            <Link href="/admin/exercises/create/speaking">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/20 text-[10px] gap-2 px-5 h-10">
                                    <Plus size={16} />
                                    Speaking
                                </Button>
                            </Link>
                        </div>
                    </div>
                }
                emptyState={{
                    icon: <Search className="h-8 w-8 text-slate-300" />,
                    title: "No matching exercises",
                    description: "We couldn't find any exercises matching your current search or filter criteria."
                }}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <DialogHeader>
                                    <DialogTitle className="text-base font-black text-slate-900">Delete Exercise</DialogTitle>
                                    <DialogDescription className="text-sm text-slate-500 mt-1">
                                        Are you sure you want to delete{" "}
                                        <span className="font-semibold text-slate-700">&ldquo;{deleteTarget?.title}&rdquo;</span>?{" "}
                                        This exercise will be archived and hidden from students.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                            >
                                {isDeleting ? "Deleting..." : "Delete Exercise"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
                <DialogContent className="sm:max-w-3xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    selectedExercise?.type.startsWith('writing') ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                    {selectedExercise?.type.startsWith('writing') ? <FileText size={20} /> : <Mic size={20} />}
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black font-outfit text-white leading-tight">
                                        {selectedExercise?.title}
                                    </DialogTitle>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                                        ID: {selectedExercise?.id}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exercise Prompt</h4>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-700 leading-relaxed font-medium">
                                {selectedExercise?.prompt}
                            </div>
                        </section>

                        {selectedExercise?.image_url && (
                            <section className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Image / Chart</h4>
                                <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white p-4">
                                    <img
                                        src={selectedExercise.image_url}
                                        alt={selectedExercise.title}
                                        className="max-h-[300px] mx-auto object-contain rounded-xl"
                                    />
                                </div>
                            </section>
                        )}

                        {selectedExercise?.chart_data && (
                            <section className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Points (JSON)</h4>
                                <pre className="bg-slate-900 text-emerald-400 p-6 rounded-2xl text-[11px] font-mono overflow-x-auto shadow-inner">
                                    {JSON.stringify(selectedExercise.chart_data, null, 2)}
                                </pre>
                            </section>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ExercisesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <PulseLoader size="lg" color="primary" />
            </div>
        }>
            <ExercisesContent />
        </Suspense>
    );
}
