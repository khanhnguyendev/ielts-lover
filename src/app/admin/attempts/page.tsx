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
import {
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Mic,
    ChevronRight,
    Search
} from "lucide-react";
import { getAdminAttempts } from "../actions";
import { PulseLoader } from "@/components/global/PulseLoader";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AttemptsPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAttempts();
    }, []);

    async function fetchAttempts() {
        setIsLoading(true);
        try {
            const data = await getAdminAttempts();
            setAttempts(data);
        } catch (error) {
            console.error("Failed to fetch attempts:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getExerciseIcon = (type: string) => {
        if (type?.startsWith('writing')) return <FileText className="h-3.5 w-3.5 text-purple-600" />;
        if (type?.startsWith('speaking')) return <Mic className="h-3.5 w-3.5 text-blue-600" />;
        return <AlertCircle className="h-3.5 w-3.5 text-slate-400" />;
    };

    const filteredAttempts = attempts.filter(a =>
        a.user_profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.exercise_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black font-outfit text-slate-900">Attempts Audit</h1>
                    <p className="text-muted-foreground font-medium">Review and monitor user exercise submissions.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter by email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Student</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Exercise</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Score</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Date & Time</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Scanning Audit Logs...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAttempts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-20 text-center text-slate-400 font-bold">
                                    No attempt records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAttempts.map((attempt) => (
                                <TableRow key={attempt.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase text-[10px]">
                                                {attempt.user_profiles?.email?.substring(0, 2)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{attempt.user_profiles?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                {getExerciseIcon(attempt.exercises?.type)}
                                            </div>
                                            <div className="flex flex-col">
                                                <Link
                                                    href={`/admin/exercises?search=${attempt.exercise_id}`}
                                                    className="text-[11px] font-black uppercase tracking-wider text-slate-400 leading-none mb-1 hover:text-primary transition-colors"
                                                >
                                                    ID: {attempt.exercise_id?.substring(0, 8)}
                                                </Link>
                                                <span className="text-sm font-bold text-slate-900 leading-none italic">
                                                    {attempt.exercises?.type?.startsWith('writing') ? 'Writing Task' : 'Speaking Task'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            attempt.state === "EVALUATED"
                                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                : attempt.state === "SUBMITTED"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                        )}>
                                            {attempt.state === "EVALUATED" && <CheckCircle size={12} />}
                                            {attempt.state === "SUBMITTED" && <Clock size={12} />}
                                            {attempt.state}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className={cn(
                                                "text-sm font-black",
                                                attempt.score ? "text-primary" : "text-slate-300"
                                            )}>
                                                {attempt.score || "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-700">
                                                {new Date(attempt.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400">
                                                {new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Link href={`/dashboard/reports/${attempt.id}`} target="_blank">
                                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-slate-400 hover:text-primary hover:bg-primary/5">
                                                <Eye size={14} />
                                                View Report
                                                <ChevronRight size={14} />
                                            </Button>
                                        </Link>
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
