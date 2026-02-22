"use client";

import { useState, useEffect, Suspense } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Exercise } from "@/types";
import { Plus, Search, FileText, Mic, Eye, Edit, Trash2 } from "lucide-react";
import { PulseLoader } from "@/components/global/pulse-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTeacherExercises } from "@/app/teacher/actions";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function TeacherExercisesContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [typeFilter, setTypeFilter] = useState<string>("all");

    useEffect(() => {
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
        fetchExercises();
    }, []);

    const filteredExercises = exercises.filter(e => {
        const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || e.type.startsWith(typeFilter);
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {[
                        { label: "All", value: "all" },
                        { label: "Writing", value: "writing" },
                        { label: "Speaking", value: "speaking" },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTypeFilter(opt.value)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                typeFilter === opt.value
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium w-64"
                        />
                    </div>
                    <Link href="/teacher/exercises/create/writing">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-sm text-sm gap-2">
                            <Plus size={18} />
                            New Writing
                        </Button>
                    </Link>
                    <Link href="/teacher/exercises/create/speaking">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm text-sm gap-2">
                            <Plus size={18} />
                            New Speaking
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Exercise Information</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Type</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Version</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Created By</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Created At</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing Exercises...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredExercises.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-20 text-center text-slate-400 font-bold">
                                    No exercises match your search criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExercises.map((exercise) => (
                                <TableRow key={exercise.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                exercise.type.startsWith('writing') ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {exercise.type.startsWith('writing') ? <FileText size={20} /> : <Mic size={20} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-black text-slate-900 leading-tight">
                                                    {exercise.title}
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-400 leading-tight mt-1">
                                                    ID: {exercise.id.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            exercise.type.startsWith('writing')
                                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                                : "bg-blue-50 text-blue-700 border-blue-100"
                                        )}>
                                            {exercise.type.replace("_", " ")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-black text-slate-900 font-mono">v{exercise.version}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            exercise.is_published
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            {exercise.is_published ? "Published" : "Draft"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                                                {exercise.creator?.full_name || exercise.creator?.email || "System"}
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {exercise.creator?.role || "Staff"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <p className="text-xs font-bold text-slate-500">
                                                {new Date(exercise.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {new Date(exercise.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit size={18} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
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
