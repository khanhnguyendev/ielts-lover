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
import { getExercises } from "@/app/actions";
import { Exercise, ExerciseType } from "@/types";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { PulseLoader } from "@/components/global/PulseLoader";

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchExercises() {
            setIsLoading(true);
            try {
                const types: ExerciseType[] = ["writing_task1", "writing_task2", "speaking_part1", "speaking_part2", "speaking_part3"]; // Fetching common writing types
                const allExercises = await Promise.all(types.map(t => getExercises(t)));
                setExercises(allExercises.flat());
            } catch (error) {
                console.error("Failed to fetch exercises:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchExercises();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Exercises Management</h2>
                    <p className="text-gray-500">Create and manage IELTS writing and speaking exercises.</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    <Plus size={20} />
                    <span>New Exercise</span>
                </button>
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
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Updating exercises...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : exercises.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">No exercises found.</TableCell>
                            </TableRow>
                        ) : (
                            exercises.map((exercise) => (
                                <TableRow key={exercise.id}>
                                    <TableCell className="font-medium">{exercise.title}</TableCell>
                                    <TableCell className="capitalize">{exercise.type.replace("_", " ")}</TableCell>
                                    <TableCell>v{exercise.version}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${exercise.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {exercise.is_published ? "Published" : "Draft"}
                                        </span>
                                    </TableCell>
                                    <TableCell>{exercise.created_at}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
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
