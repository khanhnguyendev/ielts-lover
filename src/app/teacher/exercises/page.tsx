"use client";

import { useState, useEffect, Suspense } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Exercise } from "@/types";
import { Plus, Search, FileText, Mic, Eye, Edit, Trash2 } from "lucide-react";
import { PulseLoader } from "@/components/global/pulse-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTeacherExercises, deleteTeacherExercise } from "@/app/teacher/actions";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function TeacherExercisesContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    async function fetchExercises() {
        setIsLoading(true);
        try {
            const all = await getTeacherExercises();
            setExercises(all);
        } catch (error) {
            console.error("Failed to fetch exercises:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchExercises();
    }, []);

    async function handleDelete(id: string, title: string) {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This exercise will be archived and hidden from students.`)) {
            return;
        }

        try {
            await deleteTeacherExercise(id);
            await fetchExercises();
        } catch (error) {
            console.error("Failed to delete exercise:", error);
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
                        exercise.type.startsWith('writing') ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                    )}>
                        {exercise.type.startsWith('writing') ? <FileText size={20} /> : <Mic size={20} />}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-black text-slate-900 leading-tight">
                            {exercise.title}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 leading-tight mt-1">
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
                <div className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    exercise.type.startsWith('writing')
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                    {exercise.type.replace("_", " ")}
                </div>
            )
        },
        {
            key: "version",
            header: "Version",
            align: "center",
            render: (exercise) => (
                <span className="text-sm font-black text-slate-900 font-mono">v{exercise.version}</span>
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
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
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
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {exercise.creator?.full_name || exercise.creator?.email || "System"}
                    </p>
                    <div className={cn(
                        "mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        exercise.creator?.role === 'admin'
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : exercise.creator?.role === 'teacher'
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
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
                    <p className="text-xs font-bold text-slate-500">
                        {new Date(exercise.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {new Date(exercise.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
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
                    <Link href={`/teacher/exercises/create/${exercise.type.startsWith('writing') ? 'writing' : 'speaking'}?duplicate=${exercise.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit size={18} />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 transition-colors"
                        onClick={() => handleDelete(exercise.id, exercise.title)}
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <DataTable
                data={filteredExercises}
                columns={columns}
                rowKey={(e) => e.id}
                isLoading={isLoading}
                loadingText="Syncing Exercises..."
                pageSize={8}
                toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by Title or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest w-64 shadow-inner"
                                />
                            </div>
                            <Link href="/teacher/exercises/create/writing">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-purple-500/20 text-[10px] gap-2 px-4 h-10">
                                    <Plus size={16} />
                                    Writing
                                </Button>
                            </Link>
                            <Link href="/teacher/exercises/create/speaking">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/20 text-[10px] gap-2 px-4 h-10">
                                    <Plus size={16} />
                                    Speaking
                                </Button>
                            </Link>
                        </div>
                    </div>
                }
                emptyState={{
                    icon: <Search className="h-8 w-8 text-slate-300" />,
                    title: "No exercises found",
                    description: "Adjust filters or search parameters to find what you're looking for."
                }}
            />

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

export default function TeacherExercisesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <PulseLoader size="lg" color="primary" />
            </div>
        }>
            <TeacherExercisesContent />
        </Suspense>
    );
}
