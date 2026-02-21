"use client"

import { usePathname } from "next/navigation"

const TEACHER_ROUTE_MAP: Record<string, string> = {
    "/teacher": "Dashboard",
    "/teacher/students": "My Students",
    "/teacher/exercises": "Exercises",
    "/teacher/exercises/create/writing": "Create Writing Exercise",
    "/teacher/exercises/create/speaking": "Create Speaking Exercise",
    "/teacher/credit-requests": "Credit Requests",
}

export function TeacherDynamicTitle() {
    const pathname = usePathname()

    const getTitle = () => {
        if (TEACHER_ROUTE_MAP[pathname]) return TEACHER_ROUTE_MAP[pathname]

        if (pathname.startsWith("/teacher/students/")) return "Student Progress"

        return "Teacher Hub"
    }

    const title = getTitle()

    return (
        <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-outfit uppercase">
                {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 opacity-60 group">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-hover:text-primary">
                    Teacher Hub
                </span>
                <span className="text-[9px] font-bold text-slate-300">/</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                    {title}
                </span>
            </div>
        </div>
    )
}
