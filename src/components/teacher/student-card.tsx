"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Clock, FileText, Target } from "lucide-react"
import type { StudentSummary } from "@/services/teacher.service"

function getInitials(student: StudentSummary): string {
    if (student.full_name) {
        return student.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }
    return student.email.substring(0, 2).toUpperCase()
}

function formatLastSeen(dateStr: string | null): string {
    if (!dateStr) return "Never"
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

export function StudentCard({ student }: { student: StudentSummary }) {
    return (
        <Link href={`/teacher/students/${student.id}`}>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-slate-100">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xs">
                                {getInitials(student)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">
                                {student.full_name || student.email.split("@")[0]}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">{student.email}</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attempts</p>
                            <p className="text-sm font-black text-slate-900">{student.attempt_count}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                        <Target className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Score</p>
                            <p className="text-sm font-black text-slate-900">{student.avg_score ?? "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Active</p>
                            <p className="text-sm font-black text-slate-900">{formatLastSeen(student.last_attempt_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
