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
import { Eye, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { getAllAttempts } from "@/app/actions";
import { PulseLoader } from "@/components/global/PulseLoader";

export default function AttemptsPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAttempts() {
            setIsLoading(true);
            try {
                const data = await getAllAttempts();
                setAttempts(data);
            } catch (error) {
                console.error("Failed to fetch attempts:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAttempts();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Attempts Audit</h2>
                <p className="text-gray-500">Review user submissions and AI evaluation results.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Exercise</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Fetching records...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : attempts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">No attempts found.</TableCell>
                            </TableRow>
                        ) : (
                            attempts.map((attempt) => (
                                <TableRow key={attempt.id}>
                                    <TableCell className="font-medium">{attempt.user}</TableCell>
                                    <TableCell>{attempt.exercise}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {attempt.state === "EVALUATED" ? (
                                                <CheckCircle size={14} className="text-green-500" />
                                            ) : attempt.state === "SUBMITTED" ? (
                                                <Clock size={14} className="text-blue-500" />
                                            ) : (
                                                <AlertCircle size={14} className="text-gray-400" />
                                            )}
                                            <span className="text-xs font-medium capitalize">{attempt.state.toLowerCase()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{attempt.score || "-"}</TableCell>
                                    <TableCell className="text-gray-500 text-xs">{attempt.created_at}</TableCell>
                                    <TableCell className="text-right">
                                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
