"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Exercise } from "@/types";
import { Plus, Search } from "lucide-react";
import { PulseLoader } from "@/components/global/pulse-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTeacherExercises } from "@/app/teacher/actions";

export default function TeacherExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredExercises = exercises.filter(e =>
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center gap-2">
                <div className="relative mr-2">
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
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Writing
                    </Button>
                </Link>
                <Link href="/teacher/exercises/create/speaking">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Speaking
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading exercises...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredExercises.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-gray-500">No exercises found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredExercises.map((exercise) => (
                                <TableRow key={exercise.id}>
                                    <TableCell className="font-medium">{exercise.title}</TableCell>
                                    <TableCell className="capitalize">{exercise.type.replace("_", " ")}</TableCell>
                                    <TableCell>v{exercise.version}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${exercise.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {exercise.is_published ? "Published" : "Draft"}
                                        </span>
                                    </TableCell>
                                    <TableCell>{exercise.created_at}</TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
